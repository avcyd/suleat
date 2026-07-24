import { AdminDashboardChrome } from "@/components/admin/AdminDashboardChrome";
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
import { adminDashboardHref } from "@/lib/admin-href";

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

  const panel = (
    <>
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
    </>
  );

  const drawers = (
    <>
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
    </>
  );

  return (
    <AdminDashboardChrome
      tab={tab}
      counts={counts}
      panel={panel}
      drawers={drawers}
    />
  );
}
