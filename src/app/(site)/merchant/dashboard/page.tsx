/**
 * /merchant/dashboard
 * -------------------
 * Merchant Business Dashboard frontend.
 * Only accessible to users with role MERCHANT.
 */
import { redirect } from "next/navigation";
import { MerchantDashboard } from "@/components/merchant";
import { getSession } from "@/lib/session";

export default async function MerchantDashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/merchant/dashboard");
  }

  if (session.user.role !== "MERCHANT") {
    redirect("/");
  }

  return <MerchantDashboard />;
}
