import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await db.user.findFirst({
      include: { partner: { include: { payouts: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (!user?.partner) {
      return NextResponse.json({ error: 'Not a partner' }, { status: 403 });
    }

    return NextResponse.json(
      user.partner.payouts
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((p) => ({
          id: p.id,
          amount: p.amount / 100,
          currency: p.currency,
          status: p.status as 'pending' | 'processing' | 'completed' | 'failed',
          method: p.method,
          createdAt: p.createdAt.toISOString(),
          paidAt: p.paidAt?.toISOString() ?? null,
        }))
    );
  } catch {
    return NextResponse.json({ error: 'Failed to load payouts' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await db.user.findFirst({
      include: { partner: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!user?.partner) {
      return NextResponse.json({ error: 'Not a partner' }, { status: 403 });
    }

    const payout = await db.payout.create({
      data: {
        partnerId: user.partner.id,
        amount: 7200,
        // Note: amount stored in cents, frontend expects dollars — divide by 100 in response
        currency: 'USD',
        status: 'pending',
        method: 'bank_transfer',
      },
    });

    return NextResponse.json({
      payout: {
        id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        method: payout.method,
        createdAt: payout.createdAt.toISOString(),
        paidAt: null,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to request payout' }, { status: 500 });
  }
}
