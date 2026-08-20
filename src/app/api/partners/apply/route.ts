import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    // Get user from demo - use first user
    const user = await db.user.findFirst({
      where: { partner: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }

    const existingPartner = await db.partner.findUnique({ where: { userId: user.id } });
    if (existingPartner) {
      return NextResponse.json({ error: 'Already a partner' }, { status: 409 });
    }

    let referralCode = generateReferralCode();
    while (await db.partner.findUnique({ where: { referralCode } })) {
      referralCode = generateReferralCode();
    }

    const partner = await db.partner.create({
      data: {
        userId: user.id,
        referralCode,
        status: 'active',
      },
    });

    return NextResponse.json({
      partner: { referralCode: partner.referralCode, status: partner.status },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Could not activate partner account' }, { status: 500 });
  }
}
