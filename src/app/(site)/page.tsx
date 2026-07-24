/**
 * Homepage — stream static chrome immediately; hero + offers + CTA load in Suspense.
 */
import { Suspense } from "react";
import { categories } from "@/data";
import {
  Categories,
  HeroCarousel,
  LatestOffers,
  MerchantCta,
} from "@/components/landing";
import {
  LatestOffersSectionSkeleton,
  MerchantCtaSkeleton,
  SkeletonPulse,
} from "@/components/ui/skeletons";
import { toOffer } from "@/lib/offer-mappers";
import {
  getCachedLatestOffers,
  getCachedTopDiscountOffers,
} from "@/lib/offers-cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listUnreadNotifications } from "@/services/notification.service";
import type { MerchantCtaStatus } from "@/types/landing-cta";

function HeroCarouselSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[914px] px-4 sm:px-6" aria-busy="true">
      <SkeletonPulse className="h-[220px] w-full rounded-[15px] sm:h-[280px]" />
    </div>
  );
}

async function HomeHero() {
  const rows = await getCachedTopDiscountOffers(3);
  return <HeroCarousel offers={rows.map(toOffer)} />;
}

async function HomeOffers() {
  const rows = await getCachedLatestOffers(5);
  return <LatestOffers offers={rows.map(toOffer)} />;
}

async function HomeMerchantCta() {
  const session = await getSession();

  if (!session?.user) {
    return <MerchantCta status="guest" rejectionNotice={null} />;
  }

  let merchantCtaStatus: MerchantCtaStatus = "guest";

  if (session.user.role === "ADMIN") {
    merchantCtaStatus = "admin";
  } else if (session.user.role === "MERCHANT") {
    merchantCtaStatus = "merchant";
  }

  const [pending, unread] = await Promise.all([
    merchantCtaStatus === "guest"
      ? prisma.merchant.findUnique({
          where: { userId: session.user.id },
          select: { verificationStatus: true },
        })
      : Promise.resolve(null),
    listUnreadNotifications(session.user.id),
  ]);

  if (merchantCtaStatus === "guest") {
    merchantCtaStatus =
      pending && !pending.verificationStatus ? "pending" : "apply";
  }

  const rejection = unread.find((item) => item.type === "MERCHANT_REJECTED");
  const rejectionNotice = rejection
    ? {
        id: rejection.id,
        title: rejection.title,
        message: rejection.message,
      }
    : null;

  return (
    <MerchantCta
      status={merchantCtaStatus}
      rejectionNotice={rejectionNotice}
    />
  );
}

export default function Home() {
  return (
    <main className="flex flex-col gap-8 pb-4 pt-5 sm:gap-10 sm:pt-6 lg:gap-8">
      <Suspense fallback={<HeroCarouselSkeleton />}>
        <HomeHero />
      </Suspense>
      <Categories categories={categories} />
      <Suspense fallback={<LatestOffersSectionSkeleton />}>
        <HomeOffers />
      </Suspense>
      <Suspense fallback={<MerchantCtaSkeleton />}>
        <HomeMerchantCta />
      </Suspense>
    </main>
  );
}
