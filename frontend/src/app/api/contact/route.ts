import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'Name, email, subject, and message are required' }, { status: 400 });
    }

    console.log('Contact form submission:', { name, email, phone, subject, message });

    return NextResponse.json({ message: 'Message received successfully. We will get back to you within 24 hours.' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
