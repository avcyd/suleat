/**
 * Menu service
 * ------------
 * Menu items belong to a Business (one business → many menu items).
 * Branches are separate (one business → many branches).
 * Only the merchant who owns the business can manage its menu.
 */
import { prisma } from "@/lib/prisma";
import type {
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from "@/validators/menu";

async function requireOwnedBusiness(userId: string, businessId: string) {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });
  if (!merchant) {
    throw new Error("You need a merchant account to manage menu items.");
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, merchantId: merchant.id },
  });
  if (!business) {
    throw new Error("Business not found.");
  }

  return { merchant, business };
}

function normalizeDescription(description: string | undefined) {
  const trimmed = description?.trim();
  return trimmed ? trimmed : undefined;
}

/** Add a menu item to a business the user owns. */
export async function createMenuItem(
  userId: string,
  input: CreateMenuItemInput,
) {
  await requireOwnedBusiness(userId, input.businessId);

  return prisma.menu.create({
    data: {
      businessId: input.businessId,
      itemName: input.itemName,
      description: normalizeDescription(input.description),
      price: input.price,
      category: input.category,
      isAvailable: input.isAvailable,
    },
  });
}

/** List menu items for a business the user owns. */
export async function getMenuItemsByBusinessForUser(
  userId: string,
  businessId: string,
) {
  await requireOwnedBusiness(userId, businessId);

  return prisma.menu.findMany({
    where: { businessId },
    orderBy: [{ category: "asc" }, { itemName: "asc" }],
  });
}

/** List all menu items across businesses owned by this merchant. */
export async function getMenuItemsForUser(userId: string) {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });
  if (!merchant) {
    throw new Error("You need a merchant account to manage menu items.");
  }

  return prisma.menu.findMany({
    where: { business: { merchantId: merchant.id } },
    orderBy: [{ category: "asc" }, { itemName: "asc" }],
  });
}

/** Update a menu item if it belongs to a business the user owns. */
export async function updateMenuItemForUser(
  userId: string,
  menuItemId: string,
  input: UpdateMenuItemInput,
) {
  const existing = await prisma.menu.findUnique({
    where: { id: menuItemId },
  });
  if (!existing) {
    throw new Error("Menu item not found.");
  }

  await requireOwnedBusiness(userId, existing.businessId);

  return prisma.menu.update({
    where: { id: menuItemId },
    data: {
      itemName: input.itemName,
      description: normalizeDescription(input.description),
      price: input.price,
      category: input.category,
      isAvailable: input.isAvailable,
    },
  });
}

/** Delete a menu item if it belongs to a business the user owns. */
export async function deleteMenuItemForUser(
  userId: string,
  menuItemId: string,
) {
  const existing = await prisma.menu.findUnique({
    where: { id: menuItemId },
  });
  if (!existing) {
    throw new Error("Menu item not found.");
  }

  await requireOwnedBusiness(userId, existing.businessId);

  return prisma.menu.delete({ where: { id: menuItemId } });
}
