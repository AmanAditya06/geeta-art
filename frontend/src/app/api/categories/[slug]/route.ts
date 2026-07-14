import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin, JwtPayload } from '@/lib/api-auth';
import { categorySchema } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        products: {
          where: { isPublished: true },
          include: {
            reviews: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;

    const adminCheck = requireAdmin(authResult as JwtPayload);
    if (adminCheck) return adminCheck;

    const { slug } = await params;

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, slug: newSlug, description, image, parentId } = parsed.data;

    if (newSlug && newSlug !== slug) {
      const slugConflict = await prisma.category.findUnique({ where: { slug: newSlug } });
      if (slugConflict) {
        return NextResponse.json({ message: 'A category with this slug already exists' }, { status: 409 });
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

    return NextResponse.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;

    const adminCheck = requireAdmin(authResult as JwtPayload);
    if (adminCheck) return adminCheck;

    const { slug } = await params;

    const existing = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json({ message: 'Cannot delete category with existing products. Move or delete them first.' }, { status: 400 });
    }

    await prisma.category.delete({ where: { slug } });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
