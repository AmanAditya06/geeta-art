import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 10));
    const skip = (page - 1) * limit;

    const [reviews, total, allRatings] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      }),
    ]);

    const reviewCount = total;
    const avgRating =
      reviewCount > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    const ratingDistribution: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = allRatings.filter((r) => r.rating === i).length;
    }

    return NextResponse.json({
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
      ratingDistribution,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getProductReviews error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
