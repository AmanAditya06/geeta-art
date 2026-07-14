import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const sortMap: Record<string, Record<string, 'asc' | 'desc'>> = {
  newest: { createdAt: 'desc' },
  'price-asc': { price: 'asc' },
  'price-desc': { price: 'desc' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12', 10)));
    const sort = searchParams.get('sort') || 'newest';
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('categorySlug');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (categorySlug) where.category = { slug: categorySlug };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (featured === 'true') where.isFeatured = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    const orderBy = sortMap[sort] || { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          variants: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const parsed = products.map((product) => ({
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
    }));

    return NextResponse.json({
      products: parsed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('List products error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error?.message || String(error) }, { status: 500 });
  }
}
