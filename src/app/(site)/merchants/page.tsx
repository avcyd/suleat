/**
 * /merchants
 * ----------
 * Homepage "List Your Business" CTA lands here.
 * - Admins cannot apply
 * - No merchant profile → apply form
 * - Pending (unverified) → waiting notice
 * - Approved merchant → dashboard
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { MerchantApplyForm } from "@/components/merchant/MerchantApplyForm";
import { MerchantPendingNotice } from "@/components/merchant/MerchantPendingNotice";
import { Logo } from "@/components/layout";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function MerchantsApplyPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/merchants");
  }

  if (session.user.role === "ADMIN") {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[1100px] items-center px-4 py-12 sm:px-6">
        <div className="w-full rounded-[24px] border border-black/5 bg-white p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-10">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-8 font-display text-3xl font-semibold text-ink">
            Admins can’t become merchants
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#4b4b4b]">
            Use a separate user account if you need to list a business on
            Suleat.
          </p>
          <Link href="/admin/dashboard" className="btn-primary mt-8 inline-flex">
            Admin Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const existing = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      companyName: true,
      verificationStatus: true,
    },
  });

  if (existing?.verificationStatus) {
    redirect("/merchant/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[1100px] items-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-10">
        {existing ? (
          <MerchantPendingNotice companyName={existing.companyName} />
        ) : (
          <MerchantApplyForm />
        )}
      </div>
    </main>
  );
}
