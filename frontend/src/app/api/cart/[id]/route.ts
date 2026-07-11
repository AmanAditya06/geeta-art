import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, JwtPayload } from '@/lib/api-auth';

const productSelect = {
  id: true, name: true, slug: true, price: true, images: true, stock: true, isPublished: true,
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as JwtPayload;
    const { id } = await params;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ message: 'Quantity must be at least 1' }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findFirst({ where: { id, userId: payload.id } });
    if (!cartItem) {
      return NextResponse.json({ message: 'Cart item not found' }, { status: 404 });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: { select: productSelect }, variant: true },
    });

    return NextResponse.json({
      ...updated,
      product: {
        ...updated.product,
        images: typeof updated.product.images === 'string'
          ? JSON.parse(updated.product.images)
          : updated.product.images,
      },
    });
  } catch (error) {
    console.error('updateCartItem error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as JwtPayload;
    const { id } = await params;

    const cartItem = await prisma.cartItem.findFirst({ where: { userId: payload.id, productId: id } });
    if (!cartItem) {
      return NextResponse.json({ message: 'Cart item not found' }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: cartItem.id } });
    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('removeCartItem error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
