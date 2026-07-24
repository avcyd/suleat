"use client";

import { useEffect, useState } from "react";
import { OfferOverlay } from "@/components/offers/OfferOverlay";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Offer } from "@/types/landing";
import { getEffectiveDiscountPercent } from "@/types/merchant";

type HeroCarouselProps = {
  /** Top promotions to feature (typically 3 highest-discount posts). */
  offers: Offer[];
};

/**
 * Hero carousel — showcases highest-discount promotions.
 * View opens the shared offer details overlay.
 */
export function HeroCarousel({ offers }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selected, setSelected] = useState<Offer | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [offers]);

  useEffect(() => {
    if (isPaused || offers.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % offers.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused, offers.length]);

  if (offers.length === 0) {
    return (
      <section
        className="mx-auto w-full max-w-[914px] px-4 sm:px-6"
        aria-label="Featured promotions"
      >
        <div className="flex aspect-[914/372] min-h-[220px] items-center justify-center rounded-[15px] bg-[#f4ebe4] sm:min-h-[280px]">
          <p className="text-sm text-muted">No featured promotions yet.</p>
        </div>
      </section>
    );
  }

  const activeOffer = offers[activeIndex]!;
  const discountPct = getEffectiveDiscountPercent(activeOffer);

  return (
    <section
      className="mx-auto w-full max-w-[914px] animate-[fade-up_0.8s_cubic-bezier(0.22,1,0.36,1)_both] px-4 sm:px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Highest discount promotions"
    >
      <div className="relative overflow-hidden rounded-[15px] bg-[#f4ebe4] shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="relative aspect-[914/372] min-h-[220px] w-full sm:min-h-[280px]">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                index === activeIndex
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-105 opacity-0"
              }`}
              aria-hidden={index !== activeIndex}
            >
              <SmartImage
                src={offer.image}
                alt=""
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 914px) 100vw, 914px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            </div>
          ))}

          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-7">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl font-medium leading-tight text-white sm:text-4xl lg:text-[40px]">
                {discountPct > 0 ? (
                  <>
                    <span className="font-normal">{discountPct}%</span> off{" "}
                    {activeOffer.menuItemName || activeOffer.title}
                  </>
                ) : (
                  activeOffer.title
                )}
              </h1>
              <p className="mt-1 text-sm font-medium tracking-wide text-white/90">
                {activeOffer.merchant}
                {activeOffer.discountLabel
                  ? ` · ${activeOffer.discountLabel}`
                  : ""}
              </p>
              <button
                type="button"
                onClick={() => setSelected(activeOffer)}
                className="btn-primary mt-3"
              >
                View
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 sm:bottom-5 sm:right-5">
            {offers.map((offer, index) => (
              <button
                key={offer.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <OfferOverlay offer={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
