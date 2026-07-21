import { categories, heroSlides, latestOffers } from "@/data";
import { Categories } from "./Categories";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { HeroCarousel } from "./HeroCarousel";
import { LatestOffers } from "./LatestOffers";
import { MerchantCta } from "./MerchantCta";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <Header />
      <main className="flex flex-col gap-8 pb-4 pt-5 sm:gap-10 sm:pt-6 lg:gap-8">
        <HeroCarousel slides={heroSlides} />
        <Categories categories={categories} />
        <LatestOffers offers={latestOffers} />
        <MerchantCta />
      </main>
      <Footer />
    </div>
  );
}
