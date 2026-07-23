"use client";

/**
 * Become-a-merchant form (homepage CTA → /merchants).
 * Creates Merchant profile and upgrades User.role to MERCHANT.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect } from "react";
import {
  createMerchantAction,
  type MerchantActionState,
} from "@/actions/merchant";
import { Logo } from "@/components/layout";

const initialState: MerchantActionState = {
  ok: false,
  message: "",
};

const fieldClass =
  "w-full rounded-[10px] bg-search px-5 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-muted focus:ring-1 focus:ring-ink/15";

export function MerchantApplyForm() {
  const router = useRouter();
  const { update } = useSession();
  const [state, formAction, pending] = useActionState(
    createMerchantAction,
    initialState,
  );

  useEffect(() => {
    async function finish() {
      if (!state.ok) return;
      // Refresh JWT so role becomes MERCHANT before hitting the dashboard.
      await update();
      router.push("/merchant/dashboard");
      router.refresh();
    }
    void finish();
  }, [state.ok, update, router]);

  return (
    <div className="mx-auto w-full max-w-lg">
      <Logo />
      <h1 className="mt-8 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Become a merchant
      </h1>
      <p className="mt-2 text-sm text-[#4b4b4b]">
        Create your merchant profile to list businesses, menus, and promotions
        on Suleat.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="companyName">
            Company name
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            maxLength={150}
            className={fieldClass}
            placeholder="Coffee Roasters PH"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="phoneNumber">
            Phone number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            required
            inputMode="numeric"
            maxLength={12}
            className={fieldClass}
            placeholder="09171234567"
          />
          <p className="mt-1 text-xs text-muted">Digits only, up to 12 characters.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="taxId">
            TIN / Tax ID
          </label>
          <input
            id="taxId"
            name="taxId"
            required
            inputMode="numeric"
            maxLength={12}
            minLength={12}
            className={fieldClass}
            placeholder="123456789012"
          />
          <p className="mt-1 text-xs text-muted">Exactly 12 digits.</p>
        </div>

        {state.message && !state.ok ? (
          <p className="rounded-[10px] bg-[#fff0e7] px-4 py-3 text-sm text-brand">
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full disabled:opacity-60"
        >
          {pending ? "Creating profile…" : "Create merchant account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#4b4b4b]">
        Already a merchant?{" "}
        <Link href="/merchant/dashboard" className="font-medium text-brand">
          Go to dashboard
        </Link>
      </p>
    </div>
  );
}
