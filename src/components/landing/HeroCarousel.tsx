"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/types/landing";

type HeroCarouselProps = {
  slides: HeroSlide[];
};

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  const activeSlide = slides[activeIndex];

  return (
    <section
      className="mx-auto w-full max-w-[914px] animate-[fade-up_0.8s_cubic-bezier(0.22,1,0.36,1)_both] px-4 sm:px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div className="relative overflow-hidden rounded-[15px] bg-[#f4ebe4] shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="relative aspect-[914/372] min-h-[220px] w-full sm:min-h-[280px]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                index === activeIndex
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-105 opacity-0"
              }`}
              aria-hidden={index !== activeIndex}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 914px) 100vw, 914px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/8 to-transparent" />
            </div>
          ))}

          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-7">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-[40px]">
                {activeSlide.highlight ? (
                  <>
                    <span className="font-normal">{activeSlide.highlight}</span>{" "}
                    {activeSlide.title}
                  </>
                ) : (
                  activeSlide.title
                )}
              </h1>
              <p className="mt-1 text-sm font-medium tracking-wide text-[#363636]">
                {activeSlide.merchant}
              </p>
              <Link href={activeSlide.ctaHref} className="btn-primary mt-3">
                {activeSlide.ctaLabel}
              </Link>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 sm:bottom-5 sm:right-5">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-8 bg-ink"
                    : "w-2 bg-[#d9d9d9] hover:bg-[#bdbdbd]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
