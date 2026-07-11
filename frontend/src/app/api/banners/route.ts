import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('List banners error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    if (authResult.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { title, subtitle, image, link, active, order } = await request.json();

    if (!title || !image) {
      return NextResponse.json({ message: 'Title and image are required' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        image,
        link,
        active: active ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
