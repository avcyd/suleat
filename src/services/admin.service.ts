/**
 * Admin service
 * -------------
 * Platform-wide reads/writes for users, companies (merchants), and posts (promotions).
 *
 * List helpers load a working set from the DB, then apply course algorithms
 * (Linear Search + Merge Sort) before in-memory pagination — see src/lib/algorithms.
 */
import { prisma } from "@/lib/prisma";
import {
  paginate,
  parseAdminSort,
  searchAdminCompanies,
  searchAdminPosts,
  searchAdminRequests,
  searchAdminUsers,
  sortAdminCompanies,
  sortAdminPosts,
  sortAdminRequests,
  sortAdminUsers,
} from "@/lib/algorithms/admin";
import { ADMIN_PAGE_SIZE } from "@/types/admin";
import type { UpdateUserRoleInput } from "@/validators/admin";
import type { UserRole } from "../../generated/prisma/client";

/** Safety cap so algorithm demos stay bounded on huge databases. */
const ADMIN_ALGO_FETCH_CAP = 2000;

function normalizePage(page?: number) {
  if (!page || !Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export async function getAdminCounts() {
  // Only counts shown in the dashboard chrome (skip unused admin-role count).
  const [users, companies, posts, pendingRequests] = await Promise.all([
    prisma.user.count(),
    prisma.merchant.count({ where: { verificationStatus: true } }),
    prisma.promotion.count(),
    prisma.merchant.count({ where: { verificationStatus: false } }),
  ]);
  return { users, companies, posts, admins: 0, pendingRequests };
}

/** List users — Linear Search (id/email) + Merge Sort, then paginate. */
export async function listUsersPage(opts?: {
  search?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
}) {
  const page = normalizePage(opts?.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const { field, direction } = parseAdminSort(opts?.sort ?? "email");

  const rows = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      merchant: { select: { id: true, companyName: true } },
    },
    take: ADMIN_ALGO_FETCH_CAP,
  });

  const matched = searchAdminUsers(rows, opts?.search ?? "");
  const sorted = sortAdminUsers(matched, field || "email", direction);
  return paginate(sorted, page, pageSize);
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      merchant: {
        select: {
          id: true,
          companyName: true,
          phoneNumber: true,
          taxId: true,
          verificationStatus: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

/** Access control — change a user's role. */
export async function updateUserRole(
  actorUserId: string,
  input: UpdateUserRoleInput,
) {
  if (input.userId === actorUserId && input.role !== "ADMIN") {
    throw new Error("You cannot remove your own admin access.");
  }

  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true },
  });
  if (!target) {
    throw new Error("User not found.");
  }

  if (target.role === "ADMIN" && input.role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("Cannot demote the last admin account.");
    }
  }

  return prisma.user.update({
    where: { id: input.userId },
    data: { role: input.role as UserRole },
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
    },
  });
}

/** Companies = verified merchants — Linear Search + Merge Sort, then paginate. */
export async function listCompaniesPage(opts?: {
  search?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
}) {
  const page = normalizePage(opts?.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const { field, direction } = parseAdminSort(opts?.sort ?? "companyName");

  const rows = await prisma.merchant.findMany({
    where: { verificationStatus: true },
    include: {
      user: {
        select: { id: true, email: true, displayName: true },
      },
      _count: { select: { businesses: true } },
    },
    take: ADMIN_ALGO_FETCH_CAP,
  });

  const matched = searchAdminCompanies(rows, opts?.search ?? "");
  const sorted = sortAdminCompanies(
    matched,
    field || "companyName",
    direction,
  );
  return paginate(sorted, page, pageSize);
}

export async function getCompanyById(merchantId: string) {
  const company = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      companyName: true,
      phoneNumber: true,
      taxId: true,
      verificationStatus: true,
      user: {
        select: { id: true, email: true, displayName: true, role: true },
      },
      businesses: {
        select: {
          id: true,
          businessName: true,
          description: true,
          coverPhoto: true,
          dateEstablishment: true,
          _count: { select: { branch: true, menu: true, promotion: true } },
        },
        orderBy: { businessName: "asc" },
        take: 50,
      },
      _count: { select: { businesses: true } },
    },
  });

  if (!company) {
    throw new Error("Company not found.");
  }

  return company;
}

/** Full business detail for admin (bounded branches + menu for drawer speed). */
export async function getBusinessById(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      merchantId: true,
      businessName: true,
      description: true,
      coverPhoto: true,
      dateEstablishment: true,
      merchant: { select: { companyName: true } },
      branch: {
        orderBy: { street: "asc" },
        take: 40,
        select: {
          id: true,
          number: true,
          building: true,
          street: true,
          barangay: true,
          city: true,
          province: true,
        },
      },
      menu: {
        orderBy: [{ category: "asc" }, { itemName: "asc" }],
        take: 60,
        select: {
          id: true,
          itemName: true,
          description: true,
          price: true,
          category: true,
          isAvailable: true,
        },
      },
      _count: { select: { promotion: true, branch: true, menu: true } },
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  return business;
}

