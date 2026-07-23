import Link from "next/link";
import { Logo } from "@/components/layout";

type MerchantPendingNoticeProps = {
  companyName: string;
};

/** Shown while a merchant application awaits admin approval. */
export function MerchantPendingNotice({
  companyName,
}: MerchantPendingNoticeProps) {
  return (
    <div className="mx-auto w-full max-w-lg text-center">
      <div className="flex justify-center">
        <Logo />
      </div>
      <h1 className="mt-8 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Application pending
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#4b4b4b]">
        Your merchant application for{" "}
        <span className="font-semibold text-ink">{companyName}</span> is waiting
        for admin approval. You&apos;ll get merchant access once it&apos;s
        reviewed.
      </p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Back to home
      </Link>
    </div>
  );
}
