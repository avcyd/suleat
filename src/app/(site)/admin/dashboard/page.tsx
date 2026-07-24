/**
 * /admin/dashboard
 * ----------------
 * ADMIN-only platform dashboard.
 * Server loads each tab's working set once; search/sort/paginate run in the browser.
 */
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin";
import {
  mapAdminBusinessDetail,
  mapAdminCompanyDetail,
  mapAdminCompanyListItem,
  mapAdminMerchantRequest,
  mapAdminPostDetail,
  mapAdminPostListItem,
  mapAdminUserDetail,
  mapAdminUserListItem,
} from "@/lib/admin-mappers";
import { getCachedAdminCounts } from "@/lib/admin-cache";
import { getSession } from "@/lib/session";
import {
  getBusinessById,
  getCompanyById,
  getPostById,
  getUserById,
  listCompaniesWorkingSet,
  listMerchantRequestsWorkingSet,
  listPostsWorkingSet,
  listUsersWorkingSet,
} from "@/services/admin.service";
import type {
  AdminBusinessDetail,
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminMerchantRequest,
  AdminPostDetail,
  AdminPostListItem,
  AdminTab,
  AdminUserDetail,
  AdminUserListItem,
} from "@/types/admin";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseTab(raw: string | undefined): AdminTab {
  if (
    raw === "companies" ||
    raw === "posts" ||
    raw === "users" ||
    raw === "requests"
  ) {
    return raw;
  }
  return "requests";
}

async function safeMap<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

async function loadTabPayload(opts: {
  tab: AdminTab;
  userId?: string;
  companyId?: string;
  businessId?: string;
  postId?: string;
}) {
  const { tab, userId, companyId, businessId, postId } = opts;

  let users: AdminUserListItem[] | undefined;
  let companies: AdminCompanyListItem[] | undefined;
  let posts: AdminPostListItem[] | undefined;
  let requests: AdminMerchantRequest[] | undefined;
  let selectedUser: AdminUserDetail | null = null;
  let selectedCompany: AdminCompanyDetail | null = null;
  let selectedBusiness: AdminBusinessDetail | null = null;
  let selectedPost: AdminPostDetail | null = null;

  if (tab === "requests") {
    const rows = await listMerchantRequestsWorkingSet();
    requests = rows.map(mapAdminMerchantRequest);
  } else if (tab === "users") {
    const [rows, userRow] = await Promise.all([
      listUsersWorkingSet(),
      userId ? safeMap(getUserById(userId)) : Promise.resolve(null),
    ]);
    users = rows.map(mapAdminUserListItem);
    selectedUser = userRow ? mapAdminUserDetail(userRow) : null;
  } else if (tab === "companies") {
    const [rows, companyRow, businessRow] = await Promise.all([
      listCompaniesWorkingSet(),
      companyId ? safeMap(getCompanyById(companyId)) : Promise.resolve(null),
      businessId ? safeMap(getBusinessById(businessId)) : Promise.resolve(null),
    ]);

    companies = rows.map(mapAdminCompanyListItem);
    selectedCompany = companyRow ? mapAdminCompanyDetail(companyRow) : null;
    selectedBusiness = businessRow
      ? mapAdminBusinessDetail(businessRow)
      : null;

    if (selectedBusiness) {
      if (
        selectedCompany &&
        selectedBusiness.merchantId !== selectedCompany.id
      ) {
        selectedBusiness = null;
      } else if (!selectedCompany) {
        const owner = await safeMap(
          getCompanyById(selectedBusiness.merchantId),
        );
        selectedCompany = owner ? mapAdminCompanyDetail(owner) : null;
      }
    }
  } else {
    const [rows, postRow] = await Promise.all([
      listPostsWorkingSet(),
      postId ? safeMap(getPostById(postId)) : Promise.resolve(null),
    ]);
    posts = rows.map(mapAdminPostListItem);
    selectedPost = postRow ? mapAdminPostDetail(postRow) : null;
  }

  return {
    users,
    companies,
    posts,
    requests,
    selectedUser,
    selectedCompany,
    selectedBusiness,
    selectedPost,
  };
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const tab = parseTab(first(params.tab));
  const userId = first(params.userId);
  const companyId = first(params.companyId);
  const businessId = first(params.businessId);
  const postId = first(params.postId);

  const [counts, tabPayload] = await Promise.all([
    getCachedAdminCounts(),
    loadTabPayload({
      tab,
      userId,
      companyId,
      businessId,
      postId,
    }),
  ]);

  return (
    <AdminDashboard
      tab={tab}
      counts={counts}
      users={tabPayload.users}
      companies={tabPayload.companies}
      posts={tabPayload.posts}
      requests={tabPayload.requests}
      selectedUser={tabPayload.selectedUser}
      selectedCompany={tabPayload.selectedCompany}
      selectedBusiness={tabPayload.selectedBusiness}
      selectedPost={tabPayload.selectedPost}
    />
  );
}
