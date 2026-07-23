/**
 * Server-side session helper
 * --------------------------
 * NextAuth v4 + Next.js 15/16 Server Actions can fail to surface cookies to
 * `getServerSession`, which shows up as "You must be signed in" while the
 * client `useSession()` still looks logged in.
 *
 * Strategy: try getServerSession first, then fall back to decoding the JWT
 * cookie via `next/headers` + `getToken`.
 */
import { cookies } from "next/headers";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "../../generated/prisma/client";

function sessionFromToken(token: Record<string, unknown>): Session | null {
  const id = token.id ?? token.sub;
  if (!id || typeof id !== "string") return null;

  const role = (token.role as UserRole | undefined) ?? "USER";
  const exp =
    typeof token.exp === "number"
      ? new Date(token.exp * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    user: {
      id,
      role,
      name: typeof token.name === "string" ? token.name : null,
      email: typeof token.email === "string" ? token.email : null,
      image: typeof token.picture === "string" ? token.picture : null,
    },
    expires: exp,
  };
}

async function getSessionFromCookies(): Promise<Session | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (!cookieHeader) return null;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const token = await getToken({
    // Minimal request shape accepted by next-auth/jwt getToken
    req: { headers: { cookie: cookieHeader } } as Parameters<
      typeof getToken
    >[0]["req"],
    secret,
  });

  if (!token) return null;
  return sessionFromToken(token as Record<string, unknown>);
}

export async function getSession(): Promise<Session | null> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return session;
    }
  } catch {
    // Fall through to cookie JWT decode.
  }

  return getSessionFromCookies();
}
