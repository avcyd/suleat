"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import {
  createMenuItemAction,
  deleteMenuItemAction,
  updateMenuItemAction,
} from "@/actions/menu";
import type {
  BusinessProfile,
  MenuCategory,
  MenuItem,
  SortDirection,
} from "@/types/merchant";
import {
  MENU_CATEGORIES,
  formatMenuCategory,
  formatMenuPrice,
} from "@/types/merchant";
import { ConfirmDialog } from "./ConfirmDialog";
import { SearchSortBar } from "./SearchSortBar";

type MenuPanelProps = {
  businesses: BusinessProfile[];
  menuItems: MenuItem[];
};

const emptyForm = {
  businessId: "",
  itemName: "",
  description: "",
  price: 100,
  category: "BEVERAGE" as MenuCategory,
  isAvailable: true,
};

export function MenuPanel({ businesses, menuItems }: MenuPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [businessFilter, setBusinessFilter] = useState<string>(
    businesses[0]?.id ?? "all",
  );
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    menuItems[0]?.id ?? null,
  );
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [form, setForm] = useState({
    ...emptyForm,
    businessId: businesses[0]?.id ?? "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const businessName = (id: string) =>
    businesses.find((business) => business.id === id)?.businessName ?? "Unknown";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = menuItems.filter((item) => {
      const matchesBusiness =
        businessFilter === "all" ? true : item.businessId === businessFilter;
      const matchesAvailability =
        availabilityFilter === "all"
          ? true
          : availabilityFilter === "available"
            ? item.isAvailable
            : !item.isAvailable;
      const matchesQuery =
        !q ||
        item.itemName.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false) ||
        businessName(item.businessId).toLowerCase().includes(q) ||
        formatMenuCategory(item.category).toLowerCase().includes(q);
      return matchesBusiness && matchesAvailability && matchesQuery;
    });

    return [...list].sort((a, b) => {
      const cmp = a.itemName.localeCompare(b.itemName);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [
    menuItems,
    businessFilter,
    availabilityFilter,
    query,
    sortDir,
    businesses,
  ]);

  const groupedByCategory = useMemo(() => {
    return MENU_CATEGORIES.flatMap((category) => {
      const items = filtered.filter((item) => item.category === category);
      if (items.length === 0) return [];
      return [{ category, items }];
    });
  }, [filtered]);

  const selected =
    filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  function openCreate() {
    setMode("create");
    setFormError(null);
    setForm({
      ...emptyForm,
      businessId:
        businessFilter !== "all"
          ? businessFilter
          : (businesses[0]?.id ?? ""),
    });
  }

  function openEdit(item: MenuItem) {
    setSelectedId(item.id);
    setMode("edit");
    setFormError(null);
    setForm({
      businessId: item.businessId,
      itemName: item.itemName,
      description: item.description ?? "",
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
    });
  }

  function buildFormData() {
    const fd = new FormData();
    fd.set("businessId", form.businessId);
    fd.set("itemName", form.itemName);
    fd.set("description", form.description);
    fd.set("price", String(form.price));
    fd.set("category", form.category);
    if (form.isAvailable) fd.set("isAvailable", "true");
    return fd;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const fd = buildFormData();
      if (mode === "create") {
        const result = await createMenuItemAction(
          { ok: false, message: "" },
          fd,
        );
        if (!result.ok) {
          setFormError(result.message);
          return;
        }
      } else if (mode === "edit" && selected) {
        fd.set("menuItemId", selected.id);
        const result = await updateMenuItemAction(
          { ok: false, message: "" },
          fd,
        );
        if (!result.ok) {
          setFormError(result.message);
          return;
        }
      }
      setMode("view");
      router.refresh();
    });
  }

  function toggleAvailability(item: MenuItem) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("menuItemId", item.id);
      fd.set("itemName", item.itemName);
      fd.set("description", item.description ?? "");
      fd.set("price", String(item.price));
      fd.set("category", item.category);
      if (!item.isAvailable) fd.set("isAvailable", "true");
      const result = await updateMenuItemAction({ ok: false, message: "" }, fd);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    startTransition(async () => {
      const result = await deleteMenuItemAction(id);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      setMode("view");
      setSelectedId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Menu</h2>
          <p className="mt-1 text-sm text-[#4b4b4b]">
            Manage menu items per business — name, price, category, and
            availability.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={businesses.length === 0 || pending}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Add Menu Item
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="menu-business-filter">
          Filter by business
        </label>
        <select
          id="menu-business-filter"
          value={businessFilter}
          onChange={(event) => setBusinessFilter(event.target.value)}
          className="w-full rounded-full bg-search px-5 py-3 text-sm outline-none sm:max-w-xs"
        >
          <option value="all">All businesses</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.businessName}
            </option>
          ))}
        </select>
        <div className="flex-1">
          <SearchSortBar
            query={query}
            onQueryChange={setQuery}
            sortLabel={sortDir === "asc" ? "A → Z" : "Z → A"}
            onToggleSort={() =>
              setSortDir((value) => (value === "asc" ? "desc" : "asc"))
            }
            placeholder="Search menu items..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["available", "Available"],
            ["unavailable", "Unavailable"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setAvailabilityFilter(value)}
            className={`rounded-[10px] px-4 py-2 text-sm ${
              availabilityFilter === value
                ? "border border-ink bg-ink text-white"
                : "bg-[#eaeaea] text-[#7c7c7c]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {formError && mode === "view" ? (
        <p className="text-sm text-brand">{formError}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          {groupedByCategory.map(({ category, items }) => (
            <section key={category} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {formatMenuCategory(category)}
              </h3>
              <div className="space-y-3">
                {items.map((item) => {
                  const active = selected?.id === item.id && mode === "view";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(item.id);
                        setMode("view");
                        setFormError(null);
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
                            {item.itemName}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {businessName(item.businessId)} ·{" "}
                            {formatMenuPrice(item.price)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            item.isAvailable
                              ? "bg-[#e8f8ef] text-green-700"
                              : "bg-[#f0f0f0] text-[#666]"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      {item.description ? (
                        <p className="mt-2 line-clamp-2 text-xs text-[#4b4b4b]">
                          {item.description}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {filtered.length === 0 ? (
            <p className="rounded-[14px] bg-offer-static px-4 py-8 text-center text-sm text-[#4b4b4b]">
              No menu items yet.
            </p>
          ) : null}
        </div>

        <div className="rounded-[18px] border border-black/5 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
          {mode === "view" && selected ? (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#fff0e7] px-3 py-1 text-xs font-medium text-brand">
                  {formatMenuCategory(selected.category)}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    selected.isAvailable
                      ? "bg-[#e8f8ef] text-green-700"
                      : "bg-search text-[#555]"
                  }`}
                >
                  {selected.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
                {selected.itemName}
              </h3>
              <p className="mt-2 text-sm text-brand">
                {businessName(selected.businessId)}
              </p>
              {selected.description ? (
                <p className="mt-3 text-sm leading-6 text-[#4b4b4b]">
                  {selected.description}
                </p>
              ) : null}
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Price
                  </dt>
                  <dd className="mt-1 font-medium">
                    {formatMenuPrice(selected.price)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Category
                  </dt>
                  <dd className="mt-1 font-medium">
                    {formatMenuCategory(selected.category)}
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
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => toggleAvailability(selected)}
                  className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
                >
                  Mark {selected.isAvailable ? "unavailable" : "available"}
                </button>
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
              Select a menu item or add a new one.
            </p>
          ) : null}

          {(mode === "create" || mode === "edit") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display text-2xl font-semibold text-ink">
                {mode === "create" ? "Add Menu Item" : "Update Menu Item"}
              </h3>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Business
                </label>
                <select
                  required
                  value={form.businessId}
                  disabled={mode === "edit"}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      businessId: event.target.value,
                    }))
                  }
                  className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none disabled:opacity-70"
                >
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Item name
                </label>
                <input
                  required
                  value={form.itemName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      itemName: event.target.value,
                    }))
                  }
                  className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                  className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        price: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Category
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        category: event.target.value as MenuCategory,
                      }))
                    }
                    className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none"
                  >
                    {MENU_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {formatMenuCategory(category)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      isAvailable: event.target.checked,
                    }))
                  }
                  className="size-4 rounded border-black/20"
                />
                Available for ordering
              </label>

              {formError ? (
                <p className="text-sm text-brand">{formError}</p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {pending
                    ? "Saving…"
                    : mode === "create"
                      ? "Add item"
                      : "Save changes"}
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
        title="Delete menu item?"
        message="This permanently removes the item from this business menu."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
