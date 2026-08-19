import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/billing/verify
 *
 * Client-side proxy for verifying Paystack transactions.
 * The live backend endpoint (POST /v1/billing/verify?reference=...) requires
 * authentication, so the user's Bearer token is forwarded from the
 * Authorization header.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Reference is required" } },
        { status: 400 }
      );
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://reliastra-backend.zevcloud.app/v1";

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(
      `${apiUrl}/billing/verify?reference=${encodeURIComponent(reference)}`,
      { method: "POST", headers }
    );

    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to verify payment" } },
      { status: 500 }
    );
  }
}
