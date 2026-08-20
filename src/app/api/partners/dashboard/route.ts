import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getReferralLink } from '@/lib/format';

export async function GET() {
  try {
    const user = await db.user.findFirst({
      include: {
        partner: {
          include: {
            referrals: true,
            commissions: true,
            payouts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!user?.partner) {
      return NextResponse.json({ error: 'Not a partner' }, { status: 403 });
    }

    const { referrals, commissions, payouts } = user.partner;
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const totalEarned = commissions.reduce((sum, c) => sum + c.amount, 0) / 100;
    const thisMonthEarned = commissions
      .filter((c) => {
        const d = new Date(c.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    const activeCustomers = referrals.filter((r) => r.status === 'active').length;
    const payable = commissions.filter((c) => c.status === 'payable').reduce((sum, c) => sum + c.amount, 0) / 100;

    return NextResponse.json({
      totalEarned,
      thisMonth: thisMonthEarned,
      activeCustomers,
      payable,
      referralLink: getReferralLink(user.partner.referralCode),
      referrals: referrals.map((r) => ({
        id: r.id,
        referredEmail: r.referredEmail,
        referredName: r.referredName,
        plan: r.plan,
        status: r.status as 'pending' | 'active' | 'cancelled',
        monthlyEarned: r.plan === 'Pro' ? 14.70 : r.plan === 'Team' ? 8.70 : r.plan === 'Enterprise' ? 49.00 : 0,
        createdAt: r.createdAt.toISOString(),
      })),
      recentCommissions: commissions.slice(0, 10).map((c) => ({
        id: c.id,
        referralId: c.referralId,
        amount: c.amount / 100,
        currency: c.currency,
        status: c.status as 'pending' | 'payable' | 'paid',
        period: c.period,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
