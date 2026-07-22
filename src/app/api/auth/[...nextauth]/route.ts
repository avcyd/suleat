/**
 * NextAuth API route (REQUIRED)
 * -----------------------------
 * NextAuth needs this App Router catch-all route for:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/callback/*
 *
 * Do NOT replace this with a Server Action — this is the auth protocol layer.
 * Your register logic can still be a Server Action (see src/actions/auth.ts).
 */
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
