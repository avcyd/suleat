"use server";

/**
 * Public offer/business reads for client overlays (no auth).
 */
import { getPublicBusinessById } from "@/services/offer.service";
import {
  formatBranchAddress,
  formatMenuCategory,
  formatMenuPrice,
} from "@/types/merchant";
import type { MenuCategory } from "@/types/merchant";

export type PublicBusinessView = {
  id: string;
  businessName: string;
  description: string;
  coverPhoto: string;
  dateEstablishment: string;
  companyName: string;
  branches: Array<{ id: string; label: string }>;
  menu: Array<{
    id: string;
    itemName: string;
    description?: string;
    priceLabel: string;
    categoryLabel: string;
    isAvailable: boolean;
  }>;
};

export type PublicBusinessActionState = {
  ok: boolean;
  message: string;
  business?: PublicBusinessView;
};

export async function getPublicBusinessAction(
  businessId: string,
): Promise<PublicBusinessActionState> {
  if (!businessId.trim()) {
    return { ok: false, message: "Business id is required." };
  }

  try {
    const row = await getPublicBusinessById(businessId);
    return {
      ok: true,
      message: "ok",
      business: {
        id: row.id,
        businessName: row.businessName,
        description: row.description,
        coverPhoto: row.coverPhoto,
        dateEstablishment: row.dateEstablishment.toISOString().slice(0, 10),
        companyName: row.merchant.companyName,
        branches: row.branch.map((branch) => ({
          id: branch.id,
          label: formatBranchAddress({
            id: branch.id,
            number: branch.number,
            building: branch.building ?? undefined,
            street: branch.street,
            barangay: branch.barangay,
            city: branch.city,
            province: branch.province,
          }),
        })),
        menu: row.menu.map((item) => ({
          id: item.id,
          itemName: item.itemName,
          description: item.description ?? undefined,
          priceLabel: formatMenuPrice(Number(item.price)),
          categoryLabel: formatMenuCategory(item.category as MenuCategory),
          isAvailable: item.isAvailable,
        })),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not load business.",
    };
  }
}
