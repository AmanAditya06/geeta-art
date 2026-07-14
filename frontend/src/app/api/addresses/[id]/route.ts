import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, JwtPayload } from '@/lib/api-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;

    const { id: userId } = authResult as JwtPayload;
    const { id } = await params;

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, phone, street, city, state, pincode, isDefault } = body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(street !== undefined ? { street } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(state !== undefined ? { state } : {}),
        ...(pincode !== undefined ? { pincode } : {}),
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;

    const { id: userId } = authResult as JwtPayload;
    const { id } = await params;

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
