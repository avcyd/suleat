/**
 * Map Prisma merchant-domain rows to dashboard UI types.
 */
import type {
  BusinessProfile,
  MenuCategory,
  MenuItem,
  MerchantAccount,
} from "@/types/merchant";

type MerchantWithUser = {
  companyName: string;
  phoneNumber: string;
  taxId: string;
  user: {
    displayName: string;
    email: string;
  };
};

type BusinessWithBranches = {
  id: string;
  businessName: string;
  description: string;
  dateEstablishment: Date;
  coverPhoto: string;
  branch: Array<{
    id: string;
    number: string;
    building: string | null;
    street: string;
    barangay: string;
    city: string;
    province: string;
  }>;
};

type MenuRow = {
  id: string;
  businessId: string;
  itemName: string;
  description: string | null;
  price: { toString(): string } | number | string;
  category: MenuCategory;
  isAvailable: boolean;
};

export function toMerchantAccount(merchant: MerchantWithUser): MerchantAccount {
  return {
    displayName: merchant.user.displayName,
    email: merchant.user.email,
    companyName: merchant.companyName,
    phoneNumber: merchant.phoneNumber,
    taxId: merchant.taxId,
  };
}

export function toBusinessProfile(
  business: BusinessWithBranches,
): BusinessProfile {
  return {
    id: business.id,
    businessName: business.businessName,
    description: business.description,
    dateEstablishment: business.dateEstablishment.toISOString().slice(0, 10),
    coverPhoto: business.coverPhoto,
    createdAt: business.dateEstablishment.toISOString().slice(0, 10),
    branches: business.branch.map((branch) => ({
      id: branch.id,
      number: branch.number,
      building: branch.building ?? undefined,
      street: branch.street,
      barangay: branch.barangay,
      city: branch.city,
      province: branch.province,
    })),
  };
}

export function toMenuItem(item: MenuRow): MenuItem {
  return {
    id: item.id,
    businessId: item.businessId,
    itemName: item.itemName,
    description: item.description ?? undefined,
    price: Number(item.price),
    category: item.category,
    isAvailable: item.isAvailable,
  };
}
