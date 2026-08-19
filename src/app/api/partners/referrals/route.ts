import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await db.user.findFirst({
      include: { partner: { include: { referrals: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (!user?.partner) {
      return NextResponse.json({ error: 'Not a partner' }, { status: 403 });
    }

    return NextResponse.json(
      user.partner.referrals.map((r) => ({
        id: r.id,
        referredEmail: r.referredEmail,
        referredName: r.referredName,
        plan: r.plan,
        status: r.status as 'pending' | 'active' | 'cancelled',
        monthlyEarned: r.plan === 'Pro' ? 1470 : r.plan === 'Team' ? 870 : 0,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: 'Failed to load referrals' }, { status: 500 });
  }
}
