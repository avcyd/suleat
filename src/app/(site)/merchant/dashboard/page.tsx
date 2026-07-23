/**
 * /merchant/dashboard
 * -------------------
 * Loads merchant account, businesses (+ branches), menu, and promotions from the DB.
 * Access is based on a verified Merchant profile (JWT role may lag after approval).
 */
import { redirect } from "next/navigation";
import { MerchantDashboard } from "@/components/merchant";
import {
  toBusinessProfile,
  toMenuItem,
  toMerchantAccount,
  toPromotionPost,
} from "@/lib/merchant-mappers";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getBusinessesByUserId } from "@/services/business.service";
import { getMenuItemsForUser } from "@/services/menu.service";
import { getMerchantByUserId } from "@/services/merchant.service";
import { getPromotionsForUser } from "@/services/promotion.service";

export default async function MerchantDashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/merchant/dashboard");
  }

  const merchantRow = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verificationStatus: true },
  });

  // Verified merchant profile is the source of truth (JWT role can be stale).
  if (!merchantRow || !merchantRow.verificationStatus) {
    redirect("/merchants");
  }

  const [merchant, businesses, menuItems, promotions] = await Promise.all([
    getMerchantByUserId(session.user.id),
    getBusinessesByUserId(session.user.id),
    getMenuItemsForUser(session.user.id),
    getPromotionsForUser(session.user.id),
  ]);

  return (
    <MerchantDashboard
      account={toMerchantAccount(merchant)}
      businesses={businesses.map(toBusinessProfile)}
      menuItems={menuItems.map(toMenuItem)}
      promotions={promotions.map(toPromotionPost)}
    />
  );
}
