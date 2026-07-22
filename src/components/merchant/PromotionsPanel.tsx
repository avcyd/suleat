"use client";

import { FormEvent, useMemo, useState } from "react";
import type {
  BundleType,
  BusinessProfile,
  PromotionPost,
  PromotionType,
  SortDirection,
} from "@/types/merchant";
import {
  formatBranchAddress,
  formatBranchLabel,
  formatPromotionDeal,
  getEffectiveDiscountPercent,
} from "@/types/merchant";
import { ConfirmDialog } from "./ConfirmDialog";
import { SearchSortBar } from "./SearchSortBar";

type PromotionsPanelProps = {
  businesses: BusinessProfile[];
  promotions: PromotionPost[];
  onCreate: (
    promotion: Omit<PromotionPost, "id" | "createdAt" | "status">,
  ) => void;
  onUpdate: (promotion: PromotionPost) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
};

const emptyForm = {
  businessId: "",
  branchId: "",
  caption: "",
  description: "",
  promotionType: "DISCOUNT" as PromotionType,
  discountPercent: 10,
  bundleType: "FREE" as BundleType,
  buyQuantity: 1,
  getQuantity: 1,
  bundleDiscountPercent: 10,
  startDate: "",
  endDate: "",
};

export function PromotionsPanel({
  businesses,
  promotions,
  onCreate,
  onUpdate,
  onDelete,
  onArchive,
}: PromotionsPanelProps) {
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    promotions[0]?.id ?? null,
  );
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [form, setForm] = useState({
    ...emptyForm,
    businessId: businesses[0]?.id ?? "",
    branchId: businesses[0]?.branches[0]?.id ?? "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const businessesWithBranches = useMemo(
    () => businesses.filter((business) => business.branches.length > 0),
    [businesses],
  );

  const businessName = (id: string) =>
    businesses.find((business) => business.id === id)?.businessName ?? "Unknown";

  const branchFor = (businessId: string, branchId: string) =>
    businesses
      .find((business) => business.id === businessId)
      ?.branches.find((branch) => branch.id === branchId);

  const selectedBusinessBranches = useMemo(() => {
    return (
      businesses.find((business) => business.id === form.businessId)?.branches ??
      []
    );
  }, [businesses, form.businessId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = promotions.filter((promo) => {
      const branch = branchFor(promo.businessId, promo.branchId);
      const matchesStatus =
        statusFilter === "all" ? true : promo.status === statusFilter;
      const matchesQuery =
        !q ||
        promo.caption.toLowerCase().includes(q) ||
        promo.description.toLowerCase().includes(q) ||
        businessName(promo.businessId).toLowerCase().includes(q) ||
        formatPromotionDeal(promo).toLowerCase().includes(q) ||
        (branch ? formatBranchLabel(branch).toLowerCase().includes(q) : false);
      return matchesStatus && matchesQuery;
    });

    return [...list].sort((a, b) => {
      const cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [promotions, query, sortDir, statusFilter, businesses]);

  const selected =
    filtered.find((promo) => promo.id === selectedId) ?? filtered[0] ?? null;

  function openCreate() {
    const first = businessesWithBranches[0];
    setMode("create");
    setForm({
      ...emptyForm,
      businessId: first?.id ?? "",
      branchId: first?.branches[0]?.id ?? "",
    });
  }

  function openEdit(promo: PromotionPost) {
    setSelectedId(promo.id);
    setMode("edit");
    setForm({
      businessId: promo.businessId,
      branchId: promo.branchId,
      caption: promo.caption,
      description: promo.description,
      promotionType: promo.promotionType,
      discountPercent: promo.discountPercent ?? 10,
      bundleType: promo.bundleType ?? "FREE",
      buyQuantity: promo.buyQuantity ?? 1,
      getQuantity: promo.getQuantity ?? 1,
      bundleDiscountPercent: promo.bundleDiscountPercent ?? 10,
      startDate: promo.startDate,
      endDate: promo.endDate,
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.branchId) return;

    const isDiscount = form.promotionType === "DISCOUNT";
    const isFreeBundle =
      form.promotionType === "BUNDLE" && form.bundleType === "FREE";
    const isPercentBundle =
      form.promotionType === "BUNDLE" && form.bundleType === "PERCENTAGE_OFF";

    const payload: Omit<PromotionPost, "id" | "createdAt" | "status"> = {
      businessId: form.businessId,
      branchId: form.branchId,
      caption: form.caption,
      description: form.description,
      promotionType: form.promotionType,
      discountPercent: isDiscount ? form.discountPercent : undefined,
      bundleType: form.promotionType === "BUNDLE" ? form.bundleType : undefined,
      buyQuantity:
        isFreeBundle || isPercentBundle ? form.buyQuantity : undefined,
      getQuantity: isFreeBundle ? form.getQuantity : undefined,
      bundleDiscountPercent: isPercentBundle
        ? form.bundleDiscountPercent
        : undefined,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    if (mode === "create") {
      onCreate(payload);
      setMode("view");
      return;
    }
    if (mode === "edit" && selected) {
      onUpdate({ ...selected, ...payload });
      setMode("view");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Posts / Promotions
          </h2>
          <p className="mt-1 text-sm text-[#4b4b4b]">
            Manage promotion posts — create, update, delete, and archive.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={businessesWithBranches.length === 0}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Create Promotion
        </button>
      </div>

      <SearchSortBar
        query={query}
        onQueryChange={setQuery}
        sortLabel={sortDir === "desc" ? "Newest" : "Oldest"}
        onToggleSort={() =>
          setSortDir((value) => (value === "asc" ? "desc" : "asc"))
        }
        placeholder="Search promotions..."
      />

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "archived"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-[10px] px-4 py-2 text-sm capitalize ${
              statusFilter === status
                ? "border border-brand bg-[#fff0e7] text-brand"
                : "bg-[#eaeaea] text-[#7c7c7c]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
        <div className="space-y-3">
          {filtered.map((promo) => {
            const active = selected?.id === promo.id && mode === "view";
            return (
              <button
                key={promo.id}
                type="button"
                onClick={() => {
                  setSelectedId(promo.id);
                  setMode("view");
                }}
                className={`w-full rounded-[14px] border p-4 text-left transition-colors ${
                  active
                    ? "border-brand/40 bg-offer-hover"
                    : "border-transparent bg-offer-static hover:bg-offer-hover"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {promo.caption}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {businessName(promo.businessId)} ·{" "}
                      {formatPromotionDeal(promo)}
                      {(() => {
                        const branch = branchFor(
                          promo.businessId,
                          promo.branchId,
                        );
                        return branch
                          ? ` · ${branch.city}`
                          : " · Unknown branch";
                      })()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                      promo.status === "active"
                        ? "bg-[#e8f8ef] text-green-700"
                        : "bg-[#f0f0f0] text-[#666]"
                    }`}
                  >
                    {promo.status}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-[#4b4b4b]">
                  {promo.description}
                </p>
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <p className="rounded-[14px] bg-offer-static px-4 py-8 text-center text-sm text-[#4b4b4b]">
              No promotions match your filters.
            </p>
          ) : null}
        </div>

        <div className="rounded-[18px] border border-black/5 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
          {mode === "view" && selected ? (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#fff0e7] px-3 py-1 text-xs font-medium text-brand">
                  {formatPromotionDeal(selected)}
                </span>
                {selected.promotionType === "BUNDLE" ? (
                  <span className="rounded-full bg-search px-3 py-1 text-xs text-[#555]">
                    {selected.bundleType === "PERCENTAGE_OFF"
                      ? "Bundle · % off"
                      : "Bundle · Free"}
                  </span>
                ) : (
                  <span className="rounded-full bg-search px-3 py-1 text-xs text-[#555]">
                    Discount
                  </span>
                )}
                <span className="rounded-full bg-search px-3 py-1 text-xs capitalize text-[#555]">
                  {selected.status}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
                {selected.caption}
              </h3>
              <p className="mt-2 text-sm text-brand">
                {businessName(selected.businessId)}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4b4b4b]">
                {selected.description}
              </p>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Effective branch
                  </dt>
                  <dd className="mt-1 font-medium">
                    {(() => {
                      const branch = branchFor(
                        selected.businessId,
                        selected.branchId,
                      );
                      return branch
                        ? formatBranchAddress(branch)
                        : "Branch not found";
                    })()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Start
                  </dt>
                  <dd className="mt-1 font-medium">{selected.startDate}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    End
                  </dt>
                  <dd className="mt-1 font-medium">{selected.endDate}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Effective discount
                  </dt>
                  <dd className="mt-1 font-medium">
                    {getEffectiveDiscountPercent(selected)}%
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(selected)}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white"
                >
                  Update
                </button>
                {selected.status === "active" ? (
                  <button
                    type="button"
                    onClick={() => onArchive(selected.id)}
                    className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink"
                  >
                    Archive
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setDeleteId(selected.id)}
                  className="rounded-full border border-brand px-5 py-2.5 text-sm font-medium text-brand"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : null}

          {mode === "view" && !selected ? (
            <p className="py-10 text-center text-sm text-[#4b4b4b]">
              Select a promotion or create a new post.
            </p>
          ) : null}

          {(mode === "create" || mode === "edit") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display text-2xl font-semibold text-ink">
                {mode === "create" ? "Create Promotion" : "Update Promotion"}
              </h3>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Business</label>
                <select
                  required
                  value={form.businessId}
                  onChange={(event) => {
                    const businessId = event.target.value;
                    const firstBranch =
                      businesses.find((business) => business.id === businessId)
                        ?.branches[0]?.id ?? "";
                    setForm((prev) => ({
                      ...prev,
                      businessId,
                      branchId: firstBranch,
                    }));
                  }}
                  className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                >
                  {businessesWithBranches.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Branch
                </label>
                <select
                  required
                  value={form.branchId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      branchId: event.target.value,
                    }))
                  }
                  className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                >
                  {selectedBusinessBranches.length === 0 ? (
                    <option value="" disabled>
                      No branches for this business
                    </option>
                  ) : (
                    selectedBusinessBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {formatBranchLabel(branch)}
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-1.5 text-xs text-muted">
                  Required — choose which branch this promotion applies to.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Caption</label>
                <input
                  required
                  value={form.caption}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, caption: event.target.value }))
                  }
                  className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Type</label>
                <select
                  value={form.promotionType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      promotionType: event.target.value as PromotionType,
                    }))
                  }
                  className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                >
                  <option value="DISCOUNT">Discount</option>
                  <option value="BUNDLE">Bundle</option>
                </select>
              </div>

              {form.promotionType === "DISCOUNT" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={form.discountPercent}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        discountPercent: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Bundle type
                    </label>
                    <select
                      value={form.bundleType}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          bundleType: event.target.value as BundleType,
                        }))
                      }
                      className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                    >
                      <option value="FREE">Free (Buy X Get Y free)</option>
                      <option value="PERCENTAGE_OFF">
                        Percentage off (Buy X Get Y% off)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Deal
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">Buy</span>
                      <input
                        type="number"
                        min={1}
                        required
                        value={form.buyQuantity}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            buyQuantity: Number(event.target.value),
                          }))
                        }
                        className="w-20 rounded-[10px] bg-search px-3 py-3 text-center text-sm outline-none"
                        aria-label="Buy quantity"
                      />
                      <span className="text-sm font-medium text-ink">Get</span>
                      {form.bundleType === "FREE" ? (
                        <input
                          type="number"
                          min={1}
                          required
                          value={form.getQuantity}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              getQuantity: Number(event.target.value),
                            }))
                          }
                          className="w-20 rounded-[10px] bg-search px-3 py-3 text-center text-sm outline-none"
                          aria-label="Get quantity free"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            required
                            value={form.bundleDiscountPercent}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                bundleDiscountPercent: Number(event.target.value),
                              }))
                            }
                            className="w-20 rounded-[10px] bg-search px-3 py-3 text-center text-sm outline-none"
                            aria-label="Get percent off"
                          />
                          <span className="text-sm font-medium text-ink">
                            % off
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      Preview:{" "}
                      <span className="font-medium text-brand">
                        {form.bundleType === "PERCENTAGE_OFF"
                          ? `Buy ${form.buyQuantity} Get ${form.bundleDiscountPercent}% off`
                          : `Buy ${form.buyQuantity} Get ${form.getQuantity}`}
                      </span>
                      {" · "}
                      Effective discount ~{" "}
                      {getEffectiveDiscountPercent({
                        promotionType: "BUNDLE",
                        bundleType: form.bundleType,
                        buyQuantity: form.buyQuantity,
                        getQuantity: form.getQuantity,
                        bundleDiscountPercent: form.bundleDiscountPercent,
                      })}
                      % (used later for highest-discount sort)
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Start date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        startDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    End date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        endDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white"
                >
                  {mode === "create" ? "Create" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-ink hover:bg-black/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete promotion?"
        message="This permanently removes the post from your promotions list."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDelete(deleteId);
          setDeleteId(null);
          setMode("view");
        }}
      />
    </div>
  );
}
