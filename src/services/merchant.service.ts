import { prisma } from "@/lib/prisma";
import type {
  CreateMerchantInput,
  UpdateMerchantInput,
} from "@/validators/merchant";

/** Create a Merchant profile for an existing User. */
export async function createMerchant(
  userId: string,
  input: CreateMerchantInput,
) {
  const existing = await prisma.merchant.findUnique({ where: { userId } });
  if (existing) {
    throw new Error("This user already has a merchant profile.");
  }

  const phoneTaken = await prisma.merchant.findUnique({
    where: { phoneNumber: input.phoneNumber },
  });
  if (phoneTaken) {
    throw new Error("This phone number is already registered to a merchant.");
  }

  const merchant = await prisma.merchant.create({
    data: {
      userId,
      companyName: input.companyName,
      phoneNumber: input.phoneNumber,
      taxId: input.taxId,
      verificationStatus: false,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { role: "MERCHANT" },
  });

  return merchant;
}

/** Load the merchant owned by this user (Account tab / dashboard). */
export async function getMerchantByUserId(userId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!merchant) {
    throw new Error("Merchant profile not found.");
  }

  return merchant;
}

/** Update merchant fields; scoped by userId so they only edit their own row. */
export async function updateMerchantByUserId(
  userId: string,
  input: UpdateMerchantInput,
) {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });
  if (!merchant) {
    throw new Error("Merchant profile not found.");
  }

  const phoneOwner = await prisma.merchant.findUnique({
    where: { phoneNumber: input.phoneNumber },
  });
  if (phoneOwner && phoneOwner.id !== merchant.id) {
    throw new Error("This phone number is already registered to a merchant.");
  }

  return prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      companyName: input.companyName,
      phoneNumber: input.phoneNumber,
      taxId: input.taxId,
    },
  });
}
