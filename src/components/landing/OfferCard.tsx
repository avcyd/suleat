"use client";

import { useEffect, useRef, useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Offer } from "@/types/landing";

type OfferCardProps = {
  offer: Offer;
  onOpen: (offer: Offer) => void;
};

export function OfferCard({ offer, onOpen }: OfferCardProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [showSeeMore, setShowSeeMore] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      setShowSeeMore(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [offer.description]);

  return (
    <article className="group relative overflow-hidden rounded-[10px] bg-offer-static transition-colors duration-500 ease-out hover:bg-offer-hover">
      <button
        type="button"
        onClick={() => onOpen(offer)}
        className="flex w-full flex-col gap-3 p-3 text-left sm:flex-row sm:items-stretch sm:gap-4"
      >
        <div className="relative mx-auto h-[168px] w-full max-w-[199px] shrink-0 overflow-hidden rounded-[8px] sm:mx-0 sm:w-[199px]">
          <SmartImage
            src={offer.image}
            alt={offer.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="199px"
          />
          <span className="absolute bottom-2 right-2 rounded-[5px] border border-brand bg-[#fff0e7] px-2.5 py-1 text-xs font-light text-brand-deep">
            {offer.discountLabel}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col py-1">
          <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            {offer.title}
          </h3>
          <p
            ref={textRef}
            className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#363636]"
          >
            {offer.description}
          </p>
          {showSeeMore ? (
            <span className="mt-1 text-sm text-brand transition-colors group-hover:text-brand-deep">
              See More
            </span>
          ) : null}
          <p className="mt-2 line-clamp-1 text-sm italic font-light text-[#797979]">
            {offer.address}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
            <span className="text-sm font-semibold text-brand">
              {offer.merchant}
            </span>
            <span className="rounded-full border border-red-500 bg-[#ffe3e3] px-4 py-1.5 text-xs italic font-light text-red-500">
              Expires at {offer.expiresAt}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
