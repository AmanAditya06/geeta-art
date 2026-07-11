import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
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

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.id;

    const body = await request.json();
    const { items, shippingAddress, paymentMethod, paymentId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Order must contain at least one item' }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ message: 'Shipping address is required' }, { status: 400 });
    }

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ message: `Product ${item.productId} not found` }, { status: 404 });
      }
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant) {
          return NextResponse.json({ message: `Variant ${item.variantId} not found` }, { status: 404 });
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json({ message: `Insufficient stock for variant ${variant.name}` }, { status: 400 });
        }
      } else if (product.stock < item.quantity) {
        return NextResponse.json({ message: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
    }

    const shippingAddrStr = typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress);

    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData: any[] = [];

      for (const item of items) {
        let price = 0;
        if (item.variantId) {
          const variant = await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
          price = variant.price;
        } else {
          const product = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
          price = product.price;
        }
        total += price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          price,
        });
      }

      const created = await tx.order.create({
        data: {
          userId,
          total,
          shippingAddress: shippingAddrStr,
          paymentMethod: paymentMethod || null,
          paymentId: paymentId || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      return created;
    });

    await prisma.cartItem.deleteMany({ where: { userId } });

    let razorpayOrderId: string | null = null;
    try {
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(order.total * 100),
        currency: 'INR',
        receipt: order.id,
      });
      razorpayOrderId = rzpOrder.id;
    } catch (err) {
      console.error('Razorpay order creation failed', err);
    }

    const parsed = parseOrder(order);

    return NextResponse.json({ order: parsed, razorpayOrderId }, { status: 201 });
  } catch (error) {
    console.error('createOrder error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.id;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    const parsedOrders = orders.map(parseOrder);

    return NextResponse.json({
      orders: parsedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('listUserOrders error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
