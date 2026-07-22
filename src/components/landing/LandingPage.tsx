import { categories, heroSlides, latestOffers } from "@/data";
import { Categories } from "./Categories";
import { HeroCarousel } from "./HeroCarousel";
import { LatestOffers } from "./LatestOffers";
import { MerchantCta } from "./MerchantCta";

/**
 * Landing page content only.
 * Navbar/Footer are provided globally by app/(site)/layout.tsx.
 */
export function LandingPage() {
  return (
    <main className="flex flex-col gap-8 pb-4 pt-5 sm:gap-10 sm:pt-6 lg:gap-8">
      <HeroCarousel slides={heroSlides} />
      <Categories categories={categories} />
      <LatestOffers offers={latestOffers} />
      <MerchantCta />
    </main>
  );
}
