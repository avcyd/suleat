"use client";

import Link from "next/link";
import type { Offer } from "@/types/landing";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { OfferCardsWithDetails } from "@/components/offers/OfferCardsWithDetails";

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

      <div className="mt-4">
        <OfferCardsWithDetails
          offers={offers}
          emptyMessage="No offers available right now."
          renderWrapper={(offer, card) => (
            <div
              className="reveal-item"
              style={{
                transitionDelay: `${offers.findIndex((item) => item.id === offer.id) * 100}ms`,
              }}
            >
              {card}
            </div>
          )}
        />
      </div>
    </section>
  );
}
