"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Category } from "@/types/landing";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type CategoriesProps = {
  categories: Category[];
};

export function Categories({ categories }: CategoriesProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const maxScroll = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(node.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories.length, updateScrollState]);

  const scrollByAmount = (direction: "left" | "right") => {
    const amount = direction === "left" ? -180 : 180;
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      className={`reveal-section mx-auto w-full max-w-[914px] px-4 sm:px-6 ${
        isVisible ? "is-visible" : ""
      }`}
    >
      <h2 className="font-display text-2xl font-semibold text-ink sm:text-[32px]">
        Categories
      </h2>

      <div className="relative mt-4">
        <div
          ref={scrollerRef}
          className="flex gap-1 overflow-x-auto scroll-smooth pb-2 pl-1 pr-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1.5 sm:pr-16"
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex w-[100px] shrink-0 flex-col items-center gap-2 rounded-2xl px-1.5 py-2 transition-colors duration-200 hover:bg-[#f0f0f0] sm:w-[120px]"
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              <div className="relative size-[90px] overflow-hidden rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:size-[107px]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="107px"
                />
              </div>
              <span className="text-center text-sm font-semibold text-[#363636]">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {canScrollLeft ? (
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="btn-ink absolute -left-2 top-[30px] z-10 flex size-11 items-center justify-center rounded-full sm:-left-3 sm:top-[34px] sm:size-[45px]"
            aria-label="Scroll categories left"
          >
            <span className="text-xl font-light tracking-widest">&lt;</span>
          </button>
        ) : null}

        {canScrollRight ? (
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="btn-ink absolute -right-2 top-[30px] z-10 flex size-11 items-center justify-center rounded-full sm:-right-4 sm:top-[34px] sm:size-[45px] lg:-right-6"
            aria-label="Scroll categories right"
          >
            <span className="text-xl font-light tracking-widest">&gt;</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
