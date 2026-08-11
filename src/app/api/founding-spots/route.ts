import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data — TODO: connect to real backend
  return NextResponse.json({ total: 25, remaining: 17, claimed: 8 });
}
