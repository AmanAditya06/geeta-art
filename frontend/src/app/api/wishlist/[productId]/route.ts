import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, JwtPayload } from '@/lib/api-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as JwtPayload;

    const { productId } = await params;

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: payload.id, productId } },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Wishlist item not found' }, { status: 404 });
    }

    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId: payload.id, productId } },
    });

    return NextResponse.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('removeFromWishlist error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
