/**
 * Homepage — stream static chrome immediately; offers + CTA load in Suspense.
 */
import { Suspense } from "react";
import { categories, heroSlides } from "@/data";
import {
  Categories,
  HeroCarousel,
  LatestOffers,
  MerchantCta,
} from "@/components/landing";
import {
  LatestOffersSectionSkeleton,
  MerchantCtaSkeleton,
} from "@/components/ui/skeletons";
import { toOffer } from "@/lib/offer-mappers";
import { getCachedLatestOffers } from "@/lib/offers-cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listUnreadNotifications } from "@/services/notification.service";
import type { MerchantCtaStatus } from "@/types/landing-cta";

async function HomeOffers() {
  const rows = await getCachedLatestOffers(5);
  return <LatestOffers offers={rows.map(toOffer)} />;
}

async function HomeMerchantCta() {
  const session = await getSession();

  let merchantCtaStatus: MerchantCtaStatus = "guest";
  let rejectionNotice = null;

  if (!session?.user) {
    return (
      <MerchantCta
        status={merchantCtaStatus}
        rejectionNotice={rejectionNotice}
      />
    );
  }

  if (session.user.role === "ADMIN") {
    merchantCtaStatus = "admin";
  } else if (session.user.role === "MERCHANT") {
    merchantCtaStatus = "merchant";
  } else {
    const pending = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
      select: { verificationStatus: true },
    });
    merchantCtaStatus =
      pending && !pending.verificationStatus ? "pending" : "apply";
  }

  const unread = await listUnreadNotifications(session.user.id);
  const rejection = unread.find((item) => item.type === "MERCHANT_REJECTED");
  if (rejection) {
    rejectionNotice = {
      id: rejection.id,
      title: rejection.title,
      message: rejection.message,
    };
  }

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
      <HeroCarousel slides={heroSlides} />
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
