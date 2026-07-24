"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { getPublicBusinessAction } from "@/actions/public-business";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Offer } from "@/types/landing";
import { formatMenuPrice } from "@/types/merchant";
import type { PublicBusinessView } from "@/types/public-business";

type OfferOverlayProps = {
  offer: Offer | null;
  onClose: () => void;
};

type Panel = "offer" | "business";

/** In-memory cache so reopening the same business is instant. */
const businessCache = new Map<string, PublicBusinessView>();

function formatExpiresIn(endDateYmd: string): string {
  const end = new Date(`${endDateYmd}T23:59:59`);
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "Expired";

  const hours = Math.ceil(ms / (1000 * 60 * 60));
  if (hours < 24) {
    return hours <= 1 ? "1 hour" : `${hours} hours`;
  }

  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return days === 1 ? "1 day" : `${days} days`;
}

function formatStartDate(ymd: string): string {
  const date = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(date.getTime())) return ymd;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function OfferPrice({ offer }: { offer: Offer }) {
  const original = formatMenuPrice(offer.menuPrice);

  if (offer.promotionType === "DISCOUNT" && offer.discountPercent != null) {
    const discounted =
      offer.menuPrice *
      (1 - Math.min(100, Math.max(0, offer.discountPercent)) / 100);
    return (
      <dd className="text-right font-medium text-ink">
        <span className="mr-2 text-muted line-through">{original}</span>
        <span className="text-brand-deep">{formatMenuPrice(discounted)}</span>
      </dd>
    );
  }

  return <dd className="font-medium text-ink">{original}</dd>;
}

async function loadBusiness(businessId: string): Promise<PublicBusinessView> {
  const cached = businessCache.get(businessId);
  if (cached) return cached;

  const result = await getPublicBusinessAction(businessId);
  if (!result.ok || !result.business) {
    throw new Error(result.message || "Could not load business.");
  }
  businessCache.set(businessId, result.business);
  return result.business;
}

