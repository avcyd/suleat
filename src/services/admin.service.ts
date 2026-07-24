/**
 * Admin service
 * -------------
 * Platform-wide reads/writes for users, companies (merchants), and posts (promotions).
 *
 * List helpers return a capped working set from the DB. Search / sort / pagination
 * run in the browser (Linear Search + Merge Sort) for instant dashboard UX.
 */
import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_SIZE } from "@/types/admin";
import type { UpdateUserRoleInput } from "@/validators/admin";
import type { UserRole } from "../../generated/prisma/client";

/** Safety cap so algorithm demos stay bounded on huge databases. */
const ADMIN_ALGO_FETCH_CAP = 2000;

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

/** Full user working set for client-side Linear Search + Merge Sort. */
export async function listUsersWorkingSet() {
  return prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      merchant: { select: { id: true, companyName: true } },
    },
    take: ADMIN_ALGO_FETCH_CAP,
  });
}

/** @deprecated Prefer listUsersWorkingSet + client algorithms. */
export async function listUsersPage(opts?: {
  search?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
}) {
  const page = !opts?.page || opts.page < 1 ? 1 : Math.floor(opts.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const rows = await listUsersWorkingSet();
  const start = (page - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
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

/** Verified companies working set for client-side search/sort. */
export async function listCompaniesWorkingSet() {
  return prisma.merchant.findMany({
    where: { verificationStatus: true },
    include: {
      user: {
        select: { id: true, email: true, displayName: true },
      },
      _count: { select: { businesses: true } },
    },
    take: ADMIN_ALGO_FETCH_CAP,
  });
}

/** @deprecated Prefer listCompaniesWorkingSet + client algorithms. */
export async function listCompaniesPage(opts?: {
  page?: number;
  pageSize?: number;
}) {
  const page = !opts?.page || opts.page < 1 ? 1 : Math.floor(opts.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const rows = await listCompaniesWorkingSet();
  const start = (page - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
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

/** Posts working set for client-side search/sort. */
export async function listPostsWorkingSet() {
  return prisma.promotion.findMany({
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
}

/** @deprecated Prefer listPostsWorkingSet + client algorithms. */
export async function listPostsPage(opts?: {
  page?: number;
  pageSize?: number;
}) {
  const page = !opts?.page || opts.page < 1 ? 1 : Math.floor(opts.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const rows = await listPostsWorkingSet();
  const start = (page - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
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

/** Pending applications working set for client-side search/sort. */
export async function listMerchantRequestsWorkingSet() {
  return prisma.merchant.findMany({
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
}

/** @deprecated Prefer listMerchantRequestsWorkingSet + client algorithms. */
export async function listMerchantRequestsPage(opts?: {
  page?: number;
  pageSize?: number;
}) {
  const page = !opts?.page || opts.page < 1 ? 1 : Math.floor(opts.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const rows = await listMerchantRequestsWorkingSet();
  const start = (page - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
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
