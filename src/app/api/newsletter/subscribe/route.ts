import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';

const subscribeSchema = z.object({
  email: z.email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    // TODO: connect to real newsletter service
    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
