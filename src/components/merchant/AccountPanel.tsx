"use client";

import { FormEvent, useState } from "react";
import type { MerchantAccount } from "@/types/merchant";
import { ConfirmDialog } from "./ConfirmDialog";

type AccountPanelProps = {
  account: MerchantAccount;
  onUpdate: (account: MerchantAccount) => void;
  onDelete: () => void;
};

export function AccountPanel({
  account,
  onUpdate,
  onDelete,
}: AccountPanelProps) {
  const [form, setForm] = useState(account);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onUpdate(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Account Management
        </h2>
        <p className="mt-1 text-sm text-[#4b4b4b]">
          Update your merchant account details or delete the account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-[18px] border border-black/5 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6"
      >
        {(
          [
            ["displayName", "Display name"],
            ["email", "Email"],
            ["companyName", "Company name"],
            ["phoneNumber", "Phone number"],
            ["taxId", "Tax ID"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              {label}
            </label>
            <input
              required
              type={key === "email" ? "email" : "text"}
              value={form[key]}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, [key]: event.target.value }))
              }
              className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
            />
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white"
          >
            Update Account
          </button>
          {saved ? (
            <span className="text-sm font-medium text-green-700">
              Changes saved
            </span>
          ) : null}
        </div>
      </form>

      <div className="max-w-xl rounded-[18px] border border-brand/20 bg-[#fff7f7] p-5 sm:p-6">
        <h3 className="font-semibold text-brand-deep">Danger zone</h3>
        <p className="mt-1 text-sm text-[#4b4b4b]">
          Deleting your merchant account removes access to the dashboard. This
          frontend mock only clears local state.
        </p>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="mt-4 rounded-full border border-brand px-5 py-2.5 text-sm font-medium text-brand"
        >
          Delete Account
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete merchant account?"
        message="You will lose access to business profiles and promotions in this dashboard session."
        confirmLabel="Delete account"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete();
        }}
      />
    </div>
  );
}
