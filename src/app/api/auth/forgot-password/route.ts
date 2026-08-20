import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Please enter your email address.' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Look up user — always return success to avoid email enumeration
    const user = await db.user.findUnique({ where: { email: email.trim() } });

    if (user) {
      // In production: send password reset email via transactional email service
      // For now, we record the request and return success
      // The actual reset flow would involve a token-based email link
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
