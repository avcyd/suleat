/**
 * /merchants
 * ----------
 * Homepage "List Your Business" CTA lands here.
 * Signed-in users fill merchant details → role becomes MERCHANT.
 */
import { redirect } from "next/navigation";
import { MerchantApplyForm } from "@/components/merchant/MerchantApplyForm";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function MerchantsApplyPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/merchants");
  }

  const existing = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (existing) {
    redirect("/merchant/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[1100px] items-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-10">
        <MerchantApplyForm />
      </div>
    </main>
  );
}
