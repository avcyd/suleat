/**
 * NextAuth configuration (authOptions)
 * ------------------------------------
 * This is the single source of truth for HOW login works:
 * - Credentials provider → email + password against your Prisma `User` table
 * - JWT sessions → no NextAuth Account/Session tables required in Prisma
 * - callbacks → attach `id` + `role` onto token/session for the rest of the app
 *
 * Used by:
 * - `/api/auth/[...nextauth]` (required NextAuth API route)
 * - `getServerSession(authOptions)` in Server Components / Server Actions
 */
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // Custom pages so NextAuth redirects to our UI instead of the default screen.
  pages: {
    signIn: "/login",
  },

  // Credentials + JWT is the right combo for email/password with your own User model.
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      // Fields expected from the login form / signIn("credentials", { ... }).
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      /**
       * authorize()
       * Runs on the server when someone tries to log in.
       * Return a user object on success, or null on invalid credentials.
       */
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        // Whatever you return here is available in the jwt callback as `user`.
        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * jwt callback
     * Persist custom fields on the encrypted JWT cookie.
     */
    async jwt({ token, user, trigger }) {
      // `user` is only present right after a successful sign-in.
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Refresh role from DB when the client calls session.update()
      // (e.g. after becoming a merchant).
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },

    /**
     * session callback
     * Expose those JWT fields on `session.user` for client + server usage.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | "USER"
          | "ADMIN"
          | "MERCHANT";
      }
      return session;
    },
  },

  // Required in production. Set NEXTAUTH_SECRET in .env (e.g. openssl rand -base64 32).
  secret: process.env.NEXTAUTH_SECRET,
};