function MenuDropdown({
  menu,
}: {
  menu: PublicBusinessView["menu"];
}) {
  const byCategory = useMemo(() => {
    const groups = new Map<string, PublicBusinessView["menu"]>();
    for (const item of menu) {
      const list = groups.get(item.categoryLabel) ?? [];
      list.push(item);
      groups.set(item.categoryLabel, list);
    }
    return [...groups.entries()];
  }, [menu]);

  if (menu.length === 0) {
    return <p className="mt-2 text-sm text-muted">No menu items yet.</p>;
  }

  return (
    <div className="mt-2 space-y-2">
      <details className="group rounded-lg border border-black/8 bg-search/60 open:bg-white">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            <span>Menu ({menu.length} items)</span>
            <span className="text-xs text-muted transition-transform group-open:rotate-180">
              ▾
            </span>
          </span>
        </summary>
        <div className="space-y-2 border-t border-black/6 px-2 py-2">
          {byCategory.map(([category, items]) => (
            <details
              key={category}
              className="rounded-md bg-search/80 open:bg-search"
            >
              <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  <span>
                    {category} ({items.length})
                  </span>
                  <span className="normal-case tracking-normal">▾</span>
                </span>
              </summary>
              <ul className="divide-y divide-black/5 px-3 pb-2">
                {items.map((item) => (
                  <li key={item.id} className="py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">
                          {item.itemName}
                          {!item.isAvailable ? (
                            <span className="ml-1.5 text-[10px] font-normal text-muted">
                              Unavailable
                            </span>
                          ) : null}
                        </p>
                        {item.description ? (
                          <p className="mt-0.5 text-xs text-[#555]">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-ink">
                        {item.priceLabel}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </details>
    </div>
  );
}

function BusinessPanel({ businessId }: { businessId: string }) {
  const [pending, startTransition] = useTransition();
  const [business, setBusiness] = useState<PublicBusinessView | null>(
    () => businessCache.get(businessId) ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = businessCache.get(businessId);
    if (cached) {
      setBusiness(cached);
      setError(null);
      return;
    }

    setError(null);
    setBusiness(null);
    startTransition(async () => {
      try {
        const next = await loadBusiness(businessId);
        setBusiness(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load business.");
      }
    });
  }, [businessId]);

  if (pending && !business) {
    return <p className="py-10 text-center text-sm text-muted">Loading…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-brand-deep" role="alert">
        {error}
      </p>
    );
  }

  if (!business) return null;

  return (
    <div>
      <div className="relative aspect-[2.2/1] overflow-hidden rounded-xl">
        <SmartImage
          src={business.coverPhoto}
          alt=""
          fill
          className="object-cover"
          sizes="500px"
        />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">
        {business.businessName}
      </h3>
      <p className="mt-1 text-xs text-muted">
        {business.companyName} · Est. {business.dateEstablishment}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[#4b4b4b]">
        {business.description}
      </p>

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Locations
        </h4>
        {business.branches.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No branches listed.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {business.branches.map((branch) => (
              <li
                key={branch.id}
                className="rounded-md bg-search px-3 py-2 text-xs text-ink"
              >
                {branch.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Menu
        </h4>
        <MenuDropdown menu={business.menu} />
      </div>
    </div>
  );
}

/**
 * Single portaled overlay for promotion details + nested business view.
 * Portaled to document.body so homepage reveal transforms don't trap it.
 */
export function OfferOverlay({ offer, onClose }: OfferOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [panel, setPanel] = useState<Panel>("offer");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (offer) setPanel("offer");
  }, [offer?.id]);

  // Prefetch business while user reads the promo so "View business" feels instant.
  useEffect(() => {
    if (!offer?.businessId) return;
    if (businessCache.has(offer.businessId)) return;
    void loadBusiness(offer.businessId).catch(() => {
      // Prefetch failures are non-blocking; BusinessPanel will retry.
    });
  }, [offer?.businessId]);

  useEffect(() => {
    if (!offer) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [offer]);

  const handleClose = useCallback(() => {
    setPanel("offer");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!offer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (panel === "business") {
        setPanel("offer");
        return;
      }
      handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [offer, panel, handleClose]);

  if (!mounted || !offer) return null;

  const titleId =
    panel === "offer" ? "offer-overlay-title" : "business-overlay-title";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/40 p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/8 px-5 py-3 sm:px-6">
          <div className="min-w-0">
            {panel === "business" ? (
              <button
                type="button"
                onClick={() => setPanel("offer")}
                className="text-sm font-medium text-brand-deep hover:underline"
              >
                ← Back to post
              </button>
            ) : (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">
                {offer.discountLabel}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-black/[0.04]"
          >
            Close
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          {panel === "offer" ? (
            <div>
              <h2
                id="offer-overlay-title"
                className="font-display text-2xl font-semibold text-ink"
              >
                {offer.title}
              </h2>
              <p className="mt-1 text-xs text-muted">
                {offer.merchant}
                {offer.companyName ? ` · ${offer.companyName}` : ""} ·{" "}
                {offer.menuItemName}
              </p>

              <div className="relative mt-4 aspect-[2.2/1] overflow-hidden rounded-xl">
                <SmartImage
                  src={offer.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="500px"
                />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#4b4b4b]">
                {offer.description}
              </p>

              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Deal</dt>
                  <dd className="font-medium text-ink">{offer.discountLabel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Menu item</dt>
                  <dd className="font-medium text-ink">{offer.menuItemName}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Price</dt>
                  <OfferPrice offer={offer} />
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Start date</dt>
                  <dd className="font-medium text-ink">
                    {formatStartDate(offer.startDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Expires in</dt>
                  <dd className="font-medium text-red-500">
                    {formatExpiresIn(offer.endDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Location</dt>
                  <dd className="max-w-[60%] text-right font-medium text-ink">
                    {offer.address}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setPanel("business")}
                className="mt-6 w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1a2430]"
              >
                View business
              </button>
            </div>
          ) : (
            <>
              <h2 id="business-overlay-title" className="sr-only">
                Business details
              </h2>
              <BusinessPanel businessId={offer.businessId} />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
