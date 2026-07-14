import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, JwtPayload } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;

    const { id } = authResult as JwtPayload;

    const addresses = await prisma.address.findMany({
      where: { userId: id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('List addresses error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;

    const { id } = authResult as JwtPayload;
    const body = await request.json();
    const { name, phone, street, city, state, pincode, isDefault } = body;

    if (!name || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json({ message: 'All address fields are required' }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: id,
        name,
        phone,
        street,
        city,
        state,
        pincode,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
