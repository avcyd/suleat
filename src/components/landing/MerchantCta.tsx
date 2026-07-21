"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function MerchantCta() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`reveal-section mx-auto w-full max-w-[914px] px-4 sm:px-6 ${
        isVisible ? "is-visible" : ""
      }`}
    >
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
        <Link href="/merchants" className="btn-primary mt-6">
          List Your Business
        </Link>
      </div>
    </section>
  );
}
