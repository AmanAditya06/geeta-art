import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin, JwtPayload } from '@/lib/api-auth';
import { categorySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
        children: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('List categories error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;

    const adminCheck = requireAdmin(authResult as JwtPayload);
    if (adminCheck) return adminCheck;

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, slug, description, image, parentId } = parsed.data;

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ message: 'A category with this slug already exists' }, { status: 409 });
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

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
