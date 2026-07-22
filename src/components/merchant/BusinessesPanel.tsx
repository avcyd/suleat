"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import type { BranchLocation, BusinessProfile, SortDirection } from "@/types/merchant";
import { formatBranchAddress, formatBranchLabel } from "@/types/merchant";
import { ConfirmDialog } from "./ConfirmDialog";
import { SearchSortBar } from "./SearchSortBar";

type BusinessesPanelProps = {
  businesses: BusinessProfile[];
  onCreate: (business: Omit<BusinessProfile, "id" | "createdAt">) => void;
  onUpdate: (business: BusinessProfile) => void;
  onDelete: (id: string) => void;
};

type BranchDraft = Omit<BranchLocation, "id"> & { id?: string };

const emptyBranch = (): BranchDraft => ({
  number: "",
  building: "",
  street: "",
  barangay: "",
  city: "",
  province: "",
});

const emptyForm = {
  businessName: "",
  description: "",
  dateEstablishment: "",
  coverPhoto: "/images/landing/offer-latte.png",
  branches: [emptyBranch()] as BranchDraft[],
};

function createLocalId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function BusinessesPanel({
  businesses,
  onCreate,
  onUpdate,
  onDelete,
}: BusinessesPanelProps) {
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [selectedId, setSelectedId] = useState<string | null>(
    businesses[0]?.id ?? null,
  );
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = businesses.filter((business) => {
      if (!q) return true;
      const branchHit = business.branches.some(
        (branch) =>
          branch.city.toLowerCase().includes(q) ||
          branch.barangay.toLowerCase().includes(q) ||
          branch.street.toLowerCase().includes(q) ||
          formatBranchLabel(branch).toLowerCase().includes(q),
      );
      return (
        business.businessName.toLowerCase().includes(q) ||
        business.description.toLowerCase().includes(q) ||
        branchHit
      );
    });

    return [...list].sort((a, b) => {
      const cmp = a.businessName.localeCompare(b.businessName);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [businesses, query, sortDir]);

  const selected =
    filtered.find((business) => business.id === selectedId) ??
    filtered[0] ??
    null;

  function openCreate() {
    setMode("create");
    setFormError(null);
    setForm(emptyForm);
  }

  function openEdit(business: BusinessProfile) {
    setSelectedId(business.id);
    setMode("edit");
    setFormError(null);
    setForm({
      businessName: business.businessName,
      description: business.description,
      dateEstablishment: business.dateEstablishment,
      coverPhoto: business.coverPhoto,
      branches: business.branches.map((branch) => ({ ...branch })),
    });
  }

  function updateBranch(
    index: number,
    key: keyof Omit<BranchLocation, "id">,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      branches: prev.branches.map((branch, i) =>
        i === index ? { ...branch, [key]: value } : branch,
      ),
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (form.branches.length === 0) {
      setFormError("Add at least one branch. A business can have multiple locations.");
      return;
    }

    const branches: BranchLocation[] = form.branches.map((branch) => ({
      id: branch.id ?? createLocalId("br"),
      number: branch.number.trim(),
      building: branch.building?.trim() || undefined,
      street: branch.street.trim(),
      barangay: branch.barangay.trim(),
      city: branch.city.trim(),
      province: branch.province.trim(),
    }));

    const payload = {
      businessName: form.businessName,
      description: form.description,
      dateEstablishment: form.dateEstablishment,
      coverPhoto: form.coverPhoto,
      branches,
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
            Business Profiles
          </h2>
          <p className="mt-1 text-sm text-[#4b4b4b]">
            Manage businesses and their branches — one business can have multiple
            locations.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Create Business
        </button>
      </div>

      <SearchSortBar
        query={query}
        onQueryChange={setQuery}
        sortLabel={sortDir === "asc" ? "A → Z" : "Z → A"}
        onToggleSort={() =>
          setSortDir((value) => (value === "asc" ? "desc" : "asc"))
        }
        placeholder="Search businesses or branches..."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
        <div className="space-y-3">
          {filtered.map((business) => {
            const active = selected?.id === business.id && mode === "view";
            const primary = business.branches[0];
            return (
              <button
                key={business.id}
                type="button"
                onClick={() => {
                  setSelectedId(business.id);
                  setMode("view");
                }}
                className={`w-full rounded-[14px] border p-4 text-left transition-colors ${
                  active
                    ? "border-brand/40 bg-offer-hover"
                    : "border-transparent bg-offer-static hover:bg-offer-hover"
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-[10px]">
                    <Image
                      src={business.coverPhoto}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {business.businessName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {business.branches.length} branch
                      {business.branches.length === 1 ? "" : "es"}
                      {primary ? ` · ${primary.city}` : null}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-[#4b4b4b]">
                      {business.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <p className="rounded-[14px] bg-offer-static px-4 py-8 text-center text-sm text-[#4b4b4b]">
              No businesses match your search.
            </p>
          ) : null}
        </div>

        <div className="rounded-[18px] border border-black/5 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
          {mode === "view" && selected ? (
            <div>
              <div className="relative mb-5 aspect-[16/7] overflow-hidden rounded-[14px]">
                <Image
                  src={selected.coverPhoto}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="600px"
                />
              </div>
              <h3 className="font-display text-2xl font-semibold text-ink">
                {selected.businessName}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#4b4b4b]">
                {selected.description}
              </p>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Established
                  </dt>
                  <dd className="mt-1 font-medium">{selected.dateEstablishment}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Branches
                  </dt>
                  <dd className="mt-1 font-medium">{selected.branches.length}</dd>
                </div>
              </dl>

              <div className="mt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Locations
                </h4>
                <ul className="mt-2 space-y-2">
                  {selected.branches.map((branch) => (
                    <li
                      key={branch.id}
                      className="rounded-[10px] bg-search px-3 py-2.5 text-sm text-ink"
                    >
                      {formatBranchAddress(branch)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(selected)}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white"
                >
                  Update Profile
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(selected.id)}
                  className="rounded-full border border-brand px-5 py-2.5 text-sm font-medium text-brand"
                >
                  Delete Profile
                </button>
              </div>
            </div>
          ) : null}

          {mode === "view" && !selected ? (
            <p className="py-10 text-center text-sm text-[#4b4b4b]">
              Select a business or create a new profile.
            </p>
          ) : null}

          {(mode === "create" || mode === "edit") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display text-2xl font-semibold text-ink">
                {mode === "create"
                  ? "Create Business Profile"
                  : "Update Business Profile"}
              </h3>
              {(
                [
                  ["businessName", "Business name"],
                  ["description", "Description"],
                  ["dateEstablishment", "Date established"],
                  ["coverPhoto", "Cover photo URL"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    {label}
                  </label>
                  {key === "description" ? (
                    <textarea
                      required
                      rows={3}
                      value={form[key]}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }))
                      }
                      className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
                    />
                  ) : (
                    <input
                      required
                      type={key === "dateEstablishment" ? "date" : "text"}
                      value={form[key]}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }))
                      }
                      className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
                    />
                  )}
                </div>
              ))}

              <div className="space-y-3 border-t border-black/5 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Branches</h4>
                    <p className="text-xs text-muted">
                      Add every location where this business operates.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        branches: [...prev.branches, emptyBranch()],
                      }))
                    }
                    className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink hover:bg-black/5"
                  >
                    Add branch
                  </button>
                </div>

                {form.branches.map((branch, index) => (
                  <div
                    key={branch.id ?? `new-${index}`}
                    className="space-y-3 rounded-[12px] bg-search p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Branch {index + 1}
                      </p>
                      {form.branches.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              branches: prev.branches.filter(
                                (_, i) => i !== index,
                              ),
                            }))
                          }
                          className="text-xs font-medium text-brand"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          ["number", "Unit / number"],
                          ["building", "Building (optional)"],
                          ["street", "Street"],
                          ["barangay", "Barangay"],
                          ["city", "City"],
                          ["province", "Province"],
                        ] as const
                      ).map(([key, label]) => (
                        <div
                          key={key}
                          className={key === "street" ? "sm:col-span-2" : ""}
                        >
                          <label className="mb-1 block text-xs font-medium text-ink">
                            {label}
                          </label>
                          <input
                            required={key !== "building"}
                            value={branch[key] ?? ""}
                            onChange={(event) =>
                              updateBranch(index, key, event.target.value)
                            }
                            className="w-full rounded-[10px] bg-white px-3 py-2.5 text-sm outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {formError ? (
                  <p className="text-sm text-brand">{formError}</p>
                ) : null}
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
        title="Delete business profile?"
        message="This removes the business and its branches from your dashboard. Linked promotions will also be removed."
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
