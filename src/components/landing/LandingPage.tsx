import { categories, heroSlides } from "@/data";
import type { Offer } from "@/types/landing";
import type {
  MerchantCtaNotification,
  MerchantCtaStatus,
} from "@/types/landing-cta";
import { Categories } from "./Categories";
import { HeroCarousel } from "./HeroCarousel";
import { LatestOffers } from "./LatestOffers";
import { MerchantCta } from "./MerchantCta";

type LandingPageProps = {
  offers: Offer[];
  merchantCtaStatus: MerchantCtaStatus;
  rejectionNotice?: MerchantCtaNotification | null;
};

/**
 * Landing page content only.
 * Navbar/Footer are provided globally by app/(site)/layout.tsx.
 */
export function LandingPage({
  offers,
  merchantCtaStatus,
  rejectionNotice = null,
}: LandingPageProps) {
  return (
    <main className="flex flex-col gap-8 pb-4 pt-5 sm:gap-10 sm:pt-6 lg:gap-8">
      <HeroCarousel slides={heroSlides} />
      <Categories categories={categories} />
      <LatestOffers offers={offers} />
      <MerchantCta
        status={merchantCtaStatus}
        rejectionNotice={rejectionNotice}
      />
    </main>
  );
}
