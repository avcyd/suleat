/**
 * /admin/dashboard
 * ----------------
 * ADMIN-only platform dashboard: requests, users, companies, posts.
 * Lists are server-paginated via URL search params.
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
import { getSession } from "@/lib/session";
import {
  getAdminCounts,
  getBusinessById,
  getCompanyById,
  getPostById,
  getUserById,
  listCompaniesPage,
  listMerchantRequestsPage,
  listPostsPage,
  listUsersPage,
} from "@/services/admin.service";
import type { AdminTab } from "@/types/admin";

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

  const counts = await getAdminCounts();

  let users;
  let companies;
  let posts;
  let requests;
  let selectedUser = null;
  let selectedCompany = null;
  let selectedBusiness = null;
  let selectedPost = null;

  if (tab === "requests") {
    const result = await listMerchantRequestsPage({
      search: query || undefined,
      page,
      sort: sort || "companyName",
    });
    requests = {
      ...result,
      items: result.items.map(mapAdminMerchantRequest),
    };
  } else if (tab === "users") {
    const result = await listUsersPage({
      search: query || undefined,
      page,
      sort: sort || "email",
    });
    users = {
      ...result,
      items: result.items.map(mapAdminUserListItem),
    };
    if (userId) {
      try {
        selectedUser = mapAdminUserDetail(await getUserById(userId));
      } catch {
        selectedUser = null;
      }
    }
  } else if (tab === "companies") {
    const result = await listCompaniesPage({
      search: query || undefined,
      page,
      sort: sort || "companyName",
    });
    companies = {
      ...result,
      items: result.items.map(mapAdminCompanyListItem),
    };
    if (companyId) {
      try {
        selectedCompany = mapAdminCompanyDetail(await getCompanyById(companyId));
      } catch {
        selectedCompany = null;
      }
    }
    if (businessId) {
      try {
        selectedBusiness = mapAdminBusinessDetail(
          await getBusinessById(businessId),
        );
        if (!selectedCompany) {
          try {
            selectedCompany = mapAdminCompanyDetail(
              await getCompanyById(selectedBusiness.merchantId),
            );
          } catch {
            selectedCompany = null;
          }
        } else if (selectedBusiness.merchantId !== selectedCompany.id) {
          selectedBusiness = null;
        }
      } catch {
        selectedBusiness = null;
      }
    }
  } else {
    const result = await listPostsPage({
      search: query || undefined,
      page,
      sort: sort || "-createdAt",
    });
    posts = {
      ...result,
      items: result.items.map(mapAdminPostListItem),
    };
    if (postId) {
      try {
        selectedPost = mapAdminPostDetail(await getPostById(postId));
      } catch {
        selectedPost = null;
      }
    }
  }

  return (
    <AdminDashboard
      tab={tab}
      query={query}
      sort={sort}
      page={page}
      counts={counts}
      users={users}
      companies={companies}
      posts={posts}
      requests={requests}
      selectedUser={selectedUser}
      selectedCompany={selectedCompany}
      selectedBusiness={selectedBusiness}
      selectedPost={selectedPost}
    />
  );
}
