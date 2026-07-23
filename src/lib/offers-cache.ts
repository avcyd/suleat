/**
 * Cached public offer reads for homepage /offers.
 * Mutations call `revalidateTag("offers")` so cards stay fresh after promo changes.
 */
import { unstable_cache } from "next/cache";
import { listActiveOffers, listLatestOffers } from "@/services/offer.service";

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
