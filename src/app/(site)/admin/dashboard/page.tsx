/**
 * /admin/dashboard
 * ----------------
 * ADMIN-only platform dashboard: requests, users, companies, posts.
 * Counts + active tab load in parallel; detail drawers parallelized with lists.
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
  listCompaniesPage,
  listMerchantRequestsPage,
  listPostsPage,
  listUsersPage,
} from "@/services/admin.service";
import type {
  AdminBusinessDetail,
  AdminCompanyDetail,
  AdminPostDetail,
  AdminTab,
  AdminUserDetail,
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

function parsePage(raw: string | undefined) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
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
  query: string;
  sort: string;
  page: number;
  userId?: string;
  companyId?: string;
  businessId?: string;
  postId?: string;
}) {
  const { tab, query, sort, page, userId, companyId, businessId, postId } =
    opts;

  let users;
  let companies;
  let posts;
  let requests;
  let selectedUser: AdminUserDetail | null = null;
  let selectedCompany: AdminCompanyDetail | null = null;
  let selectedBusiness: AdminBusinessDetail | null = null;
  let selectedPost: AdminPostDetail | null = null;

  if (tab === "requests") {
    const result = await listMerchantRequestsPage({
      search: query || undefined,
      page,
      sort: sort || "-id",
    });
    requests = {
      ...result,
      items: result.items.map(mapAdminMerchantRequest),
    };
  } else if (tab === "users") {
    const [result, userRow] = await Promise.all([
      listUsersPage({
        search: query || undefined,
        page,
        sort: sort || "email",
      }),
      userId ? safeMap(getUserById(userId)) : Promise.resolve(null),
    ]);
    users = {
      ...result,
      items: result.items.map(mapAdminUserListItem),
    };
    selectedUser = userRow ? mapAdminUserDetail(userRow) : null;
  } else if (tab === "companies") {
    const [result, companyRow, businessRow] = await Promise.all([
      listCompaniesPage({
        search: query || undefined,
        page,
        sort: sort || "companyName",
      }),
      companyId ? safeMap(getCompanyById(companyId)) : Promise.resolve(null),
      businessId ? safeMap(getBusinessById(businessId)) : Promise.resolve(null),
    ]);

    companies = {
      ...result,
      items: result.items.map(mapAdminCompanyListItem),
    };

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
    const [result, postRow] = await Promise.all([
      listPostsPage({
        search: query || undefined,
        page,
        sort: sort || "-createdAt",
      }),
      postId ? safeMap(getPostById(postId)) : Promise.resolve(null),
    ]);
    posts = {
      ...result,
      items: result.items.map(mapAdminPostListItem),
    };
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
  const query = (first(params.q) ?? "").trim();
  const sort = (first(params.sort) ?? "").trim();
  const page = parsePage(first(params.page));
  const userId = first(params.userId);
  const companyId = first(params.companyId);
  const businessId = first(params.businessId);
  const postId = first(params.postId);

  const [counts, tabPayload] = await Promise.all([
    getCachedAdminCounts(),
    loadTabPayload({
      tab,
      query,
      sort,
      page,
      userId,
      companyId,
      businessId,
      postId,
    }),
  ]);

  return (
    <AdminDashboard
      tab={tab}
      query={query}
      sort={sort}
      page={page}
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
