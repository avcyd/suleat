/**
 * Prisma Client singleton
 * -----------------------
 * WHY: In Next.js (especially with hot reload), importing `new PrismaClient()`
 * in many files can open too many DB connections. We reuse one instance.
 *
 * Prisma v7 requires a driver adapter (here: PostgreSQL via `@prisma/adapter-pg`).
 * The generated client lives in `/generated/prisma` (see prisma/schema.prisma).
 *
 * Bump PRISMA_SINGLETON_REV after `prisma generate` when the schema gains
 * fields/relations, so a stale globalThis client is replaced without a full
 * process restart.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

/** Bump when generated client shape changes (e.g. new Promotion.branch). */
const PRISMA_SINGLETON_REV = 6;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRev: number | undefined;
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

function getPrismaClient() {
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaRev === PRISMA_SINGLETON_REV
  ) {
    return globalForPrisma.prisma;
  }

  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaRev = PRISMA_SINGLETON_REV;
  return client;
}

export const prisma = getPrismaClient();
