import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, JwtPayload } from '@/lib/api-auth';

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const obj: Record<string, string> = {};
    for (const s of settings) {
      obj[s.key] = s.value;
    }
    return NextResponse.json(obj);
  } catch (error) {
    console.error('getSettings error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as JwtPayload;

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, string>;

    for (const [key, value] of Object.entries(body)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    const settings = await prisma.siteSetting.findMany();
    const obj: Record<string, string> = {};
    for (const s of settings) {
      obj[s.key] = s.value;
    }

    return NextResponse.json(obj);
  } catch (error) {
    console.error('updateSettings error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
