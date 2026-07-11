import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin, JwtPayload } from '@/lib/api-auth';
import { productSchema, productUpdateSchema } from '@/lib/validation';

function parseImages(product: { images: string | string[] }): string[] {
  if (typeof product.images === 'string') {
    try {
      return JSON.parse(product.images);
    } catch {
      return [];
    }
  }
  return product.images;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> },
) {
  try {
    const { param } = await params;

    const product = await prisma.product.findUnique({
      where: { slug: param },
      include: {
        category: true,
        variants: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      images: parseImages(product),
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> },
) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;

    const adminCheck = requireAdmin(authResult as JwtPayload);
    if (adminCheck) return adminCheck;

    const { param } = await params;

    const existing = await prisma.product.findUnique({ where: { id: param } });
    if (!existing) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { variants, images, categoryId, price, comparePrice, ...data } = parsed.data;

    const product = await prisma.$transaction(async (tx) => {
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: param } });
      }

      return tx.product.update({
        where: { id: param },
        data: {
          ...(data as any),
          ...(price !== undefined ? { price } : {}),
          ...(comparePrice !== undefined ? { comparePrice } : {}),
          ...(images !== undefined ? { images: JSON.stringify(images) } : {}),
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          ...(variants && variants.length > 0
            ? {
                variants: {
                  create: variants.map((v: { name: string; price: number; stock?: number; sku?: string }) => ({
                    name: v.name,
                    price: v.price,
                    stock: v.stock ?? 0,
                    sku: v.sku,
                  })),
                },
              }
            : {}),
        },
        include: {
          category: true,
          variants: true,
        },
      });
    });

    return NextResponse.json({
      ...product,
      images: parseImages(product),
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> },
) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;

    const adminCheck = requireAdmin(authResult as JwtPayload);
    if (adminCheck) return adminCheck;

    const { param } = await params;

    const existing = await prisma.product.findUnique({ where: { id: param } });
    if (!existing) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: param } });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
