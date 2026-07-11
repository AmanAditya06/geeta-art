import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/api-auth';

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

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const adminCheck = requireAdmin(authResult);
    if (adminCheck) return adminCheck;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  price: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
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
    console.error('listAllOrders error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
