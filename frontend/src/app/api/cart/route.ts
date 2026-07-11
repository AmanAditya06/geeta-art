import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, JwtPayload } from '@/lib/api-auth';

const productSelect = {
  id: true, name: true, slug: true, price: true, images: true, stock: true, isPublished: true,
};

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as JwtPayload;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: payload.id },
      include: { product: { select: productSelect }, variant: true },
      orderBy: { createdAt: 'desc' },
    });

    const items = cartItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: typeof item.product.images === 'string'
          ? JSON.parse(item.product.images)
          : item.product.images,
      },
    }));

    const total = cartItems.reduce((sum, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return sum + price * item.quantity;
    }, 0);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error('getCart error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as JwtPayload;

    const { productId, variantId, quantity } = await request.json();
    if (!productId || !quantity) {
      return NextResponse.json({ message: 'ProductId and quantity are required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || variant.productId !== productId) {
        return NextResponse.json({ message: 'Variant not found' }, { status: 404 });
      }
    }

    const existing = await prisma.cartItem.findFirst({
      where: { userId: payload.id, productId, variantId: variantId || null },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: { select: productSelect }, variant: true },
      });
      return NextResponse.json(updated);
    }

    const cartItem = await prisma.cartItem.create({
      data: { userId: payload.id, productId, variantId: variantId || null, quantity },
      include: { product: { select: productSelect }, variant: true },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('addToCart error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
