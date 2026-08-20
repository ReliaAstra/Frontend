import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await db.user.findFirst({
      include: { partner: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!user?.partner) {
      return NextResponse.json({ error: 'Not a partner' }, { status: 403 });
    }

    return NextResponse.json({
      partner: {
        id: user.partner.id,
        referralCode: user.partner.referralCode,
        status: user.partner.status,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not a partner' }, { status: 403 });
  }
}
