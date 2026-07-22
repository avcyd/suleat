/**
 * NextAuth type augmentation
 * --------------------------
 * By default, session.user only has name/email/image.
 * We add `id` and `role` so TypeScript knows about the fields we set in
 * authOptions callbacks (see src/lib/auth.ts).
 */
import type { DefaultSession } from "next-auth";
import type { UserRole } from "../../generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

export {};
