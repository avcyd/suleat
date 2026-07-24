"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveMerchantRequestAction,
  rejectMerchantRequestAction,
} from "@/actions/admin";
import { ConfirmDialog } from "@/components/merchant/ConfirmDialog";
import type { AdminMerchantRequest, AdminPageResult } from "@/types/admin";
import { AdminSearchBar } from "./AdminSearchBar";
import { Pagination } from "./Pagination";

type RequestsPanelProps = {
  result: AdminPageResult<AdminMerchantRequest>;
  query: string;
  sort: string;
  listParams: Record<string, string | undefined>;
  baseParams: Record<string, string | undefined>;
};

type PendingAction =
  | { type: "approve"; id: string; name: string }
  | { type: "reject"; id: string; name: string }
  | null;

/**
 * Merchant role requests — approve grants MERCHANT; reject removes the application.
 */
export function RequestsPanel({
  result,
  query,
  sort,
  listParams,
  baseParams,
}: RequestsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  function confirmAction() {
    if (!action) return;
    setError(null);
    startTransition(async () => {
      const result =
        action.type === "approve"
          ? await approveMerchantRequestAction(action.id)
          : await rejectMerchantRequestAction(action.id);
      if (!result.ok) {
        setError(result.message);
        setAction(null);
        return;
      }
      setAction(null);
      startTransition(() => {
        router.refresh();
      });
    });
  }

  return (
    <>
      <div>
        <AdminSearchBar
          defaultQuery={query}
          placeholder="Search applications..."
          baseParams={baseParams}
          currentSort={sort}
          sortOptions={[
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
            { value: "companyName", label: "Company A–Z" },
            { value: "-companyName", label: "Company Z–A" },
            { value: "email", label: "Email A–Z" },
            { value: "-email", label: "Email Z–A" },
          ]}
        />

        {error ? (
          <p className="px-4 pt-3 text-xs text-brand-deep" role="alert">
            {error}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-black/8 bg-search/50 text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Company</th>
                <th className="px-4 py-2.5 font-semibold">Applicant</th>
                <th className="px-4 py-2.5 font-semibold">Phone</th>
                <th className="px-4 py-2.5 font-semibold">Tax ID</th>
                <th className="px-4 py-2.5 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {result.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted"
                  >
                    No pending merchant requests.
                  </td>
                </tr>
              ) : (
                result.items.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]"
                  >
                    <td className="px-4 py-2.5 font-medium text-ink">
                      {request.companyName}
                    </td>
                    <td className="px-4 py-2.5 text-[#444]">
                      <span className="block">{request.ownerName}</span>
                      <span className="block text-xs text-muted">
                        {request.ownerEmail}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#444]">
                      {request.phoneNumber}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-[#444]">
                      {request.taxId}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setAction({
                              type: "approve",
                              id: request.id,
                              name: request.companyName,
                            })
                          }
                          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a2430] disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setAction({
                              type: "reject",
                              id: request.id,
                              name: request.companyName,
                            })
                          }
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-deep hover:bg-brand/10 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          listParams={listParams}
        />
      </div>

      <ConfirmDialog
        open={action?.type === "approve"}
        title="Approve merchant?"
        message={
          action
            ? `Grant MERCHANT access to “${action.name}”. The applicant can use the merchant dashboard after their next session refresh.`
            : ""
        }
        confirmLabel={pending ? "Approving…" : "Approve"}
        tone="default"
        onConfirm={confirmAction}
        onCancel={() => setAction(null)}
      />

      <ConfirmDialog
        open={action?.type === "reject"}
        title="Reject application?"
        message={
          action
            ? `Remove the pending application for “${action.name}”. The user can submit a new application later.`
            : ""
        }
        confirmLabel={pending ? "Rejecting…" : "Reject"}
        onConfirm={confirmAction}
        onCancel={() => setAction(null)}
      />
    </>
  );
}
