import { AdminDashboardChrome } from "@/components/admin/AdminDashboardChrome";
import type {
  AdminBusinessDetail,
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminCounts,
  AdminMerchantRequest,
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
  counts: AdminCounts;
  users?: AdminUserListItem[];
  companies?: AdminCompanyListItem[];
  posts?: AdminPostListItem[];
  requests?: AdminMerchantRequest[];
  selectedUser: AdminUserDetail | null;
  selectedCompany: AdminCompanyDetail | null;
  selectedBusiness: AdminBusinessDetail | null;
  selectedPost: AdminPostDetail | null;
};

/**
 * Administrator Dashboard — working set from server; search/sort/page in browser.
 */
export function AdminDashboard({
  tab,
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
  const listParams = { tab };

  const closeHref = adminDashboardHref(listParams);
  const companyCloseHref = adminDashboardHref({
    ...listParams,
    companyId: selectedCompany?.id,
  });

  const panel = (
    <>
      {tab === "requests" && requests ? (
        <RequestsPanel items={requests} />
      ) : null}

      {tab === "users" && users ? (
        <UsersPanel items={users} listParams={listParams} />
      ) : null}

      {tab === "companies" && companies ? (
        <CompaniesPanel items={companies} listParams={listParams} />
      ) : null}

      {tab === "posts" && posts ? (
        <PostsPanel items={posts} listParams={listParams} />
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
