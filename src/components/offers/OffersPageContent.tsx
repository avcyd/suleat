"use client";

/**
 * Offers page — hero, page-level search, filters, sort, cards, pagination.
 * Navbar search is hidden on this route (see Navbar).
 * Offer data is loaded from the database by the server page.
 * `?category=` (from homepage tiles) sets the initial filter.
 */
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OfferCardsWithDetails } from "@/components/offers/OfferCardsWithDetails";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { heroSlides } from "@/data";
import { offerFilters, type OfferFilter } from "@/data/offers";
import type { Offer } from "@/types/landing";

type SortMode = "newest" | "expiring";

type OffersPageContentProps = {
  offers: Offer[];
  initialCategory?: OfferFilter;
};

export function OffersPageContent({
  offers,
  initialCategory = "All",
}: OffersPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<OfferFilter>(initialCategory);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setActiveFilter(initialCategory);
    setPage(1);
  }, [initialCategory]);

  function selectFilter(filter: OfferFilter) {
    setActiveFilter(filter);
    setPage(1);
    const params = new URLSearchParams();
    if (filter !== "All") {
      params.set("category", filter);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    let list = offers.filter((offer) => {
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
  }, [offers, query, activeFilter, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <main className="mx-auto flex w-full max-w-[914px] flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 sm:pt-6">
      <HeroCarousel slides={heroSlides} />

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
                onClick={() => selectFilter(filter)}
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

      <OfferCardsWithDetails
        offers={pageItems}
        emptyMessage="No offers match your search."
        renderWrapper={(offer, card) => <div id={offer.id}>{card}</div>}
      />

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
