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

const fieldClass =
  "w-full rounded-lg bg-search px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ink/10";

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
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  function softRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

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
    setFormSuccess(null);

    const fd = buildFormData();

    startTransition(async () => {
      try {
        if (mode === "create") {
          const result = await createMenuItemAction(
            { ok: false, message: "" },
            fd,
          );
          if (!result.ok) {
            setFormError(result.message);
            return;
          }
          setFormSuccess(result.message);
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
          setFormSuccess(result.message);
        }
        setMode("view");
        softRefresh();
      } catch {
        setFormError("Something went wrong. Please try again.");
      }
    });
  }

  function toggleAvailability(item: MenuItem) {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("menuItemId", item.id);
        fd.set("itemName", item.itemName);
        fd.set("description", item.description ?? "");
        fd.set("price", String(item.price));
        fd.set("category", item.category);
        if (!item.isAvailable) fd.set("isAvailable", "true");
        const result = await updateMenuItemAction(
          { ok: false, message: "" },
          fd,
        );
        if (!result.ok) {
          setFormError(result.message);
          return;
        }
        softRefresh();
      } catch {
        setFormError("Could not update availability. Please try again.");
      }
    });
  }

  function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    startTransition(async () => {
      try {
        const result = await deleteMenuItemAction(id);
        if (!result.ok) {
          setFormError(result.message);
          return;
        }
        setMode("view");
        setSelectedId(null);
        setFormSuccess(result.message);
        softRefresh();
      } catch {
        setFormError("Could not delete menu item. Please try again.");
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-black/6 px-4 py-3">
        <select
          value={businessFilter}
          onChange={(event) => setBusinessFilter(event.target.value)}
          className="rounded-lg bg-search px-2.5 py-2 text-sm outline-none"
        >
          <option value="all">All businesses</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.businessName}
            </option>
          ))}
        </select>
        <select
          value={availabilityFilter}
          onChange={(event) =>
            setAvailabilityFilter(
              event.target.value as "all" | "available" | "unavailable",
            )
          }
          className="rounded-lg bg-search px-2.5 py-2 text-sm outline-none"
        >
          <option value="all">All status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <SearchSortBar
          query={query}
          onQueryChange={setQuery}
          sortLabel={sortDir === "asc" ? "A–Z" : "Z–A"}
          onToggleSort={() =>
            setSortDir((value) => (value === "asc" ? "desc" : "asc"))
          }
          placeholder="Search menu…"
        />
        <button
          type="button"
          onClick={openCreate}
          disabled={businesses.length === 0 || pending}
          className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {formError && mode === "view" ? (
        <p className="border-b border-black/6 bg-[#fff0e7] px-4 py-2 text-xs text-brand-deep" role="alert">
          {formError}
        </p>
      ) : null}
      {formSuccess && mode === "view" ? (
        <p className="border-b border-black/6 bg-emerald-50 px-4 py-2 text-xs text-emerald-800" role="status">
          {formSuccess}
        </p>
      ) : null}

      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="max-h-[70vh] overflow-y-auto border-b border-black/6 lg:border-b-0 lg:border-r">
          {groupedByCategory.map(({ category, items }) => (
            <section key={category}>
              <h3 className="sticky top-0 bg-[#fafafa] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                {formatMenuCategory(category)}
              </h3>
              <div className="divide-y divide-black/5">
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
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                        active ? "bg-merchant" : "hover:bg-black/[0.02]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {item.itemName}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {formatMenuPrice(item.price)}
                          {businessFilter === "all"
                            ? ` · ${businessName(item.businessId)}`
                            : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-medium ${
                          item.isAvailable ? "text-green-700" : "text-muted"
                        }`}
                      >
                        {item.isAvailable ? "On" : "Off"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">
              No menu items yet.
            </p>
          ) : null}
        </div>

        <div className="p-4 sm:p-5">
          {mode === "view" && selected ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {formatMenuCategory(selected.category)}
                  </p>
                  <h2 className="mt-0.5 font-display text-xl font-semibold text-ink">
                    {selected.itemName}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {businessName(selected.businessId)} ·{" "}
                    {formatMenuPrice(selected.price)}
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
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggleAvailability(selected)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-black/[0.04] disabled:opacity-60"
                  >
                    {selected.isAvailable ? "Mark off" : "Mark on"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(selected.id)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/5"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {selected.description ? (
                <p className="mt-4 text-sm leading-relaxed text-[#4b4b4b]">
                  {selected.description}
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted">No description.</p>
              )}
            </div>
          ) : null}

          {mode === "view" && !selected ? (
            <p className="py-12 text-center text-sm text-muted">
              Select an item or add a new one.
            </p>
          ) : null}

          {(mode === "create" || mode === "edit") && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-ink">
                  {mode === "create" ? "New item" : "Edit item"}
                </h2>
                <button
                  type="button"
                  onClick={() => setMode("view")}
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
                  disabled={mode === "edit"}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      businessId: event.target.value,
                    }))
                  }
                  className={`${fieldClass} disabled:opacity-70`}
                >
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Name
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
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Description
                </label>
                <textarea
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Price
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
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
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
                    className={fieldClass}
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
                  className="size-3.5 rounded border-black/20"
                />
                Available
              </label>

              {formError ? (
                <p className="rounded-lg bg-[#fff0e7] px-3 py-2 text-xs text-brand-deep" role="alert">
                  {formError}
                </p>
              ) : null}
              {formSuccess ? (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800" role="status">
                  {formSuccess}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {pending ? "Saving…" : mode === "create" ? "Add" : "Save"}
              </button>
            </form>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete menu item?"
        message="This permanently removes the item."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
