/**
 * Business service
 * ----------------
 * Prisma + ownership rules for Business (and nested Branch on create).
 * Only merchants with a Merchant row can create/update businesses.
 */
import { prisma } from "@/lib/prisma";
import type {
  BranchInput,
  CreateBusinessInput,
  UpdateBusinessInput,
} from "@/validators/business";

async function requireMerchantForUser(userId: string) {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });
  if (!merchant) {
    throw new Error("You need a merchant account to manage businesses.");
  }
  return merchant;
}

/** Create a business owned by this user's merchant account. */
export async function createBusiness(
  userId: string,
  input: CreateBusinessInput,
) {
  const merchant = await requireMerchantForUser(userId);

  return prisma.business.create({
    data: {
      merchantId: merchant.id,
      businessName: input.businessName,
      description: input.description,
      dateEstablishment: new Date(input.dateEstablishment),
      coverPhoto: input.coverPhoto,
      branch: {
        create: input.branches.map((branch) => ({
          number: branch.number,
          building: branch.building?.trim() ? branch.building : undefined,
          street: branch.street,
          barangay: branch.barangay,
          city: branch.city,
          province: branch.province,
        })),
      },
    },
    include: { branch: true },
  });
}

/** List businesses for this user's merchant account. */
export async function getBusinessesByUserId(userId: string) {
  const merchant = await requireMerchantForUser(userId);

  return prisma.business.findMany({
    where: { merchantId: merchant.id },
    include: { branch: true },
    orderBy: { businessName: "asc" },
  });
}

/** Load one business if it belongs to this user's merchant account. */
export async function getBusinessByIdForUser(
  userId: string,
  businessId: string,
) {
  const merchant = await requireMerchantForUser(userId);

  const business = await prisma.business.findFirst({
    where: { id: businessId, merchantId: merchant.id },
    include: { branch: true },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  return business;
}

/** Update core fields; only if the business belongs to this merchant. */
export async function updateBusinessForUser(
  userId: string,
  businessId: string,
  input: UpdateBusinessInput,
) {
  const merchant = await requireMerchantForUser(userId);

  const existing = await prisma.business.findFirst({
    where: { id: businessId, merchantId: merchant.id },
  });
  if (!existing) {
    throw new Error("Business not found.");
  }

  return prisma.business.update({
    where: { id: businessId },
    data: {
      businessName: input.businessName,
      description: input.description,
      dateEstablishment: new Date(input.dateEstablishment),
      coverPhoto: input.coverPhoto,
    },
    include: { branch: true },
  });
}

/** Delete a business (and its menu + branches) owned by this merchant. */
export async function deleteBusinessForUser(
  userId: string,
  businessId: string,
) {
  const merchant = await requireMerchantForUser(userId);

  const existing = await prisma.business.findFirst({
    where: { id: businessId, merchantId: merchant.id },
  });
  if (!existing) {
    throw new Error("Business not found.");
  }

  await prisma.menu.deleteMany({ where: { businessId } });
  await prisma.promotion.deleteMany({ where: { businessId } });
  await prisma.branch.deleteMany({ where: { businessId } });
  await prisma.business.delete({ where: { id: businessId } });
}

/** Add a branch to an existing business owned by this merchant. */
export async function addBranchForUser(
  userId: string,
  businessId: string,
  input: BranchInput,
) {
  const merchant = await requireMerchantForUser(userId);

  const existing = await prisma.business.findFirst({
    where: { id: businessId, merchantId: merchant.id },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Business not found.");
  }

  return prisma.branch.create({
    data: {
      businessId,
      number: input.number,
      building: input.building?.trim() ? input.building : undefined,
      street: input.street,
      barangay: input.barangay,
      city: input.city,
      province: input.province,
    },
  });
}
