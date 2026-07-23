/**
 * Admin service
 * -------------
 * Platform-wide reads/writes for users, companies (merchants), and posts (promotions).
 * List helpers are paginated for large datasets. Callers enforce ADMIN in the page/action layer.
 */
import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_SIZE } from "@/types/admin";
import type { UpdateUserRoleInput } from "@/validators/admin";
import type { UserRole } from "../../generated/prisma/client";

function normalizePage(page?: number) {
  if (!page || !Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function parseSort(sort?: string): { field: string; dir: "asc" | "desc" } {
  const raw = (sort ?? "").trim();
  if (!raw) return { field: "", dir: "asc" };
  if (raw.startsWith("-")) return { field: raw.slice(1), dir: "desc" };
  return { field: raw, dir: "asc" };
}

export async function getAdminCounts() {
  const [users, companies, posts, admins, pendingRequests] = await Promise.all([
    prisma.user.count(),
    prisma.merchant.count({ where: { verificationStatus: true } }),
    prisma.promotion.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.merchant.count({ where: { verificationStatus: false } }),
  ]);
  return { users, companies, posts, admins, pendingRequests };
}

/** List users; search matches id (exact) or email (contains) only. */
export async function listUsersPage(opts?: {
  search?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
}) {
  const page = normalizePage(opts?.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const q = opts?.search?.trim();
  const { field, dir } = parseSort(opts?.sort ?? "email");

  const where = q
    ? {
        OR: [{ id: q }, { email: { contains: q, mode: "insensitive" as const } }],
      }
    : undefined;

  const orderBy =
    field === "role"
      ? { role: dir }
      : field === "displayName"
        ? { displayName: dir }
        : { email: dir };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        merchant: { select: { id: true, companyName: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, pageSize };
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

/** Companies = Merchant profiles (lean list rows). */
export async function listCompaniesPage(opts?: {
  search?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
}) {
  const page = normalizePage(opts?.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const q = opts?.search?.trim();
  const { field, dir } = parseSort(opts?.sort ?? "companyName");

  const where = {
    verificationStatus: true,
    ...(q
      ? {
          OR: [
            { companyName: { contains: q, mode: "insensitive" as const } },
            { taxId: { contains: q, mode: "insensitive" as const } },
            { phoneNumber: { contains: q, mode: "insensitive" as const } },
            { id: q },
            {
              user: {
                OR: [
                  { email: { contains: q, mode: "insensitive" as const } },
                  {
                    displayName: { contains: q, mode: "insensitive" as const },
                  },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const orderBy =
    field === "businessCount"
      ? { businesses: { _count: dir } }
      : { companyName: dir };

  const [items, total] = await Promise.all([
    prisma.merchant.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, displayName: true },
        },
        _count: { select: { businesses: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.merchant.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getCompanyById(merchantId: string) {
  const company = await prisma.merchant.findUnique({
    where: { id: merchantId },
    include: {
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
      },
    },
  });

  if (!company) {
    throw new Error("Company not found.");
  }

  return company;
}

/** Full business detail for admin (branches + menu). */
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
        select: {
          id: true,
          itemName: true,
          description: true,
          price: true,
          category: true,
          isAvailable: true,
        },
      },
      _count: { select: { promotion: true } },
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

/** Posts = Promotion records (lean list rows). */
export async function listPostsPage(opts?: {
  search?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
}) {
  const page = normalizePage(opts?.page);
  const pageSize = opts?.pageSize ?? ADMIN_PAGE_SIZE;
  const q = opts?.search?.trim();
  const { field, dir } = parseSort(opts?.sort ?? "-createdAt");

  const where = q
    ? {
        OR: [
          { id: q },
          { caption: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          {
            business: {
              OR: [
                { businessName: { contains: q, mode: "insensitive" as const } },
                {
                  merchant: {
                    companyName: { contains: q, mode: "insensitive" as const },
                  },
                },
              ],
            },
          },
        ],
      }
    : undefined;

  const orderBy =
    field === "caption"
      ? { caption: dir }
      : field === "startDate"
        ? { startDate: dir }
        : field === "endDate"
          ? { endDate: dir }
          : { createdAt: dir };

  const [items, total] = await Promise.all([
    prisma.promotion.findMany({
      where,
      select: {
        id: true,
        caption: true,
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
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.promotion.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getPostById(postId: string) {
  const post = await prisma.promotion.findUnique({
    where: { id: postId },
    include: {
      business: {
        select: {
          id: true,
          businessName: true,
          merchant: {
            select: { id: true, companyName: true },
          },
        },
      },
      branch: true,
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
  const q = opts?.search?.trim();
  const { field, dir } = parseSort(opts?.sort ?? "companyName");

  const where = {
    verificationStatus: false,
    ...(q
      ? {
          OR: [
            { companyName: { contains: q, mode: "insensitive" as const } },
            { taxId: { contains: q, mode: "insensitive" as const } },
            { phoneNumber: { contains: q, mode: "insensitive" as const } },
            { id: q },
            {
              user: {
                OR: [
                  { email: { contains: q, mode: "insensitive" as const } },
                  {
                    displayName: { contains: q, mode: "insensitive" as const },
                  },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const orderBy =
    field === "email"
      ? { user: { email: dir } }
      : { companyName: dir };

  const [items, total] = await Promise.all([
    prisma.merchant.findMany({
      where,
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
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.merchant.count({ where }),
  ]);

  return { items, total, page, pageSize };
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
