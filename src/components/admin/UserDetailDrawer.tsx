"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  updateUserRoleAction,
  type AdminActionState,
} from "@/actions/admin";
import type { AdminUserDetail } from "@/types/admin";
import { userRoles } from "@/validators/admin";
import { DetailDrawer } from "./DetailDrawer";

type UserDetailDrawerProps = {
  user: AdminUserDetail | null;
  closeHref: string;
};

const initialState: AdminActionState = { ok: false, message: "" };

export function UserDetailDrawer({ user, closeHref }: UserDetailDrawerProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateUserRoleAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, state.message, router]);

  return (
    <DetailDrawer
      open={!!user}
      title="User details"
      closeHref={closeHref}
    >
      {user ? (
        <>
          <dl className="grid gap-3">
            <Detail label="Display name" value={user.displayName} />
            <Detail label="Email" value={user.email} />
            <Detail label="User ID" value={user.id} mono />
            <Detail label="Role" value={user.role} />
            {user.companyName ? (
              <Detail label="Company" value={user.companyName} />
            ) : null}
          </dl>

          {user.merchant ? (
            <div className="mt-5 rounded-lg bg-search/80 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Merchant profile
              </p>
              <dl className="mt-2 grid gap-2">
                <Detail label="Phone" value={user.merchant.phoneNumber} />
                <Detail label="Tax ID" value={user.merchant.taxId} />
                <Detail
                  label="Verified"
                  value={user.merchant.verificationStatus ? "Yes" : "No"}
                />
                <Detail label="Merchant ID" value={user.merchant.id} mono />
              </dl>
            </div>
          ) : null}

          <form
            action={formAction}
            className="mt-6 border-t border-black/8 pt-5"
          >
            <h3 className="text-sm font-semibold text-ink">Access control</h3>
            <p className="mt-1 text-xs text-muted">
              Change this user&apos;s platform role.
            </p>
            <input type="hidden" name="userId" value={user.id} />
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="min-w-[140px] flex-1">
                <label
                  htmlFor="admin-user-role"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Role
                </label>
                <select
                  id="admin-user-role"
                  name="role"
                  defaultValue={user.role}
                  key={user.id + user.role}
                  className="w-full rounded-lg bg-search px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ink/10"
                >
                  {userRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-[#1a2430] disabled:opacity-60"
              >
                {pending ? "Saving…" : "Update role"}
              </button>
            </div>
            {state.message ? (
              <p
                className={`mt-2 text-xs ${
                  state.ok ? "text-emerald-700" : "text-brand-deep"
                }`}
                role="status"
              >
                {state.message}
              </p>
            ) : null}
          </form>
        </>
      ) : null}
    </DetailDrawer>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd
        className={`mt-0.5 break-all text-sm text-ink ${
          mono ? "font-mono text-xs" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
