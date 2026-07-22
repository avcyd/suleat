"use server";

/**
 * Auth-related Server Actions
 * ---------------------------
 * Register is YOUR business logic (create user in Prisma) — so it belongs in a
 * Server Action, not a custom /api/register route.
 *
 * Login/logout still go through NextAuth (`signIn` / `signOut` on the client),
 * which hit `/api/auth/[...nextauth]` under the hood.
 */
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type AuthActionState = {
  ok: boolean;
  message: string;
};

/**
 * registerUser
 * Creates a new USER in the database with a hashed password.
 * After success, the client should call signIn("credentials", ...) to log in.
 */
export async function registerUser(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!displayName || !email || !password) {
    return { ok: false, message: "Please fill in all required fields." };
  }

  if (password.length < 8) {
    return {
      ok: false,
      message: "Password must be at least 8 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return { ok: false, message: "Passwords do not match." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, message: "An account with this email already exists." };
  }

  // Never store plain-text passwords — only the hash.
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      displayName,
      email,
      passwordHash,
      role: "USER",
    },
  });

  return {
    ok: true,
    message: "Account created. You can sign in now.",
  };
}
