/**
 * /offers — browse active promotions from the database.
 * Optional `?category=` pre-selects a filter chip (from homepage categories).
 */
import { OffersPageContent } from "@/components/offers/OffersPageContent";
import { offerFilters, type OfferFilter } from "@/data/offers";
import { toOffer } from "@/lib/offer-mappers";
import { getCachedActiveOffers } from "@/lib/offers-cache";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseCategory(raw: string | undefined): OfferFilter {
  if (!raw) return "All";
  const match = offerFilters.find(
    (filter) => filter.toLowerCase() === raw.trim().toLowerCase(),
  );
  return match ?? "All";
}

export default async function OffersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const initialCategory = parseCategory(first(params.category));
  const rows = await getCachedActiveOffers();

  return (
    <OffersPageContent
      offers={rows.map(toOffer)}
      initialCategory={initialCategory}
    />
  );
}
