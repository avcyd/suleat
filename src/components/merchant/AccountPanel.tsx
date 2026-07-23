"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  updateMerchantAction,
  type MerchantActionState,
} from "@/actions/merchant";
import type { MerchantAccount } from "@/types/merchant";

type AccountPanelProps = {
  account: MerchantAccount;
};

const initialState: MerchantActionState = {
  ok: false,
  message: "",
};

const fieldClass =
  "w-full rounded-lg bg-search px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ink/10";

export function AccountPanel({ account }: AccountPanelProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateMerchantAction,
    initialState,
  );
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!state.ok) return;
    setSavedFlash(true);
    router.refresh();
    const timer = window.setTimeout(() => setSavedFlash(false), 2000);
    return () => window.clearTimeout(timer);
  }, [state.ok, state.message, router]);

  return (
    <div className="max-w-lg p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Account</h2>
      <p className="mt-1 text-xs text-muted">
        Company details for your merchant profile. Name and email come from your
        user account.
      </p>

      <form action={formAction} className="mt-5 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Display name
          </label>
          <input
            disabled
            value={account.displayName}
            className={`${fieldClass} text-muted`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Email
          </label>
          <input
            disabled
            type="email"
            value={account.email}
            className={`${fieldClass} text-muted`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Company name
          </label>
          <input
            required
            name="companyName"
            defaultValue={account.companyName}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Phone
          </label>
          <input
            required
            name="phoneNumber"
            defaultValue={account.phoneNumber}
            inputMode="numeric"
            maxLength={12}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Tax ID
          </label>
          <input
            required
            name="taxId"
            defaultValue={account.taxId}
            inputMode="numeric"
            maxLength={12}
            minLength={12}
            className={fieldClass}
          />
        </div>

        {state.message ? (
          <p
            className={`rounded-lg px-3 py-2 text-xs ${
              state.ok
                ? "bg-emerald-50 text-emerald-800"
                : "bg-[#fff0e7] text-brand-deep"
            }`}
            role={state.ok ? "status" : "alert"}
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          {savedFlash ? (
            <span className="text-xs font-medium text-green-700">Saved</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