/** Delete a single business and its nested menu/branches/promotions. */
export async function deleteBusiness(businessId: string) {
  const existing = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Business not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.promotion.deleteMany({ where: { businessId } });
    await tx.menu.deleteMany({ where: { businessId } });
    await tx.branch.deleteMany({ where: { businessId } });
    await tx.business.delete({ where: { id: businessId } });
  });
}

/** Posts = promotions — Linear Search + Merge Sort, then paginate. */
export async function listPostsPage(opts?: {
  search?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
}) {
  const page = normalizePage(opts?.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const { field, direction } = parseAdminSort(opts?.sort ?? "-createdAt");

  const rows = await prisma.promotion.findMany({
    select: {
      id: true,
      caption: true,
      description: true,
      promotionType: true,
      discountPercent: true,
      bundleType: true,
      buyQuantity: true,
      getQuantity: true,
      bundleDiscountPercent: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      business: {
        select: {
          businessName: true,
          merchant: { select: { companyName: true } },
        },
      },
    },
    take: ADMIN_ALGO_FETCH_CAP,
  });

  const matched = searchAdminPosts(rows, opts?.search ?? "");
  const sorted = sortAdminPosts(matched, field || "createdAt", direction);
  return paginate(sorted, page, pageSize);
}

export async function getPostById(postId: string) {
  const post = await prisma.promotion.findUnique({
    where: { id: postId },
    select: {
      id: true,
      caption: true,
      description: true,
      promotionType: true,
      discountPercent: true,
      bundleType: true,
      buyQuantity: true,
      getQuantity: true,
      bundleDiscountPercent: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      business: {
        select: {
          id: true,
          businessName: true,
          merchant: {
            select: { id: true, companyName: true },
          },
        },
      },
      branch: {
        select: {
          id: true,
          number: true,
          building: true,
          street: true,
          barangay: true,
          city: true,
          province: true,
        },
      },
    },
  });

  if (!post) {
    throw new Error("Post not found.");
  }

  return post;
}

export async function deletePost(postId: string) {
  const existing = await prisma.promotion.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Post not found.");
  }

  await prisma.promotion.delete({ where: { id: postId } });
}

/** Delete an approved company (merchant) and all nested businesses/posts. */
export async function deleteCompany(merchantId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      userId: true,
      businesses: { select: { id: true } },
      user: { select: { role: true } },
    },
  });

  if (!merchant) {
    throw new Error("Company not found.");
  }

  const businessIds = merchant.businesses.map((business) => business.id);

  await prisma.$transaction(async (tx) => {
    if (businessIds.length > 0) {
      await tx.promotion.deleteMany({
        where: { businessId: { in: businessIds } },
      });
      await tx.menu.deleteMany({
        where: { businessId: { in: businessIds } },
      });
      await tx.branch.deleteMany({
        where: { businessId: { in: businessIds } },
      });
      await tx.business.deleteMany({
        where: { id: { in: businessIds } },
      });
    }

    await tx.merchant.delete({ where: { id: merchant.id } });

    if (merchant.user.role === "MERCHANT") {
      await tx.user.update({
        where: { id: merchant.userId },
        data: { role: "USER" },
      });
    }
  });
}

/** Pending merchant applications (verificationStatus = false). */
export async function listMerchantRequestsPage(opts?: {
  search?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
}) {
  const page = normalizePage(opts?.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const { field, direction } = parseAdminSort(opts?.sort ?? "-id");

  const rows = await prisma.merchant.findMany({
    where: { verificationStatus: false },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
        },
      },
    },
    take: ADMIN_ALGO_FETCH_CAP,
  });

  // Linear Search (email / company) → Merge Sort (incl. newest/oldest via id).
  const matched = searchAdminRequests(rows, opts?.search ?? "");
  const sorted = sortAdminRequests(matched, field || "id", direction);
  return paginate(sorted, page, pageSize);
}

/** Approve application: verify merchant + grant MERCHANT role. */
export async function approveMerchantRequest(merchantId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      userId: true,
      verificationStatus: true,
    },
  });

  if (!merchant) {
    throw new Error("Merchant application not found.");
  }
  if (merchant.verificationStatus) {
    throw new Error("This application is already approved.");
  }

  await prisma.$transaction([
    prisma.merchant.update({
      where: { id: merchant.id },
      data: { verificationStatus: true },
    }),
    prisma.user.update({
      where: { id: merchant.userId },
      data: { role: "MERCHANT" },
    }),
  ]);
}

/** Reject application: notify the user, then remove the pending profile. */
export async function rejectMerchantRequest(merchantId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      userId: true,
      companyName: true,
      verificationStatus: true,
      _count: { select: { businesses: true } },
    },
  });

  if (!merchant) {
    throw new Error("Merchant application not found.");
  }
  if (merchant.verificationStatus) {
    throw new Error("Cannot reject an already approved merchant.");
  }
  if (merchant._count.businesses > 0) {
    throw new Error("Cannot reject a merchant that already has businesses.");
  }

  await prisma.$transaction([
    prisma.notification.create({
      data: {
        userId: merchant.userId,
        type: "MERCHANT_REJECTED",
        title: "Merchant application rejected",
        message: `Your application for “${merchant.companyName}” was not approved. You can update your details and submit a new application when you’re ready.`,
      },
    }),
    prisma.merchant.delete({ where: { id: merchant.id } }),
  ]);
}
