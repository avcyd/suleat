"use client";

import { useCallback, useState } from "react";
import type { Offer } from "@/types/landing";
import { OfferCard } from "@/components/landing/OfferCard";
import { OfferOverlay } from "./OfferOverlay";

type OfferCardsWithDetailsProps = {
  offers: Offer[];
  /** Wrap each card (e.g. reveal animation or hash id). */
  renderWrapper?: (offer: Offer, card: React.ReactNode) => React.ReactNode;
  emptyMessage?: string;
};

/**
 * Shared offer list + unified promo/business overlay.
 */
export function OfferCardsWithDetails({
  offers,
  renderWrapper,
  emptyMessage = "No offers yet.",
}: OfferCardsWithDetailsProps) {
  const [selected, setSelected] = useState<Offer | null>(null);
  const closeOffer = useCallback(() => setSelected(null), []);

  if (offers.length === 0) {
    return (
      <p className="rounded-[10px] bg-offer-static px-5 py-8 text-center text-sm text-[#363636]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {offers.map((offer) => {
          const card = <OfferCard offer={offer} onOpen={setSelected} />;
          return (
            <div key={offer.id}>
              {renderWrapper ? renderWrapper(offer, card) : card}
            </div>
          );
        })}
      </div>

      <OfferOverlay offer={selected} onClose={closeOffer} />
    </>
  );
}
