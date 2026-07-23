/**
 * /merchant/dashboard
 * -------------------
 * Loads merchant account, businesses (+ branches), and menu from the DB.
 */
import { redirect } from "next/navigation";
import { MerchantDashboard } from "@/components/merchant";
import {
  toBusinessProfile,
  toMenuItem,
  toMerchantAccount,
} from "@/lib/merchant-mappers";
import { getSession } from "@/lib/session";
import { getBusinessesByUserId } from "@/services/business.service";
import { getMenuItemsForUser } from "@/services/menu.service";
import { getMerchantByUserId } from "@/services/merchant.service";

export default async function MerchantDashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/merchant/dashboard");
  }

  if (session.user.role !== "MERCHANT") {
    redirect("/merchants");
  }

  let merchant;
  try {
    merchant = await getMerchantByUserId(session.user.id);
  } catch {
    redirect("/merchants");
  }

  const [businesses, menuItems] = await Promise.all([
    getBusinessesByUserId(session.user.id),
    getMenuItemsForUser(session.user.id),
  ]);

  return (
    <MerchantDashboard
      account={toMerchantAccount(merchant)}
      businesses={businesses.map(toBusinessProfile)}
      menuItems={menuItems.map(toMenuItem)}
    />
  );
}
