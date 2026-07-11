import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, JwtPayload } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as JwtPayload;

    const { productId, rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const existing = await prisma.review.findFirst({
      where: { userId: payload.id, productId },
    });

    let review;
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment },
        include: { user: { select: { id: true, name: true, image: true } } },
      });
    } else {
      review = await prisma.review.create({
        data: { userId: payload.id, productId, rating, comment },
        include: { user: { select: { id: true, name: true, image: true } } },
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('createReview error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
