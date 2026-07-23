import Link from "next/link";
import { adminDashboardHref } from "@/lib/admin-href";
import type { AdminPageResult, AdminUserListItem } from "@/types/admin";
import { AdminSearchBar } from "./AdminSearchBar";
import { Pagination } from "./Pagination";

type UsersPanelProps = {
  result: AdminPageResult<AdminUserListItem>;
  query: string;
  sort: string;
  listParams: Record<string, string | undefined>;
  baseParams: Record<string, string | undefined>;
};

export function UsersPanel({
  result,
  query,
  sort,
  listParams,
  baseParams,
}: UsersPanelProps) {
  return (
    <div>
      <AdminSearchBar
        defaultQuery={query}
        placeholder="Search by ID or email..."
        baseParams={baseParams}
        currentSort={sort}
        sortOptions={[
          { value: "email", label: "Email A–Z" },
          { value: "-email", label: "Email Z–A" },
          { value: "displayName", label: "Name A–Z" },
          { value: "-displayName", label: "Name Z–A" },
          { value: "role", label: "Role A–Z" },
          { value: "-role", label: "Role Z–A" },
        ]}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/8 bg-search/50 text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Name</th>
              <th className="px-4 py-2.5 font-semibold">Email</th>
              <th className="px-4 py-2.5 font-semibold">Role</th>
              <th className="px-4 py-2.5 font-semibold">Company</th>
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
                  No users found.
                </td>
              </tr>
            ) : (
              result.items.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">
                    {user.displayName}
                  </td>
                  <td className="px-4 py-2.5 text-[#444]">{user.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded bg-search px-1.5 py-0.5 text-xs font-medium text-ink">
                      {user.role}
                    </span>
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-2.5 text-[#444]">
                    {user.companyName ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={adminDashboardHref({
                        ...listParams,
                        userId: user.id,
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
        listParams={listParams}
      />
    </div>
  );
}
