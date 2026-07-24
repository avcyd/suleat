"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import {
  archivePromotionAction,
  createPromotionAction,
  deletePromotionAction,
  updatePromotionAction,
} from "@/actions/promotion";
import { SmartImage } from "@/components/ui/SmartImage";
import { isAllowedImageSrc } from "@/lib/images";
import type {
  BundleType,
  BusinessProfile,
  MenuItem,
  PromotionPost,
  PromotionType,
} from "@/types/merchant";
import {
  formatBranchAddress,
  formatBranchLabel,
  formatPromotionDeal,
  getEffectiveDiscountPercent,
} from "@/types/merchant";
import {
  PROMOTION_SORT_OPTIONS,
  parsePromotionSort,
  searchPromotions,
  sortPromotions,
} from "@/lib/algorithms/merchant";
import { ConfirmDialog } from "./ConfirmDialog";
import { SearchSortBar } from "./SearchSortBar";

type PromotionsPanelProps = {
  businesses: BusinessProfile[];
  menuItems: MenuItem[];
  promotions: PromotionPost[];
};

const emptyForm = {
  businessId: "",
  branchId: "",
  menuId: "",
  caption: "",
  description: "",
  imageUrl: "",
  promotionType: "DISCOUNT" as PromotionType,
  discountPercent: 10,
  bundleType: "FREE" as BundleType,
  buyQuantity: 1,
  getQuantity: 1,
  bundleDiscountPercent: 10,
  startDate: "",
  endDate: "",
};

const fieldClass =
  "w-full rounded-lg bg-search px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ink/10";

function promoImage(promo: PromotionPost) {
  return (
    promo.imageUrl ||
    promo.coverPhotoFallback ||
    "/images/landing/offer-latte.png"
  );
}

