/**
 * Auth proxy (Next.js 16+)
 * ------------------------
 * - /account/*, /merchant/*, /admin/* → require signed-in user
 * Role checks happen in the page (getSession can read JWT + DB).
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = secret
    ? await getToken({ req: request, secret })
    : null;

  const pathname = request.nextUrl.pathname;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/merchant",
    "/merchant/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
