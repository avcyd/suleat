import Link from "next/link";
import { adminDashboardHref } from "@/lib/admin-href";
import type {
  AdminBusinessDetail,
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminCounts,
  AdminMerchantRequest,
  AdminPageResult,
  AdminPostDetail,
  AdminPostListItem,
  AdminTab,
  AdminUserDetail,
  AdminUserListItem,
} from "@/types/admin";
import { BusinessDetailDrawer } from "./BusinessDetailDrawer";
import { CompaniesPanel } from "./CompaniesPanel";
import { CompanyDetailDrawer } from "./CompanyDetailDrawer";
import { PostDetailDrawer } from "./PostDetailDrawer";
import { PostsPanel } from "./PostsPanel";
import { RequestsPanel } from "./RequestsPanel";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { UsersPanel } from "./UsersPanel";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "requests", label: "Requests" },
  { id: "users", label: "Users" },
  { id: "companies", label: "Companies" },
  { id: "posts", label: "Posts" },
];

type AdminDashboardProps = {
  tab: AdminTab;
  query: string;
  sort: string;
  page: number;
  counts: AdminCounts;
  users?: AdminPageResult<AdminUserListItem>;
  companies?: AdminPageResult<AdminCompanyListItem>;
  posts?: AdminPageResult<AdminPostListItem>;
  requests?: AdminPageResult<AdminMerchantRequest>;
  selectedUser: AdminUserDetail | null;
  selectedCompany: AdminCompanyDetail | null;
  selectedBusiness: AdminBusinessDetail | null;
  selectedPost: AdminPostDetail | null;
};

/**
 * Administrator Dashboard — paginated tables + detail drawers.
 */
export function AdminDashboard({
  tab,
  query,
  sort,
  page,
  counts,
  users,
  companies,
  posts,
  requests,
  selectedUser,
  selectedCompany,
  selectedBusiness,
  selectedPost,
}: AdminDashboardProps) {
  const listParams = {
    tab,
    q: query || undefined,
    sort: sort || undefined,
    page: String(page),
  };

  const closeHref = adminDashboardHref(listParams);
  const companyCloseHref = adminDashboardHref({
    ...listParams,
    companyId: selectedCompany?.id,
  });

  const searchBaseParams = {
    tab,
    sort: sort || undefined,
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-3 border-b border-black/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-deep">
            Administrator
          </p>
          <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            Platform Dashboard
          </h1>
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Requests</dt>
            <dd className="font-semibold text-ink">{counts.pendingRequests}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Users</dt>
            <dd className="font-semibold text-ink">{counts.users}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Companies</dt>
            <dd className="font-semibold text-ink">{counts.companies}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Posts</dt>
            <dd className="font-semibold text-ink">{counts.posts}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav
          aria-label="Admin sections"
          className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {tabs.map((item) => {
            const active = tab === item.id;
            const label =
              item.id === "requests" && counts.pendingRequests > 0
                ? `Requests (${counts.pendingRequests})`
                : item.label;
            return (
              <Link
                key={item.id}
                href={adminDashboardHref({ tab: item.id, page: "1" })}
                className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-white"
                    : "text-[#444] hover:bg-black/[0.04]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0 rounded-xl border border-black/8 bg-white">
          {tab === "requests" && requests ? (
            <RequestsPanel
              result={requests}
              query={query}
              sort={sort || "companyName"}
              listParams={listParams}
              baseParams={searchBaseParams}
            />
          ) : null}

          {tab === "users" && users ? (
            <UsersPanel
              result={users}
              query={query}
              sort={sort || "email"}
              listParams={listParams}
              baseParams={searchBaseParams}
            />
          ) : null}

          {tab === "companies" && companies ? (
            <CompaniesPanel
              result={companies}
              query={query}
              sort={sort || "companyName"}
              listParams={listParams}
              baseParams={searchBaseParams}
            />
          ) : null}

          {tab === "posts" && posts ? (
            <PostsPanel
              result={posts}
              query={query}
              sort={sort || "-createdAt"}
              listParams={listParams}
              baseParams={searchBaseParams}
            />
          ) : null}
        </div>
      </div>

      <UserDetailDrawer user={selectedUser} closeHref={closeHref} />
      <CompanyDetailDrawer
        company={selectedCompany}
        closeHref={closeHref}
        listParams={listParams}
      />
      <BusinessDetailDrawer
        business={selectedBusiness}
        closeHref={companyCloseHref}
      />
      <PostDetailDrawer post={selectedPost} closeHref={closeHref} />
    </main>
  );
}
