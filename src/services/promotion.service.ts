/**
 * Promotion service — merchant-owned create/update/delete/archive.
 */
import { prisma } from "@/lib/prisma";
import type {
  CreatePromotionInput,
  UpdatePromotionInput,
} from "@/validators/promotion";
import type { BundleType, PromotionType } from "../../generated/prisma/client";

async function requireMerchantForUser(userId: string) {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });
  if (!merchant) {
    throw new Error("You need a merchant account to manage promotions.");
  }
  return merchant;
}

async function assertOwnedBusinessGraph(
  merchantId: string,
  businessId: string,
  branchId: string,
  menuId: string,
) {
  const business = await prisma.business.findFirst({
    where: { id: businessId, merchantId },
    select: {
      id: true,
      coverPhoto: true,
      branch: { where: { id: branchId }, select: { id: true } },
      menu: { where: { id: menuId }, select: { id: true } },
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }
  if (business.branch.length === 0) {
    throw new Error("Selected branch does not belong to this business.");
  }
  if (business.menu.length === 0) {
    throw new Error("Selected menu item does not belong to this business.");
  }

  return business;
}

function promotionData(input: CreatePromotionInput | UpdatePromotionInput) {
  const isDiscount = input.promotionType === "DISCOUNT";
  const isFree =
    input.promotionType === "BUNDLE" && input.bundleType === "FREE";
  const isPercent =
    input.promotionType === "BUNDLE" && input.bundleType === "PERCENTAGE_OFF";

  return {
    businessId: input.businessId,
    branchId: input.branchId,
    menuId: input.menuId,
    caption: input.caption,
    description: input.description,
    imageUrl: input.imageUrl?.trim() ? input.imageUrl.trim() : null,
    promotionType: input.promotionType as PromotionType,
    discountPercent: isDiscount ? (input.discountPercent ?? null) : null,
    bundleType: !isDiscount
      ? ((input.bundleType ?? null) as BundleType | null)
      : null,
    buyQuantity: isFree || isPercent ? (input.buyQuantity ?? null) : null,
    getQuantity: isFree ? (input.getQuantity ?? null) : null,
    bundleDiscountPercent: isPercent
      ? (input.bundleDiscountPercent ?? null)
      : null,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
  };
}

export async function getPromotionsForUser(userId: string) {
  const merchant = await requireMerchantForUser(userId);

  return prisma.promotion.findMany({
    where: { business: { merchantId: merchant.id } },
    include: {
      business: { select: { id: true, businessName: true, coverPhoto: true } },
      branch: true,
      menu: { select: { id: true, itemName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPromotionForUser(
  userId: string,
  input: CreatePromotionInput,
) {
  const merchant = await requireMerchantForUser(userId);
  await assertOwnedBusinessGraph(
    merchant.id,
    input.businessId,
    input.branchId,
    input.menuId,
  );

  return prisma.promotion.create({
    data: promotionData(input),
  });
}

export async function updatePromotionForUser(
  userId: string,
  input: UpdatePromotionInput,
) {
  const merchant = await requireMerchantForUser(userId);
  const existing = await prisma.promotion.findFirst({
    where: {
      id: input.promotionId,
      business: { merchantId: merchant.id },
    },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Promotion not found.");
  }

  await assertOwnedBusinessGraph(
    merchant.id,
    input.businessId,
    input.branchId,
    input.menuId,
  );

  return prisma.promotion.update({
    where: { id: input.promotionId },
    data: promotionData(input),
  });
}

export async function archivePromotionForUser(
  userId: string,
  promotionId: string,
) {
  const merchant = await requireMerchantForUser(userId);
  const existing = await prisma.promotion.findFirst({
    where: {
      id: promotionId,
      business: { merchantId: merchant.id },
    },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Promotion not found.");
  }

  return prisma.promotion.update({
    where: { id: promotionId },
    data: { archived: true },
  });
}

export async function deletePromotionForUser(
  userId: string,
  promotionId: string,
) {
  const merchant = await requireMerchantForUser(userId);
  const existing = await prisma.promotion.findFirst({
    where: {
      id: promotionId,
      business: { merchantId: merchant.id },
    },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Promotion not found.");
  }

  await prisma.promotion.delete({ where: { id: promotionId } });
}
