/**
 * Auth proxy (Next.js 16+)
 * ------------------------
 * - /account/* → requires any signed-in user
 * - /merchant/* → requires signed-in MERCHANT role
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
  const isMerchantRoute = pathname.startsWith("/merchant");

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Business dashboard is merchant-only.
  if (isMerchantRoute && token.role !== "MERCHANT") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/merchant/:path*"],
};
