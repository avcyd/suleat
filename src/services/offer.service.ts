/**
 * Public offer service
 * -------------------
 * Active promotions for the homepage and /offers (no auth required).
 *
 * End-user sorting is done in the database (ORDER BY) before `take`/pagination —
 * practical for large catalogs vs in-memory Merge Sort on the full table.
 */
import { prisma } from "@/lib/prisma";

const offerInclude = {
  business: {
    select: {
      id: true,
      businessName: true,
      coverPhoto: true,
      merchant: { select: { companyName: true } },
    },
  },
  menu: { select: { itemName: true, price: true, category: true } },
  branch: {
    select: {
      number: true,
      building: true,
      street: true,
      barangay: true,
      city: true,
      province: true,
    },
  },
} as const;

function activeWhere(now = new Date()) {
  return {
    archived: false,
    startDate: { lte: now },
    endDate: { gte: now },
  };
}

/** Latest active promotions for the homepage — DB sort by newest first. */
export async function listLatestOffers(limit = 5) {
  return prisma.promotion.findMany({
    where: activeWhere(),
    include: offerInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Active promotions for /offers.
 * DB sorts by highest discount %, then newest — then caps with `take`.
 */
export async function listActiveOffers(limit = 80) {
  return prisma.promotion.findMany({
    where: activeWhere(),
    include: offerInclude,
    orderBy: [
      { discountPercent: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    take: limit,
  });
}

/**
 * Top N promotions by effective discount % for the hero carousel.
 * Loads an active working set from the DB, then ranks by DISCOUNT / BUNDLE
 * effective percent so FREE buy-X-get-Y deals are included fairly.
 */
export async function listTopDiscountOffers(limit = 3) {
  const rows = await listActiveOffers(80);

  const ranked = [...rows].sort((a, b) => {
    const aPct = effectiveDiscountFromRow(a);
    const bPct = effectiveDiscountFromRow(b);
    if (bPct !== aPct) return bPct - aPct;
    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
    return bTime - aTime;
  });

  return ranked.slice(0, limit);
}

function effectiveDiscountFromRow(row: {
  promotionType: "DISCOUNT" | "BUNDLE";
  discountPercent: number | null;
  bundleType: "FREE" | "PERCENTAGE_OFF" | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  bundleDiscountPercent: number | null;
}): number {
  if (row.promotionType === "DISCOUNT") {
    return row.discountPercent ?? 0;
  }
  if (row.bundleType === "PERCENTAGE_OFF") {
    return row.bundleDiscountPercent ?? 0;
  }
  const buy = row.buyQuantity ?? 0;
  const get = row.getQuantity ?? 0;
  const total = buy + get;
  if (total <= 0) return 0;
  return Math.round((get / total) * 100);
}

/** Public business profile with branches and menu (for offer overlays). */
export async function getPublicBusinessById(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      businessName: true,
      description: true,
      coverPhoto: true,
      dateEstablishment: true,
      merchant: { select: { companyName: true } },
      branch: {
        orderBy: { street: "asc" },
        select: {
          id: true,
          number: true,
          building: true,
          street: true,
          barangay: true,
          city: true,
          province: true,
        },
      },
      menu: {
        orderBy: [{ category: "asc" }, { itemName: "asc" }],
        select: {
          id: true,
          itemName: true,
          description: true,
          price: true,
          category: true,
          isAvailable: true,
        },
      },
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  return business;
}
