import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, JwtPayload } from '@/lib/api-auth';

const productSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  comparePrice: true,
  images: true,
  stock: true,
  isPublished: true,
};

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as JwtPayload;

    const items = await prisma.wishlistItem.findMany({
      where: { userId: payload.id },
      include: {
        product: {
          select: {
            ...productSelect,
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const itemsWithRating = items.map((item) => {
      const reviews = item.product.reviews ?? [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
            reviewCount
          : 0;

      return {
        ...item,
        product: {
          ...item.product,
          images:
            typeof item.product.images === 'string'
              ? JSON.parse(item.product.images)
              : item.product.images,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount,
        },
      };
    });

    return NextResponse.json(itemsWithRating);
  } catch (error) {
    console.error('getWishlist error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as JwtPayload;

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: payload.id, productId } },
    });

    if (existing) {
      const item = await prisma.wishlistItem.findUnique({
        where: { id: existing.id },
        include: { product: { select: productSelect } },
      });
      return NextResponse.json(item);
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: { userId: payload.id, productId },
      include: { product: { select: productSelect } },
    });

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
    console.error('addToWishlist error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
