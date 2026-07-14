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

    const existing = await prisma.product.findFirst({ where: { OR: [{ id: param }, { slug: param }] } });
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
      if (variants !== undefined && variants !== null) {
        if (variants.length === 0) {
          await tx.productVariant.deleteMany({ where: { productId: existing.id } });
        } else {
          const existingVariants = await tx.productVariant.findMany({ where: { productId: existing.id } });
          const existingIds = new Set(existingVariants.map((v) => v.id));
          const incomingIds = new Set(variants.filter((v: any) => v.id).map((v: any) => v.id));

          for (const id of existingIds) {
            if (!incomingIds.has(id)) {
              await tx.productVariant.delete({ where: { id } });
            }
          }

          for (const v of variants) {
            if ((v as any).id && existingIds.has((v as any).id)) {
              await tx.productVariant.update({
                where: { id: (v as any).id },
                data: { name: v.name, price: v.price, stock: v.stock ?? 0, sku: v.sku },
              });
            } else {
              await tx.productVariant.create({
                data: {
                  productId: existing.id,
                  name: v.name,
                  price: v.price,
                  stock: v.stock ?? 0,
                  sku: v.sku,
                },
              });
            }
          }
        }
      }

      return tx.product.update({
        where: { id: existing.id },
        data: {
          ...(data as any),
          ...(price !== undefined ? { price } : {}),
          ...(comparePrice !== undefined ? { comparePrice } : {}),
          ...(images !== undefined ? { images: JSON.stringify(images) } : {}),
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
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

    const existing = await prisma.product.findFirst({ where: { OR: [{ id: param }, { slug: param }] } });
    if (!existing) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
