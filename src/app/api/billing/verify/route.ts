import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/billing/verify
 *
 * Client-side proxy for verifying Paystack transactions.
 * The frontend calls this after Paystack redirect to avoid CORS issues
 * and to keep the API key server-side if needed in the future.
 *
 * Currently just proxies to the backend's public verify endpoint.
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.zevcloud.app/v1";
    const res = await fetch(`${apiUrl}/billing/verify?reference=${encodeURIComponent(reference)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to verify payment" } },
      { status: 500 }
    );
  }
}
