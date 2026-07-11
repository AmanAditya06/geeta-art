import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getProductReviews(req: Request, res: Response) {
  try {
    const productId = req.params.productId as string;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    const ratings = reviews.map((r) => r.rating);
    const allRatings = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });
    const allRatingValues = allRatings.map((r) => r.rating);
    const avgRating = allRatingValues.length > 0
      ? allRatingValues.reduce((a, b) => a + b, 0) / allRatingValues.length
      : null;

    return res.json({
      reviews,
      avgRating,
      reviewCount: total,
      ratingDistribution: {
        1: allRatingValues.filter((r) => r === 1).length,
        2: allRatingValues.filter((r) => r === 2).length,
        3: allRatingValues.filter((r) => r === 3).length,
        4: allRatingValues.filter((r) => r === 4).length,
        5: allRatingValues.filter((r) => r === 5).length,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createReview(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: 'ProductId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingReview = await prisma.review.findFirst({
      where: { productId, userId },
    });

    if (existingReview) {
      const review = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment: comment || null },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });
      return res.json(review);
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        comment: comment || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
