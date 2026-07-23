/**
 * Auth proxy (Next.js 16+)
 * ------------------------
 * - /account/*, /merchant/*, /admin/* → require signed-in user
 * Role checks happen in the page (getSession runs the jwt callback and
 * can read the fresh role from the DB).
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/merchant/:path*", "/admin/:path*"],
};
