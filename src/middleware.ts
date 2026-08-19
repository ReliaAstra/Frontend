import { NextRequest, NextResponse } from 'next/server';

const PARTNER_HOSTNAMES = [
  'partnership.frontend.zevcloud.app',
  'partnership.reliastra.com',
  'partners.reliastra.com',
];

const SKIP_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/',
  '/api/',
];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const isPartner = PARTNER_HOSTNAMES.some((h) => hostname === h);

  if (!isPartner) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Don't rewrite auth, API routes — they belong to the main app
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Rewrite everything else under the partner subdomain to /partner prefix
  const url = request.nextUrl.clone();
  url.pathname = `/partner${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\.ico).*)'],
};
