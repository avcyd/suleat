/**
 * Auth middleware
 * ---------------
 * Protects /account/* by checking the NextAuth JWT cookie.
 * Unauthenticated users are sent to /login.
 *
 * Note: Next.js 16 prefers an explicit `middleware` function export
 * (re-exporting next-auth/middleware alone can fail the build).
 */
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/account/:path*"],
};
