import { categories } from "@/data";
import type { Offer } from "@/types/landing";
import type {
  MerchantCtaNotification,
  MerchantCtaStatus,
} from "@/types/landing-cta";
import { getEffectiveDiscountPercent } from "@/types/merchant";
import { Categories } from "./Categories";
import { HeroCarousel } from "./HeroCarousel";
import { LatestOffers } from "./LatestOffers";
import { MerchantCta } from "./MerchantCta";

type LandingPageProps = {
  offers: Offer[];
  /** Optional pre-ranked hero slides; defaults to top 3 from `offers`. */
  heroOffers?: Offer[];
  merchantCtaStatus: MerchantCtaStatus;
  rejectionNotice?: MerchantCtaNotification | null;
};

/**
 * Landing page content only.
 * Navbar/Footer are provided globally by app/(site)/layout.tsx.
 */
export function LandingPage({
  offers,
  heroOffers,
  merchantCtaStatus,
  rejectionNotice = null,
}: LandingPageProps) {
  const featured =
    heroOffers ??
    [...offers]
      .sort(
        (a, b) =>
          getEffectiveDiscountPercent(b) - getEffectiveDiscountPercent(a),
      )
      .slice(0, 3);

  return (
    <main className="flex flex-col gap-8 pb-4 pt-5 sm:gap-10 sm:pt-6 lg:gap-8">
      <HeroCarousel offers={featured} />
      <Categories categories={categories} />
      <LatestOffers offers={offers} />
      <MerchantCta
        status={merchantCtaStatus}
        rejectionNotice={rejectionNotice}
      />
    </main>
  );
}
