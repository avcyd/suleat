"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  paginate,
  parseAdminSort,
  searchAdminCompanyList,
  sortAdminCompanyList,
} from "@/lib/algorithms/admin";
import { adminDashboardHref } from "@/lib/admin-href";
import { ADMIN_PAGE_SIZE, type AdminCompanyListItem } from "@/types/admin";
import { AdminSearchBar } from "./AdminSearchBar";
import { Pagination } from "./Pagination";

type CompaniesPanelProps = {
  items: AdminCompanyListItem[];
  listParams: Record<string, string | undefined>;
};

const SORT_OPTIONS = [
  { value: "companyName", label: "Name A–Z" },
  { value: "-companyName", label: "Name Z–A" },
  { value: "-businessCount", label: "Most businesses" },
  { value: "businessCount", label: "Fewest businesses" },
];

export function CompaniesPanel({ items, listParams }: CompaniesPanelProps) {
  const [query, setQuery] = useState("");
  const [draftSort, setDraftSort] = useState("companyName");
  const [appliedSort, setAppliedSort] = useState("companyName");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, appliedSort, items]);

  const result = useMemo(() => {
    const { field, direction } = parseAdminSort(appliedSort);
    const matched = searchAdminCompanyList(items, query);
    const sorted = sortAdminCompanyList(
      matched,
      field || "companyName",
      direction,
    );
    return paginate(sorted, page, ADMIN_PAGE_SIZE);
  }, [items, query, appliedSort, page]);

  return (
    <div>
      <AdminSearchBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search companies..."
        sortOptions={SORT_OPTIONS}
        sortValue={draftSort}
        onSortValueChange={setDraftSort}
        onSort={() => setAppliedSort(draftSort)}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/8 bg-search/50 text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Company</th>
              <th className="px-4 py-2.5 font-semibold">Owner</th>
              <th className="px-4 py-2.5 font-semibold">Phone</th>
              <th className="px-4 py-2.5 font-semibold">Businesses</th>
              <th className="px-4 py-2.5 font-semibold">Verified</th>
              <th className="px-4 py-2.5 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted"
                >
                  No companies found.
                </td>
              </tr>
            ) : (
              result.items.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">
                    {company.companyName}
                  </td>
                  <td className="px-4 py-2.5 text-[#444]">
                    <span className="block">{company.ownerName}</span>
                    <span className="block text-xs text-muted">
                      {company.ownerEmail}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#444]">
                    {company.phoneNumber}
                  </td>
                  <td className="px-4 py-2.5 text-ink">
                    {company.businessCount}
                  </td>
                  <td className="px-4 py-2.5 text-[#444]">
                    {company.verificationStatus ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={adminDashboardHref({
                        ...listParams,
                        companyId: company.id,
                      })}
                      className="text-xs font-medium text-brand-deep hover:underline"
                    >
                      View
                    </Link>
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
  );
}
