/**
 * Prisma Client singleton
 * -----------------------
 * WHY: In Next.js (especially with hot reload), importing `new PrismaClient()`
 * in many files can open too many DB connections. We reuse one instance.
 *
 * Prisma v7 requires a driver adapter (here: PostgreSQL via `@prisma/adapter-pg`).
 * The generated client lives in `/generated/prisma` (see prisma/schema.prisma).
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL. Add it to your .env file before using Prisma.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Keep the client across hot reloads in development only.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
