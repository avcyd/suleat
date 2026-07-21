"use client";

import Link from "next/link";
import type { Offer } from "@/types/landing";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { OfferCard } from "./OfferCard";

type LatestOffersProps = {
  offers: Offer[];
};

export function LatestOffers({ offers }: LatestOffersProps) {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`reveal-section mx-auto w-full max-w-[914px] px-4 sm:px-6 ${
        isVisible ? "is-visible" : ""
      }`}
    >
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-[32px]">
          Latest Offers
        </h2>
        <Link
          href="/offers"
          className="pb-1 text-sm font-semibold tracking-[0.18em] text-brand-deep transition-all duration-300 hover:tracking-[0.22em] hover:text-brand"
        >
          VIEW MORE &gt;
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {offers.map((offer, index) => (
          <div
            key={offer.id}
            className="reveal-item"
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <OfferCard offer={offer} />
          </div>
        ))}
      </div>
    </section>
  );
}
