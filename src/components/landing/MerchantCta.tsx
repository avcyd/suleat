"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markNotificationReadAction } from "@/actions/notification";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type {
  MerchantCtaNotification,
  MerchantCtaStatus,
} from "@/types/landing-cta";

type MerchantCtaProps = {
  status: MerchantCtaStatus;
  rejectionNotice?: MerchantCtaNotification | null;
};

export function MerchantCta({
  status,
  rejectionNotice = null,
}: MerchantCtaProps) {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function dismissRejection() {
    if (!rejectionNotice) return;
    startTransition(async () => {
      await markNotificationReadAction(rejectionNotice.id);
      router.refresh();
    });
  }

  return (
    <section
      ref={ref}
      className={`reveal-section mx-auto w-full max-w-[914px] px-4 sm:px-6 ${
        isVisible ? "is-visible" : ""
      }`}
    >
      {rejectionNotice ? (
        <div
          role="status"
          className="mb-4 rounded-[20px] border border-brand/20 bg-[#fff0e7] px-5 py-4 text-left sm:px-6"
        >
          <p className="text-sm font-semibold text-brand-deep">
            {rejectionNotice.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#4b4b4b]">
            {rejectionNotice.message}
          </p>
          <button
            type="button"
            onClick={dismissRejection}
            disabled={pending}
            className="mt-3 text-sm font-medium text-brand-deep underline-offset-2 hover:underline disabled:opacity-60"
          >
            {pending ? "Dismissing…" : "Dismiss"}
          </button>
        </div>
      ) : null}

      <div className="rounded-[30px] bg-merchant px-6 py-10 text-center sm:px-10 sm:py-12">
        <p className="text-sm font-semibold tracking-[0.18em] text-brand-deep">
          FOR LOCAL FOOD MERCHANTS
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold italic leading-tight text-ink sm:text-4xl lg:text-[50px] lg:leading-[60px]">
          Turn Deals into Loyal Diners
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm font-medium leading-6 text-[#333]">
          Are you a local cafe, food stall, or restaurant startup? Create a
          merchant account to feature your promotions, reach nearby customers,
          and grow your daily foot traffic.
        </p>
        <CtaAction status={status} />
      </div>
    </section>
  );
}

function CtaAction({ status }: { status: MerchantCtaStatus }) {
  if (status === "admin") {
    return (
      <button
        type="button"
        disabled
        className="btn-primary mt-6 cursor-not-allowed opacity-50"
        title="Admin accounts cannot become merchants"
      >
        List Your Business
      </button>
    );
  }

  if (status === "pending") {
    return (
      <Link
        href="/merchants"
        className="btn-primary mt-6 inline-flex bg-ink hover:bg-[#1a2430]"
      >
        Application pending
      </Link>
    );
  }

  if (status === "merchant") {
    return (
      <Link href="/merchant/dashboard" className="btn-primary mt-6">
        Go to Dashboard
      </Link>
    );
  }

  if (status === "guest") {
    return (
      <Link
        href="/login?callbackUrl=/merchants"
        className="btn-primary mt-6"
      >
        List Your Business
      </Link>
    );
  }

  return (
    <Link href="/merchants" className="btn-primary mt-6">
      List Your Business
    </Link>
  );
}
