/**
 * /merchant/dashboard
 * -------------------
 * Single merchant gate + parallel business/menu/promo reads.
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
import { getMerchantDashboardBundle } from "@/services/merchant-dashboard.service";

export default async function MerchantDashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/merchant/dashboard");
  }

  const bundle = await getMerchantDashboardBundle(session.user.id);
  if (!bundle) {
    redirect("/merchants");
  }

  const { merchant, businesses, menuItems, promotions } = bundle;

  return (
    <MerchantDashboard
      account={toMerchantAccount(merchant)}
      businesses={businesses.map(toBusinessProfile)}
      menuItems={menuItems.map(toMenuItem)}
      promotions={promotions.map(toPromotionPost)}
    />
  );
}
