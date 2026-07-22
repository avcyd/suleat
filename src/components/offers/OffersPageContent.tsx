"use client";

/**
 * Offers page — hero, page-level search, filters, sort, cards, pagination.
 * Navbar search is hidden on this route (see Navbar).
 */
import Image from "next/image";
import { useMemo, useState } from "react";
import { OfferCard } from "@/components/landing/OfferCard";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { heroSlides } from "@/data";
import { latestOffers, offerFilters, type OfferFilter } from "@/data/offers";

type SortMode = "newest" | "expiring";

export function OffersPageContent() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<OfferFilter>("All");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    let list = latestOffers.filter((offer) => {
      const matchesFilter =
        activeFilter === "All" || offer.category === activeFilter;
      const matchesQuery =
        !normalized ||
        offer.title.toLowerCase().includes(normalized) ||
        offer.merchant.toLowerCase().includes(normalized) ||
        offer.description.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });

    list = [...list].sort((a, b) => {
      if (sortMode === "expiring") {
        return a.expiresAt.localeCompare(b.expiresAt);
      }
      return b.id.localeCompare(a.id);
    });

    return list;
  }, [query, activeFilter, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <main className="mx-auto flex w-full max-w-[914px] flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 sm:pt-6">
      <HeroCarousel slides={heroSlides} />

      {/* Page search — Figma places search here, not in the navbar */}
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="w-full"
      >
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search..."
          className="w-full rounded-full bg-search px-6 py-3.5 text-base font-medium text-ink outline-none placeholder:text-muted focus:ring-1 focus:ring-ink/10"
          aria-label="Search offers"
        />
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex max-w-full flex-1 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {offerFilters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setPage(1);
                }}
                className={`shrink-0 rounded-[10px] px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "border border-brand bg-[#fff0e7] text-brand"
                    : "bg-[#eaeaea] text-[#7c7c7c] hover:bg-[#e0e0e0]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() =>
            setSortMode((mode) => (mode === "newest" ? "expiring" : "newest"))
          }
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
          aria-label={`Sort by ${sortMode === "newest" ? "expiring soon" : "newest"}`}
        >
          <Image
            src="/images/offers/sort-arrows.png"
            alt=""
            width={16}
            height={16}
            className="size-4 object-contain invert"
          />
          Sort
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {pageItems.length > 0 ? (
          pageItems.map((offer) => <OfferCard key={offer.id} offer={offer} />)
        ) : (
          <p className="rounded-[10px] bg-offer-static px-5 py-8 text-center text-sm text-[#363636]">
            No offers match your search.
          </p>
        )}
      </div>

      <nav
        className="flex items-center justify-center gap-4 pt-2 text-sm font-medium text-[#333]"
        aria-label="Offers pagination"
      >
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          const isActive = pageNumber === currentPage;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`min-w-4 transition-colors ${
                isActive ? "text-brand" : "hover:text-brand"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          className="hover:text-brand"
          aria-label="Next page"
        >
          &gt;&gt;
        </button>
      </nav>
    </main>
  );
}