export function PromotionsPanel({
  businesses,
  menuItems,
  promotions,
}: PromotionsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [draftSort, setDraftSort] = useState<string>(
    PROMOTION_SORT_OPTIONS[0].value,
  );
  const [appliedSort, setAppliedSort] = useState<string>(
    PROMOTION_SORT_OPTIONS[0].value,
  );
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId && !promotions.some((promo) => promo.id === selectedId)) {
      setSelectedId(promotions[0]?.id ?? null);
    }
  }, [promotions, selectedId]);

  function softRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

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

  const menuForBusiness = useMemo(() => {
    return menuItems.filter((item) => item.businessId === form.businessId);
  }, [menuItems, form.businessId]);

  const canCreate = useMemo(() => {
    return businessesWithBranches.some((business) =>
      menuItems.some((item) => item.businessId === business.id),
    );
  }, [businessesWithBranches, menuItems]);

  const filtered = useMemo(() => {
    const scoped = promotions.filter((promo) =>
      statusFilter === "all" ? true : promo.status === statusFilter,
    );

    // Linear Search → Merge Sort (caption or expiration).
    const matched = searchPromotions(
      scoped,
      query,
      businessName,
      (promo) => {
        const branch = branchFor(promo.businessId, promo.branchId);
        return branch ? formatBranchLabel(branch) : undefined;
      },
    );
    const { key, direction } = parsePromotionSort(appliedSort);
    return sortPromotions(matched, key, direction);
  }, [promotions, query, appliedSort, statusFilter, businesses, menuItems]);

  const selected =
    filtered.find((promo) => promo.id === selectedId) ?? filtered[0] ?? null;

  function openCreate() {
    const first = businessesWithBranches.find((business) =>
      menuItems.some((item) => item.businessId === business.id),
    );
    const firstMenu =
      menuItems.find((item) => item.businessId === first?.id)?.id ?? "";
    setMode("create");
    setFormError(null);
    setFormSuccess(null);
    setImageFile(null);
    setForm({
      ...emptyForm,
      businessId: first?.id ?? "",
      branchId: first?.branches[0]?.id ?? "",
      menuId: firstMenu,
    });
  }

  function openEdit(promo: PromotionPost) {
    setSelectedId(promo.id);
    setMode("edit");
    setFormError(null);
    setFormSuccess(null);
    setImageFile(null);
    setForm({
      businessId: promo.businessId,
      branchId: promo.branchId,
      menuId: promo.menuId,
      caption: promo.caption,
      description: promo.description,
      imageUrl: promo.imageUrl ?? "",
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

  function validateClient(): string | null {
    if (!form.branchId) return "Branch is required.";
    if (!form.menuId) return "Select the menu item this deal applies to.";
    if (form.imageUrl.trim() && !isAllowedImageSrc(form.imageUrl)) {
      return "Image URL must be a site path or an http(s) link.";
    }
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      return "End date must be on or after the start date.";
    }
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const clientError = validateClient();
    if (clientError) {
      setFormError(clientError);
      return;
    }

    const fd = new FormData();
    fd.set("businessId", form.businessId);
    fd.set("branchId", form.branchId);
    fd.set("menuId", form.menuId);
    fd.set("caption", form.caption);
    fd.set("description", form.description);
    if (form.imageUrl.trim()) {
      fd.set("imageUrl", form.imageUrl.trim());
    }
    if (imageFile) {
      fd.set("imageFile", imageFile);
    }
    fd.set("promotionType", form.promotionType);
    if (form.promotionType === "DISCOUNT") {
      fd.set("discountPercent", String(form.discountPercent));
    } else {
      fd.set("bundleType", form.bundleType);
      fd.set("buyQuantity", String(form.buyQuantity));
      if (form.bundleType === "FREE") {
        fd.set("getQuantity", String(form.getQuantity));
      } else {
        fd.set("bundleDiscountPercent", String(form.bundleDiscountPercent));
      }
    }
    fd.set("startDate", form.startDate);
    fd.set("endDate", form.endDate);

    startTransition(async () => {
      try {
        if (mode === "create") {
          const result = await createPromotionAction(
            { ok: false, message: "" },
            fd,
          );
          if (!result.ok) {
            setFormError(result.message);
            return;
          }
          if (result.promotionId) {
            setSelectedId(result.promotionId);
          }
          setFormSuccess(result.message);
          setMode("view");
          softRefresh();
          return;
        }

        if (mode === "edit" && selected) {
          fd.set("promotionId", selected.id);
          // Keep existing image when no new file/URL is provided.
          if (!imageFile && !form.imageUrl.trim() && selected.imageUrl) {
            fd.set("imageUrl", selected.imageUrl);
          }
          const result = await updatePromotionAction(
            { ok: false, message: "" },
            fd,
          );
          if (!result.ok) {
            setFormError(result.message);
            return;
          }
          setFormSuccess(result.message);
          setMode("view");
          softRefresh();
        }
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    });
  }

  function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    startTransition(async () => {
      const result = await deletePromotionAction(id);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      setMode("view");
      softRefresh();
    });
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      const result = await archivePromotionAction(id);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      softRefresh();
    });
  }

  const coverFallback =
    businesses.find((business) => business.id === form.businessId)
      ?.coverPhoto ?? "/images/landing/offer-latte.png";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-black/6 px-4 py-3">
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as "all" | "active" | "archived",
            )
          }
          className="rounded-lg bg-search px-2.5 py-2 text-sm outline-none"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <SearchSortBar
          query={query}
          onQueryChange={setQuery}
          sortOptions={[...PROMOTION_SORT_OPTIONS]}
          sortValue={draftSort}
          onSortValueChange={setDraftSort}
          onSort={() => setAppliedSort(draftSort)}
          placeholder="Search promotions…"
        />
        <button
          type="button"
          onClick={openCreate}
          disabled={!canCreate}
          className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {(formError || formSuccess) && mode === "view" ? (
        <div className="border-b border-black/6 px-4 py-2">
          {formError ? (
            <p className="text-xs text-brand-deep" role="alert">
              {formError}
            </p>
          ) : null}
          {formSuccess ? (
            <p className="text-xs text-emerald-800" role="status">
              {formSuccess}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="max-h-[70vh] divide-y divide-black/5 overflow-y-auto border-b border-black/6 lg:border-b-0 lg:border-r">
          {filtered.map((promo) => {
            const active = selected?.id === promo.id && mode === "view";
            const branch = branchFor(promo.businessId, promo.branchId);
            return (
              <button
                key={promo.id}
                type="button"
                onClick={() => {
                  setSelectedId(promo.id);
                  setMode("view");
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                  active ? "bg-merchant" : "hover:bg-black/[0.02]"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {promo.caption}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {formatPromotionDeal(promo)}
                    {promo.menuItemName ? ` · ${promo.menuItemName}` : ""}
                    {branch ? ` · ${branch.city}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-medium capitalize ${
                    promo.status === "active" ? "text-green-700" : "text-muted"
                  }`}
                >
                  {promo.status}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">
              {canCreate
                ? "No promotions yet."
                : "Add a business with branches and menu items first."}
            </p>
          ) : null}
        </div>

        <div className="p-4 sm:p-5">
          {mode === "view" && selected ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">
                    {formatPromotionDeal(selected)}
                  </p>
                  <h2 className="mt-0.5 font-display text-xl font-semibold text-ink">
                    {selected.caption}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {businessName(selected.businessId)}
                    {selected.menuItemName
                      ? ` · ${selected.menuItemName}`
                      : ""}{" "}
                    · {selected.startDate} → {selected.endDate}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(selected)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-black/[0.04]"
                  >
                    Edit
                  </button>
                  {selected.status === "active" ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleArchive(selected.id)}
                      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-black/[0.04] disabled:opacity-60"
                    >
                      Archive
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setDeleteId(selected.id)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/5"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="relative mt-4 aspect-[2.4/1] overflow-hidden rounded-lg">
                <SmartImage
                  src={promoImage(selected)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="500px"
                />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#4b4b4b]">
                {selected.description}
              </p>
              <p className="mt-3 text-xs text-muted">
                {(() => {
                  const branch = branchFor(
                    selected.businessId,
                    selected.branchId,
                  );
                  return branch
                    ? formatBranchAddress(branch)
                    : "Branch not found";
                })()}
                {" · "}~{getEffectiveDiscountPercent(selected)}%
              </p>
            </div>
          ) : null}

          {mode === "view" && !selected ? (
            <p className="py-12 text-center text-sm text-muted">
              Select a promotion or add a new one.
            </p>
          ) : null}

          {(mode === "create" || mode === "edit") && (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-ink">
                  {mode === "create" ? "New promotion" : "Edit promotion"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setMode("view");
                    setFormError(null);
                    setFormSuccess(null);
                    setImageFile(null);
                  }}
                  className="text-xs font-medium text-muted hover:text-ink"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Business
                </label>
                <select
                  required
                  value={form.businessId}
                  onChange={(event) => {
                    const businessId = event.target.value;
                    const firstBranch =
                      businesses.find((business) => business.id === businessId)
                        ?.branches[0]?.id ?? "";
                    const firstMenu =
                      menuItems.find((item) => item.businessId === businessId)
                        ?.id ?? "";
                    setForm((prev) => ({
                      ...prev,
                      businessId,
                      branchId: firstBranch,
                      menuId: firstMenu,
                    }));
                  }}
                  className={fieldClass}
                >
                  {businessesWithBranches.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
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
                  className={fieldClass}
                >
                  {selectedBusinessBranches.length === 0 ? (
                    <option value="" disabled>
                      No branches
                    </option>
                  ) : (
                    selectedBusinessBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {formatBranchLabel(branch)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Menu item
                </label>
                <select
                  required
                  value={form.menuId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      menuId: event.target.value,
                    }))
                  }
                  className={fieldClass}
                >
                  {menuForBusiness.length === 0 ? (
                    <option value="" disabled>
                      No menu items for this business
                    </option>
                  ) : (
                    menuForBusiness.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.itemName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Caption
                </label>
                <input
                  required
                  value={form.caption}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, caption: event.target.value }))
                  }
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Promo image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) =>
                    setImageFile(event.target.files?.[0] ?? null)
                  }
                  className="w-full text-sm"
                />
                <input
                  type="text"
                  inputMode="url"
                  placeholder="Or paste image URL (optional)"
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      imageUrl: event.target.value,
                    }))
                  }
                  className={`mt-2 ${fieldClass}`}
                />
                <p className="mt-1 text-[11px] text-muted">
                  Optional. If empty, the business cover image is used.
                </p>
                {!imageFile && !form.imageUrl.trim() ? (
                  <div className="relative mt-2 aspect-[2.4/1] overflow-hidden rounded-lg opacity-80">
                    <SmartImage
                      src={coverFallback}
                      alt="Cover fallback preview"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Type
                </label>
                <select
                  value={form.promotionType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      promotionType: event.target.value as PromotionType,
                    }))
                  }
                  className={fieldClass}
                >
                  <option value="DISCOUNT">Discount</option>
                  <option value="BUNDLE">Bundle</option>
                </select>
              </div>

              {form.promotionType === "DISCOUNT" ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
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
                    className={fieldClass}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">
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
                      className={fieldClass}
                    >
                      <option value="FREE">Free (Buy X Get Y)</option>
                      <option value="PERCENTAGE_OFF">
                        % off (Buy X Get Y% off)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">
                      Deal
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium">Buy</span>
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
                        className="w-16 rounded-lg bg-search px-2 py-2 text-center text-sm outline-none"
                      />
                      <span className="text-xs font-medium">Get</span>
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
                          className="w-16 rounded-lg bg-search px-2 py-2 text-center text-sm outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            required
                            value={form.bundleDiscountPercent}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                bundleDiscountPercent: Number(
                                  event.target.value,
                                ),
                              }))
                            }
                            className="w-16 rounded-lg bg-search px-2 py-2 text-center text-sm outline-none"
                          />
                          <span className="text-xs font-medium">% off</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Start
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
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    End
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
                    className={fieldClass}
                  />
                </div>
              </div>

              {formError ? (
                <p
                  className="rounded-lg bg-[#fff0e7] px-3 py-2 text-xs text-brand-deep"
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending || menuForBusiness.length === 0}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {pending
                  ? "Saving…"
                  : mode === "create"
                    ? "Create"
                    : "Save"}
              </button>
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
        onConfirm={confirmDelete}
      />
    </div>
  );
}
