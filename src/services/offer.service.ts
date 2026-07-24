/**
 * Public offer service
 * -------------------
 * Active promotions for the homepage and /offers (no auth required).
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

/** Latest active promotions for the homepage. */
export async function listLatestOffers(limit = 5) {
  return prisma.promotion.findMany({
    where: activeWhere(),
    include: offerInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** All active promotions for the offers browse page (capped for page load). */
export async function listActiveOffers(limit = 80) {
  return prisma.promotion.findMany({
    where: activeWhere(),
    include: offerInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
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
