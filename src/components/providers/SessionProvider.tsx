"use client";

/**
 * SessionProvider wrapper
 * -----------------------
 * NextAuth client hooks (`useSession`, `signIn`, `signOut`) only work when
 * the React tree is wrapped in <SessionProvider>.
 *
 * This is a Client Component so it can be imported from the root layout
 * (which is a Server Component by default).
 */
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function SessionProvider({ children }: Props) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
