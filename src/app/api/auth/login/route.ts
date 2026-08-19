import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { partner: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "We couldn't sign you in. Check your email and password and try again." },
        { status: 401 }
      );
    }

    const token = randomBytes(32).toString('hex');

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPartner: !!user.partner,
        partner: user.partner
          ? { id: user.partner.id, referralCode: user.partner.referralCode, status: user.partner.status as 'active' | 'suspended', createdAt: user.partner.createdAt.toISOString() }
          : undefined,
      },
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "We couldn't reach RELIASTRA. Check your connection and try again." },
      { status: 500 }
    );
  }
}
