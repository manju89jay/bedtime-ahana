import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/auth/config';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const user = createUser(email, password);
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
