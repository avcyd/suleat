"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteBusinessAction } from "@/actions/admin";
import { ConfirmDialog } from "@/components/merchant/ConfirmDialog";
import { SmartImage } from "@/components/ui/SmartImage";
import type { AdminBusinessDetail } from "@/types/admin";
import { DetailDrawer } from "./DetailDrawer";

type BusinessDetailDrawerProps = {
  business: AdminBusinessDetail | null;
  closeHref: string;
};

export function BusinessDetailDrawer({
  business,
  closeHref,
}: BusinessDetailDrawerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function confirmDelete() {
    if (!business) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteBusinessAction(business.id);
      if (!result.ok) {
        setError(result.message);
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      router.replace(closeHref);
      startTransition(() => {
        router.refresh();
      });
    });
  }

  return (
    <>
      <DetailDrawer
        open={!!business}
        title="Business details"
        closeHref={closeHref}
        elevate
      >
        {business ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-muted">{business.companyName}</p>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={pending}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-deep hover:bg-brand/10 disabled:opacity-60"
              >
                Delete business
              </button>
            </div>

            {error ? (
              <p className="mt-2 text-xs text-brand-deep" role="alert">
                {error}
              </p>
            ) : null}

            <div className="relative mt-4 aspect-[2.2/1] overflow-hidden rounded-lg">
              <SmartImage
                src={business.coverPhoto}
                alt=""
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>

            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
              {business.businessName}
            </h3>
            <p className="mt-1 text-xs text-muted">
              Est. {business.dateEstablishment} · {business.promotionCount} posts
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#4b4b4b]">
              {business.description}
            </p>

            <dl className="mt-4 grid gap-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Business ID
                </dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-ink">
                  {business.id}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <h4 className="text-sm font-semibold text-ink">
                Locations ({business.branchTotal})
              </h4>
              {business.branches.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No branches.</p>
              ) : (
                <>
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
                  {business.branchTotal > business.branches.length ? (
                    <p className="mt-2 text-xs text-muted">
                      Showing first {business.branches.length} of{" "}
                      {business.branchTotal}
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="mt-5">
              <details className="group rounded-lg border border-black/8 bg-search/50 open:bg-white">
                <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    <span>Menu ({business.menuTotal})</span>
                    <span className="text-xs font-normal text-muted transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </span>
                </summary>
                {business.menu.length === 0 ? (
                  <p className="border-t border-black/6 px-3 py-2 text-sm text-muted">
                    No menu items.
                  </p>
                ) : (
                  <ul className="divide-y divide-black/5 border-t border-black/6 px-3">
                    {business.menu.map((item) => (
                      <li key={item.id} className="py-2.5">
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
                            <p className="text-[11px] text-muted">
                              {item.categoryLabel}
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
                )}
                {business.menuTotal > business.menu.length ? (
                  <p className="border-t border-black/6 px-3 py-2 text-xs text-muted">
                    Showing first {business.menu.length} of {business.menuTotal}
                  </p>
                ) : null}
              </details>
            </div>
          </>
        ) : null}
      </DetailDrawer>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this business?"
        message={
          business
            ? `This permanently removes “${business.businessName}”, its branches, menu, and posts. This cannot be undone.`
            : ""
        }
        confirmLabel={pending ? "Deleting…" : "Delete"}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
