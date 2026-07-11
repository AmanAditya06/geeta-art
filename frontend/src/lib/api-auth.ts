import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export function verifyToken(token: string | undefined | null): JwtPayload | null {
  if (!token || !token.startsWith('Bearer ')) return null;
  const actualToken = token.split(' ')[1];
  if (!actualToken) return null;
  try {
    return jwt.verify(actualToken, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}

export function requireAuth(authHeader: string | null): JwtPayload | NextResponse {
  const payload = verifyToken(authHeader);
  if (!payload) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 }) as NextResponse;
  }
  return payload;
}

export function requireAdmin(payload: JwtPayload): NextResponse | null {
  if (payload.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }
  return null;
}
