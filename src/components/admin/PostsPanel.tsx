"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  paginate,
  parseAdminSort,
  searchAdminPostList,
  sortAdminPostList,
} from "@/lib/algorithms/admin";
import { adminDashboardHref } from "@/lib/admin-href";
import { ADMIN_PAGE_SIZE, type AdminPostListItem } from "@/types/admin";
import { AdminSearchBar } from "./AdminSearchBar";
import { Pagination } from "./Pagination";

type PostsPanelProps = {
  items: AdminPostListItem[];
  listParams: Record<string, string | undefined>;
};

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "createdAt", label: "Oldest" },
  { value: "caption", label: "Caption A–Z" },
  { value: "-caption", label: "Caption Z–A" },
  { value: "-startDate", label: "Start date" },
  { value: "-endDate", label: "End date" },
];

export function PostsPanel({ items, listParams }: PostsPanelProps) {
  const [query, setQuery] = useState("");
  const [draftSort, setDraftSort] = useState("-createdAt");
  const [appliedSort, setAppliedSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, appliedSort, items]);

  const result = useMemo(() => {
    const { field, direction } = parseAdminSort(appliedSort);
    const matched = searchAdminPostList(items, query);
    const sorted = sortAdminPostList(matched, field || "createdAt", direction);
    return paginate(sorted, page, ADMIN_PAGE_SIZE);
  }, [items, query, appliedSort, page]);

  return (
    <div>
      <AdminSearchBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search posts..."
        sortOptions={SORT_OPTIONS}
        sortValue={draftSort}
        onSortValueChange={setDraftSort}
        onSort={() => setAppliedSort(draftSort)}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-black/8 bg-search/50 text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Caption</th>
              <th className="px-4 py-2.5 font-semibold">Deal</th>
              <th className="px-4 py-2.5 font-semibold">Business</th>
              <th className="px-4 py-2.5 font-semibold">Company</th>
              <th className="px-4 py-2.5 font-semibold">Created</th>
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
                  No posts found.
                </td>
              </tr>
            ) : (
              result.items.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]"
                >
                  <td className="max-w-[200px] truncate px-4 py-2.5 font-medium text-ink">
                    {post.caption}
                  </td>
                  <td className="px-4 py-2.5 text-[#444]">{post.dealLabel}</td>
                  <td className="max-w-[140px] truncate px-4 py-2.5 text-[#444]">
                    {post.businessName}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-2.5 text-[#444]">
                    {post.companyName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[#444]">
                    {post.createdAt}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={adminDashboardHref({
                        ...listParams,
                        postId: post.id,
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
