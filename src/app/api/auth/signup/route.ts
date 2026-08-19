import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const user = await db.user.create({
      data: { email, name: name || null, password: randomBytes(32).toString('hex') },
    });

    const token = randomBytes(32).toString('hex');

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, isPartner: false },
      token,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Could not create account' }, { status: 500 });
  }
}
