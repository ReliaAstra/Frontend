import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await db.user.findFirst({
      include: { partner: { include: { commissions: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (!user?.partner) {
      return NextResponse.json({ error: 'Not a partner' }, { status: 403 });
    }

    return NextResponse.json(
      user.partner.commissions
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((c) => ({
          id: c.id,
          referralId: c.referralId,
          amount: c.amount / 100,
          currency: c.currency,
          status: c.status as 'pending' | 'payable' | 'paid',
          period: c.period,
          createdAt: c.createdAt.toISOString(),
        }))
    );
  } catch {
    return NextResponse.json({ error: 'Failed to load commissions' }, { status: 500 });
  }
}