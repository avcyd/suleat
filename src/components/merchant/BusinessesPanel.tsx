"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import {
  addBranchAction,
  createBusinessAction,
  deleteBusinessAction,
  updateBusinessAction,
} from "@/actions/business";
import { SmartImage } from "@/components/ui/SmartImage";
import { isAllowedImageSrc } from "@/lib/images";
import type { BranchLocation, BusinessProfile, SortDirection } from "@/types/merchant";
import { formatBranchAddress, formatBranchLabel } from "@/types/merchant";
import { ConfirmDialog } from "./ConfirmDialog";
import { SearchSortBar } from "./SearchSortBar";

type BusinessesPanelProps = {
  businesses: BusinessProfile[];
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

function todayYmd() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const fieldClass =
  "w-full rounded-lg bg-search px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ink/10";

export function BusinessesPanel({ businesses }: BusinessesPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [selectedId, setSelectedId] = useState<string | null>(
    businesses[0]?.id ?? null,
  );
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [newBranch, setNewBranch] = useState<BranchDraft>(emptyBranch());
  const [branchError, setBranchError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId && !businesses.some((business) => business.id === selectedId)) {
      setSelectedId(businesses[0]?.id ?? null);
    }
  }, [businesses, selectedId]);

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

  function softRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  function openCreate() {
    setMode("create");
    setFormError(null);
    setFormSuccess(null);
    setForm(emptyForm);
  }

  function openEdit(business: BusinessProfile) {
    setSelectedId(business.id);
    setMode("edit");
    setFormError(null);
    setFormSuccess(null);
    setBranchError(null);
    setNewBranch(emptyBranch());
    setForm({
      businessName: business.businessName,
      description: business.description,
      dateEstablishment: business.dateEstablishment,
      coverPhoto: business.coverPhoto,
      branches: business.branches.map((branch) => ({ ...branch })),
    });
  }

  function handleAddBranch() {
    if (!selected) return;
    setBranchError(null);

    const required = [
      newBranch.number,
      newBranch.street,
      newBranch.barangay,
      newBranch.city,
      newBranch.province,
    ];
    if (required.some((value) => !value.trim())) {
      setBranchError("Fill in unit/number, street, barangay, city, and province.");
      return;
    }

    const fd = new FormData();
    fd.set("businessId", selected.id);
    fd.set("number", newBranch.number.trim());
    if (newBranch.building?.trim()) {
      fd.set("building", newBranch.building.trim());
    }
    fd.set("street", newBranch.street.trim());
    fd.set("barangay", newBranch.barangay.trim());
    fd.set("city", newBranch.city.trim());
    fd.set("province", newBranch.province.trim());

    startTransition(async () => {
      try {
        const result = await addBranchAction({ ok: false, message: "" }, fd);
        if (!result.ok) {
          setBranchError(result.message);
          return;
        }
        setNewBranch(emptyBranch());
        setFormSuccess(result.message);
        softRefresh();
      } catch (error) {
        setBranchError(
          error instanceof Error ? error.message : "Could not add branch.",
        );
      }
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

  function validateClient(): string | null {
    if (!form.dateEstablishment) {
      return "Establishment date is required.";
    }
    if (form.dateEstablishment > todayYmd()) {
      return "Establishment date cannot be in the future.";
    }
    if (!isAllowedImageSrc(form.coverPhoto)) {
      return "Cover photo must be a site path or an http(s) image URL.";
    }
    if (mode === "create" && form.branches.length === 0) {
      return "Add at least one branch.";
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
    fd.set("businessName", form.businessName);
    fd.set("description", form.description);
    fd.set("dateEstablishment", form.dateEstablishment);
    fd.set("coverPhoto", form.coverPhoto.trim());

    startTransition(async () => {
      try {
        if (mode === "create") {
          const branches = form.branches.map((branch) => ({
            number: branch.number.trim(),
            building: branch.building?.trim() || undefined,
            street: branch.street.trim(),
            barangay: branch.barangay.trim(),
            city: branch.city.trim(),
            province: branch.province.trim(),
          }));
          fd.set("branches", JSON.stringify(branches));
          const result = await createBusinessAction(
            { ok: false, message: "" },
            fd,
          );
          if (!result.ok) {
            setFormError(result.message);
            return;
          }
          if (result.businessId) {
            setSelectedId(result.businessId);
          }
          setFormSuccess(result.message);
        } else if (mode === "edit" && selected) {
          fd.set("businessId", selected.id);
          const result = await updateBusinessAction(
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

  function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    setFormError(null);
    startTransition(async () => {
      try {
        const result = await deleteBusinessAction(id);
        if (!result.ok) {
          setFormError(result.message);
          return;
        }
        setMode("view");
        setSelectedId(null);
        setFormSuccess(result.message);
        softRefresh();
      } catch {
        setFormError("Could not delete business. Please try again.");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-black/6 px-4 py-3">
        <SearchSortBar
          query={query}
          onQueryChange={setQuery}
          sortLabel={sortDir === "asc" ? "A–Z" : "Z–A"}
          onToggleSort={() =>
            setSortDir((value) => (value === "asc" ? "desc" : "asc"))
          }
          placeholder="Search businesses…"
        />
        <button
          type="button"
          onClick={openCreate}
          disabled={pending}
          className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {(formError || formSuccess) && mode === "view" ? (
        <p
          className={`border-b border-black/6 px-4 py-2 text-xs ${
            formError ? "bg-[#fff0e7] text-brand-deep" : "bg-emerald-50 text-emerald-800"
          }`}
          role={formError ? "alert" : "status"}
        >
          {formError ?? formSuccess}
        </p>
      ) : null}

      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="max-h-[70vh] divide-y divide-black/5 overflow-y-auto border-b border-black/6 lg:border-b-0 lg:border-r">
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
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  active ? "bg-merchant" : "hover:bg-black/[0.02]"
                }`}
              >
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md">
                  <SmartImage
                    src={business.coverPhoto}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {business.businessName}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {business.branches.length} loc.
                    {primary ? ` · ${primary.city}` : ""}
                  </p>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">
              No businesses yet.
            </p>
          ) : null}
        </div>

        <div className="p-4 sm:p-5">
          {mode === "view" && selected ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-semibold text-ink">
                    {selected.businessName}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Est. {selected.dateEstablishment} ·{" "}
                    {selected.branches.length} branch
                    {selected.branches.length === 1 ? "" : "es"}
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
                    onClick={() => setDeleteId(selected.id)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/5"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="relative mt-4 aspect-[2.4/1] overflow-hidden rounded-lg">
                <SmartImage
                  src={selected.coverPhoto}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="500px"
                />
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#4b4b4b]">
                {selected.description}
              </p>

              <ul className="mt-4 space-y-1.5">
                {selected.branches.map((branch) => (
                  <li
                    key={branch.id}
                    className="rounded-md bg-search px-3 py-2 text-xs text-ink"
                  >
                    {formatBranchAddress(branch)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {mode === "view" && !selected ? (
            <p className="py-12 text-center text-sm text-muted">
              Select a business or add a new one.
            </p>
          ) : null}

          {(mode === "create" || mode === "edit") && (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-ink">
                  {mode === "create" ? "New business" : "Edit business"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setMode("view");
                    setFormError(null);
                    setFormSuccess(null);
                  }}
                  className="text-xs font-medium text-muted hover:text-ink"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Name
                </label>
                <input
                  required
                  value={form.businessName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      businessName: event.target.value,
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
                  Established
                </label>
                <input
                  required
                  type="date"
                  max={todayYmd()}
                  value={form.dateEstablishment}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      dateEstablishment: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Cover image URL
                </label>
                <input
                  required
                  type="text"
                  inputMode="url"
                  placeholder="https://… or /images/…"
                  value={form.coverPhoto}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      coverPhoto: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
                <p className="mt-1 text-[11px] text-muted">
                  Use a full http(s) link or a site path starting with /.
                </p>
              </div>

              {mode === "create" ? (
                <div className="space-y-2 border-t border-black/6 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-ink">Branches</p>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          branches: [...prev.branches, emptyBranch()],
                        }))
                      }
                      className="text-xs font-medium text-brand"
                    >
                      + Branch
                    </button>
                  </div>
                  {form.branches.map((branch, index) => (
                    <div
                      key={branch.id ?? `new-${index}`}
                      className="space-y-2 rounded-lg bg-search p-2.5"
                    >
                      <div className="flex justify-between">
                        <span className="text-[11px] font-medium text-muted">
                          #{index + 1}
                        </span>
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
                            className="text-[11px] font-medium text-brand"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {(
                          [
                            ["number", "Unit or number"],
                            ["building", "Building"],
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
                            <label className="mb-0.5 block text-[11px] text-muted">
                              {label}
                            </label>
                            <input
                              required={key !== "building"}
                              value={branch[key] ?? ""}
                              onChange={(event) =>
                                updateBranch(index, key, event.target.value)
                              }
                              className="w-full rounded-md bg-white px-2.5 py-1.5 text-sm outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 border-t border-black/6 pt-3">
                  <p className="text-xs font-semibold text-ink">Branches</p>
                  <ul className="space-y-1.5">
                    {selected?.branches.map((branch) => (
                      <li
                        key={branch.id}
                        className="rounded-md bg-search px-3 py-2 text-xs text-ink"
                      >
                        {formatBranchAddress(branch)}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 rounded-lg bg-search p-2.5">
                    <p className="text-[11px] font-medium text-muted">
                      Add another location
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(
                        [
                          ["number", "Unit or number"],
                          ["building", "Building"],
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
                          <label className="mb-0.5 block text-[11px] text-muted">
                            {label}
                          </label>
                          <input
                            required={key !== "building"}
                            value={newBranch[key] ?? ""}
                            onChange={(event) =>
                              setNewBranch((prev) => ({
                                ...prev,
                                [key]: event.target.value,
                              }))
                            }
                            className="w-full rounded-md bg-white px-2.5 py-1.5 text-sm outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    {branchError ? (
                      <p className="text-[11px] text-brand-deep" role="alert">
                        {branchError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={handleAddBranch}
                      className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                    >
                      {pending ? "Adding…" : "Add branch"}
                    </button>
                  </div>
                </div>
              )}

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
                {pending ? "Saving…" : mode === "create" ? "Create" : "Save"}
              </button>
            </form>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete business?"
        message="This removes the business, branches, and menu items."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
