import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.DATABASE_URL || 'NOT SET';
    const maskedUrl = url.replace(/:\w+@/, ':***@');

    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();

    return NextResponse.json({
      status: 'ok',
      databaseUrl: maskedUrl,
      productCount,
      categoryCount,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error?.message || String(error),
      code: error?.code || 'unknown',
      databaseUrl: process.env.DATABASE_URL ? 'set (masked)' : 'NOT SET',
    }, { status: 500 });
  }
}
