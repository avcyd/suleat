/**
 * Homepage — loads latest active promotions and merchant CTA state.
 */
import { LandingPage } from "@/components/landing";
import { toOffer } from "@/lib/offer-mappers";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listLatestOffers } from "@/services/offer.service";
import { listUnreadNotifications } from "@/services/notification.service";
import type { MerchantCtaStatus } from "@/types/landing-cta";

export default async function Home() {
  const session = await getSession();
  const rows = await listLatestOffers(5);

  let merchantCtaStatus: MerchantCtaStatus = "guest";
  let rejectionNotice = null;

  if (session?.user) {
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
  }

  return (
    <LandingPage
      offers={rows.map(toOffer)}
      merchantCtaStatus={merchantCtaStatus}
      rejectionNotice={rejectionNotice}
    />
  );
}
