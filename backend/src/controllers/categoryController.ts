import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function listCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
        children: {
          include: { _count: { select: { products: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.json(categories);
  } catch (error) {
    console.error('List categories error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getCategoryBySlug(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        products: {
          where: { isPublished: true },
          include: {
            variants: true,
            reviews: { select: { rating: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const productsWithRating = category.products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
      const { reviews, ...rest } = product;
      return { ...rest, avgRating, reviewCount: ratings.length };
    });

    return res.json({ ...category, products: productsWithRating });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
