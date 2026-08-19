import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real app, validate token from headers
    // For demo, return first user or null
    const user = await db.user.findFirst({
      include: { partner: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

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
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
