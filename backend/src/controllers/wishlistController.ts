import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getWishlist(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
            stock: true,
            isPublished: true,
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const itemsWithRating = items.map((item) => {
      const ratings = item.product.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
      const { reviews, ...product } = item.product;
      return { ...item, product: { ...product, avgRating, reviewCount: ratings.length } };
    });

    return res.json(itemsWithRating);
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function addToWishlist(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'ProductId is required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      return res.json(existing);
    }

    const item = await prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true, images: true },
        },
      },
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function removeFromWishlist(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const productId = req.params.productId as string;

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });

    return res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
