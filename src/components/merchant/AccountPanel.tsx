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
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Account Management
        </h2>
        <p className="mt-1 text-sm text-[#4b4b4b]">
          Update your merchant company details. Display name and email come from
          your user account.
        </p>
      </div>

      <form
        action={formAction}
        className="max-w-xl space-y-4 rounded-[18px] border border-black/5 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Display name
          </label>
          <input
            disabled
            value={account.displayName}
            className="w-full rounded-[10px] bg-search px-4 py-3 text-sm text-muted outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            disabled
            type="email"
            value={account.email}
            className="w-full rounded-[10px] bg-search px-4 py-3 text-sm text-muted outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Company name
          </label>
          <input
            required
            name="companyName"
            defaultValue={account.companyName}
            className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Phone number
          </label>
          <input
            required
            name="phoneNumber"
            defaultValue={account.phoneNumber}
            inputMode="numeric"
            maxLength={12}
            className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Tax ID
          </label>
          <input
            required
            name="taxId"
            defaultValue={account.taxId}
            inputMode="numeric"
            maxLength={12}
            minLength={12}
            className="w-full rounded-[10px] bg-search px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-ink/10"
          />
        </div>

        {state.message && !state.ok ? (
          <p className="text-sm text-brand">{state.message}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Update Account"}
          </button>
          {savedFlash ? (
            <span className="text-sm font-medium text-green-700">
              Changes saved
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
