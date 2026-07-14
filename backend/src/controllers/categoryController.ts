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

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, slug, description, image, parentId } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: 'A category with this slug already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
      },
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;
    const { name, slug: newSlug, description, image, parentId } = req.body;

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (newSlug && newSlug !== slug) {
      const slugConflict = await prisma.category.findUnique({ where: { slug: newSlug } });
      if (slugConflict) {
        return res.status(409).json({ message: 'A category with this slug already exists' });
      }
    }

    const category = await prisma.category.update({
      where: { slug },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(newSlug !== undefined ? { slug: newSlug } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(image !== undefined ? { image: image || null } : {}),
        ...(parentId !== undefined ? { parentId: parentId || null } : {}),
      },
    });

    return res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;

    const existing = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (existing._count.products > 0) {
      return res.status(400).json({ message: 'Cannot delete category with existing products' });
    }

    await prisma.category.delete({ where: { slug } });

    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
