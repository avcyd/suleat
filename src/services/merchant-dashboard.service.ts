/**
 * Merchant dashboard bootstrap — one merchant lookup + parallel domain queries.
 */
import { prisma } from "@/lib/prisma";

export async function getMerchantDashboardBundle(userId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!merchant || !merchant.verificationStatus) {
    return null;
  }

  const [businesses, menuItems, promotions] = await Promise.all([
    prisma.business.findMany({
      where: { merchantId: merchant.id },
      select: {
        id: true,
        businessName: true,
        description: true,
        dateEstablishment: true,
        coverPhoto: true,
        branch: {
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
      },
      orderBy: { businessName: "asc" },
    }),
    prisma.menu.findMany({
      where: { business: { merchantId: merchant.id } },
      select: {
        id: true,
        businessId: true,
        itemName: true,
        description: true,
        price: true,
        category: true,
        isAvailable: true,
      },
      orderBy: [{ category: "asc" }, { itemName: "asc" }],
    }),
    prisma.promotion.findMany({
      where: { business: { merchantId: merchant.id } },
      select: {
        id: true,
        businessId: true,
        branchId: true,
        menuId: true,
        caption: true,
        description: true,
        imageUrl: true,
        promotionType: true,
        discountPercent: true,
        bundleType: true,
        buyQuantity: true,
        getQuantity: true,
        bundleDiscountPercent: true,
        startDate: true,
        endDate: true,
        archived: true,
        createdAt: true,
        business: { select: { coverPhoto: true } },
        menu: { select: { itemName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { merchant, businesses, menuItems, promotions };
}
