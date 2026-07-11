import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAuth(request.headers.get('authorization'));
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.id;

    const { id } = await params;
    const body = await request.json();
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ message: 'Missing payment verification fields' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ message: 'Order is not in pending status' }, { status: 400 });
    }

    const signBody = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(signBody)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ message: 'Invalid payment signature' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        paymentId: razorpayPaymentId,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('verifyPayment error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
