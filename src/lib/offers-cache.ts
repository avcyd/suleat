/**
 * Public read cache — offers + business overlay payloads.
 */
import { unstable_cache } from "next/cache";
import {
  getPublicBusinessById,
  listActiveOffers,
  listLatestOffers,
} from "@/services/offer.service";
import type { PublicBusinessView } from "@/types/public-business";
import {
  formatBranchAddress,
  formatMenuCategory,
  formatMenuPrice,
  type MenuCategory,
} from "@/types/merchant";

export const getCachedLatestOffers = unstable_cache(
  async (limit = 5) => listLatestOffers(limit),
  ["latest-offers"],
  { revalidate: 60, tags: ["offers"] },
);

export const getCachedActiveOffers = unstable_cache(
  async () => listActiveOffers(),
  ["active-offers"],
  { revalidate: 60, tags: ["offers"] },
);

function toPublicBusinessView(
  row: Awaited<ReturnType<typeof getPublicBusinessById>>,
): PublicBusinessView {
  const established =
    row.dateEstablishment instanceof Date
      ? row.dateEstablishment
      : new Date(row.dateEstablishment);

  return {
    id: row.id,
    businessName: row.businessName,
    description: row.description,
    coverPhoto: row.coverPhoto,
    dateEstablishment: established.toISOString().slice(0, 10),
    companyName: row.merchant.companyName,
    branches: row.branch.map((branch) => ({
      id: branch.id,
      label: formatBranchAddress({
        id: branch.id,
        number: branch.number,
        building: branch.building ?? undefined,
        street: branch.street,
        barangay: branch.barangay,
        city: branch.city,
        province: branch.province,
      }),
    })),
    menu: row.menu.map((item) => ({
      id: item.id,
      itemName: item.itemName,
      description: item.description ?? undefined,
      priceLabel: formatMenuPrice(Number(item.price)),
      categoryLabel: formatMenuCategory(item.category as MenuCategory),
      isAvailable: item.isAvailable,
    })),
  };
}

/** Cached mapped business payload for the public overlay. */
export function getCachedPublicBusiness(businessId: string) {
  return unstable_cache(
    async () => {
      const row = await getPublicBusinessById(businessId);
      return toPublicBusinessView(row);
    },
    ["public-business", businessId],
    {
      revalidate: 120,
      tags: ["public-business", `public-business:${businessId}`],
    },
  )();
}
