"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  approveMerchantRequestAction,
  rejectMerchantRequestAction,
} from "@/actions/admin";
import { ConfirmDialog } from "@/components/merchant/ConfirmDialog";
import {
  paginate,
  parseAdminSort,
  searchAdminRequestList,
  sortAdminRequestList,
} from "@/lib/algorithms/admin";
import { ADMIN_PAGE_SIZE, type AdminMerchantRequest } from "@/types/admin";
import { AdminSearchBar } from "./AdminSearchBar";
import { Pagination } from "./Pagination";

type RequestsPanelProps = {
  items: AdminMerchantRequest[];
};

type PendingAction =
  | { type: "approve"; id: string; name: string }
  | { type: "reject"; id: string; name: string }
  | null;

const SORT_OPTIONS = [
  { value: "-id", label: "Newest" },
  { value: "id", label: "Oldest" },
  { value: "companyName", label: "Company A–Z" },
  { value: "-companyName", label: "Company Z–A" },
  { value: "email", label: "Email A–Z" },
  { value: "-email", label: "Email Z–A" },
];

/**
 * Merchant role requests — approve grants MERCHANT; reject removes the application.
 * Search / sort / paginate run client-side (Linear Search + Merge Sort).
 */
export function RequestsPanel({ items }: RequestsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draftSort, setDraftSort] = useState("-id");
  const [appliedSort, setAppliedSort] = useState("-id");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, appliedSort, items]);

  const result = useMemo(() => {
    const { field, direction } = parseAdminSort(appliedSort);
    const matched = searchAdminRequestList(items, query);
    const sorted = sortAdminRequestList(matched, field || "id", direction);
    return paginate(sorted, page, ADMIN_PAGE_SIZE);
  }, [items, query, appliedSort, page]);

  function confirmAction() {
    if (!action) return;
    setError(null);
    startTransition(async () => {
      const outcome =
        action.type === "approve"
          ? await approveMerchantRequestAction(action.id)
          : await rejectMerchantRequestAction(action.id);
      if (!outcome.ok) {
        setError(outcome.message);
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
          query={query}
          onQueryChange={setQuery}
          placeholder="Search applications..."
          sortOptions={SORT_OPTIONS}
          sortValue={draftSort}
          onSortValueChange={setDraftSort}
          onSort={() => setAppliedSort(draftSort)}
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
          onPageChange={setPage}
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
