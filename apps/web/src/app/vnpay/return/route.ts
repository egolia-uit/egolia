import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET(request: NextRequest) {
  const webOrigin =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    process.env.BETTER_AUTH_URL ||
    request.nextUrl.origin;
  const redirectUrl = new URL('/billing', webOrigin);
  redirectUrl.search = request.nextUrl.search;

  return NextResponse.redirect(redirectUrl);
}
