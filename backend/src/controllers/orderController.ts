import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

function parseOrder(order: any) {
  if (typeof order.shippingAddress === 'string') {
    try { order.shippingAddress = JSON.parse(order.shippingAddress); } catch { order.shippingAddress = {}; }
  }
  if (order.items && Array.isArray(order.items)) {
    order.items = order.items.map((item: any) => {
      if (item.product && typeof item.product.images === 'string') {
        try { item.product.images = JSON.parse(item.product.images); } catch { item.product.images = []; }
      }
      return item;
    });
  }
  return order;
}

export async function createOrder(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { items, shippingAddress, paymentMethod, paymentId } = req.body;

    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({ message: 'Items and shipping address are required' });
    }

    const orderItemsData: { productId: string; variantId: string | null; quantity: number; price: number }[] = [];
    let total = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.isPublished) {
        return res.status(400).json({ message: `${product.name} is not available` });
      }

      let price = product.price;
      let stock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return res.status(404).json({ message: `Variant ${item.variantId} not found` });
        }
        price = variant.price;
        stock = variant.stock;
      }

      if (stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price,
      });

      total += price * item.quantity;
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const item of orderItemsData) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          shippingAddress: JSON.stringify(shippingAddress),
          paymentMethod: paymentMethod || null,
          paymentId: paymentId || null,
          items: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, images: true, slug: true } },
              variant: true,
            },
          },
        },
      });

      return newOrder;
    });

    await prisma.cartItem.deleteMany({ where: { userId } });

    let razorpayOrder = null;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: total * 100,
        currency: 'INR',
        receipt: order.id,
      });
    } catch (rpErr) {
      console.error('Razorpay order creation failed:', rpErr);
    }

    const parsed = parseOrder(order);
    return res.status(201).json({ ...parsed, razorpayOrderId: razorpayOrder?.id || null });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function listUserOrders(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, images: true, slug: true } },
              variant: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return res.json({
      orders: orders.map(parseOrder),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List user orders error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function listAllOrders(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, images: true, slug: true } },
              variant: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      orders: orders.map(parseOrder),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List all orders error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            variant: true,
          },
        },
      },
    });

    if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
      const orderWithItems = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (orderWithItems) {
        for (const item of orderWithItems.items) {
          if (item.variantId) {
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
    }

    return res.json(parseOrder(order));
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const orderId = req.params.id as string;
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = require('crypto')
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentId: razorpayPaymentId,
      },
    });

    return res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ message: 'Payment verification failed' });
  }
}
