import type {
  AdminBusinessDetail,
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminMerchantRequest,
  AdminPostDetail,
  AdminPostListItem,
  AdminUserDetail,
  AdminUserListItem,
} from "@/types/admin";
import {
  formatBranchAddress,
  formatMenuCategory,
  formatMenuPrice,
  formatPromotionDeal,
  type MenuCategory,
} from "@/types/merchant";

type DealFields = {
  id: string;
  caption: string;
  promotionType: "DISCOUNT" | "BUNDLE";
  discountPercent: number | null;
  bundleType: "FREE" | "PERCENTAGE_OFF" | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  bundleDiscountPercent: number | null;
};

function dealLabel(post: DealFields): string {
  return formatPromotionDeal({
    id: post.id,
    businessId: "",
    branchId: "",
    menuId: "",
    caption: post.caption,
    description: "",
    promotionType: post.promotionType,
    discountPercent: post.discountPercent ?? undefined,
    bundleType: post.bundleType ?? undefined,
    buyQuantity: post.buyQuantity ?? undefined,
    getQuantity: post.getQuantity ?? undefined,
    bundleDiscountPercent: post.bundleDiscountPercent ?? undefined,
    startDate: "",
    endDate: "",
    status: "active",
    createdAt: "",
  });
}

export function mapAdminUserListItem(user: {
  id: string;
  displayName: string;
  email: string;
  role: "USER" | "MERCHANT" | "ADMIN";
  merchant: { id: string; companyName: string } | null;
}): AdminUserListItem {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    companyName: user.merchant?.companyName,
  };
}

export function mapAdminUserDetail(user: {
  id: string;
  displayName: string;
  email: string;
  role: "USER" | "MERCHANT" | "ADMIN";
  merchant: {
    id: string;
    companyName: string;
    phoneNumber: string;
    taxId: string;
    verificationStatus: boolean;
  } | null;
}): AdminUserDetail {
  return {
    ...mapAdminUserListItem(user),
    merchant: user.merchant
      ? {
          id: user.merchant.id,
          companyName: user.merchant.companyName,
          phoneNumber: user.merchant.phoneNumber,
          taxId: user.merchant.taxId,
          verificationStatus: user.merchant.verificationStatus,
        }
      : undefined,
  };
}

export function mapAdminCompanyListItem(merchant: {
  id: string;
  companyName: string;
  phoneNumber: string;
  taxId: string;
  verificationStatus: boolean;
  _count: { businesses: number };
  user: { id: string; email: string; displayName: string };
}): AdminCompanyListItem {
  return {
    id: merchant.id,
    companyName: merchant.companyName,
    phoneNumber: merchant.phoneNumber,
    taxId: merchant.taxId,
    verificationStatus: merchant.verificationStatus,
    businessCount: merchant._count.businesses,
    ownerEmail: merchant.user.email,
    ownerName: merchant.user.displayName,
    ownerUserId: merchant.user.id,
  };
}

export function mapAdminCompanyDetail(merchant: {
  id: string;
  companyName: string;
  phoneNumber: string;
  taxId: string;
  verificationStatus: boolean;
  user: { id: string; email: string; displayName: string };
  businesses: Array<{
    id: string;
    businessName: string;
    description: string;
    coverPhoto: string;
    dateEstablishment: Date;
    _count: { branch: number; menu: number; promotion: number };
  }>;
  _count?: { businesses: number };
}): AdminCompanyDetail {
  return {
    id: merchant.id,
    companyName: merchant.companyName,
    phoneNumber: merchant.phoneNumber,
    taxId: merchant.taxId,
    verificationStatus: merchant.verificationStatus,
    businessCount: merchant._count?.businesses ?? merchant.businesses.length,
    ownerEmail: merchant.user.email,
    ownerName: merchant.user.displayName,
    ownerUserId: merchant.user.id,
    businesses: merchant.businesses.map((business) => ({
      id: business.id,
      businessName: business.businessName,
      description: business.description,
      coverPhoto: business.coverPhoto,
      dateEstablishment: business.dateEstablishment.toISOString().slice(0, 10),
      branchCount: business._count.branch,
      menuCount: business._count.menu,
      promotionCount: business._count.promotion,
    })),
  };
}

export function mapAdminBusinessDetail(business: {
  id: string;
  merchantId: string;
  businessName: string;
  description: string;
  coverPhoto: string;
  dateEstablishment: Date;
  merchant: { companyName: string };
  branch: Array<{
    id: string;
    number: string;
    building: string | null;
    street: string;
    barangay: string;
    city: string;
    province: string;
  }>;
  menu: Array<{
    id: string;
    itemName: string;
    description: string | null;
    price: { toString(): string } | number | string;
    category: string;
    isAvailable: boolean;
  }>;
  _count: { promotion: number; branch: number; menu: number };
}): AdminBusinessDetail {
  return {
    id: business.id,
    merchantId: business.merchantId,
    companyName: business.merchant.companyName,
    businessName: business.businessName,
    description: business.description,
    coverPhoto: business.coverPhoto,
    dateEstablishment: business.dateEstablishment.toISOString().slice(0, 10),
    promotionCount: business._count.promotion,
    branchTotal: business._count.branch,
    menuTotal: business._count.menu,
    branches: business.branch.map((branch) => ({
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
    menu: business.menu.map((item) => ({
      id: item.id,
      itemName: item.itemName,
      description: item.description ?? undefined,
      priceLabel: formatMenuPrice(Number(item.price)),
      categoryLabel: formatMenuCategory(item.category as MenuCategory),
      isAvailable: item.isAvailable,
    })),
  };
}

export function mapAdminPostListItem(post: DealFields & {
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  business: {
    businessName: string;
    merchant: { companyName: string };
  };
}): AdminPostListItem {
  return {
    id: post.id,
    caption: post.caption,
    promotionType: post.promotionType,
    dealLabel: dealLabel(post),
    businessName: post.business.businessName,
    companyName: post.business.merchant.companyName,
    startDate: post.startDate.toISOString().slice(0, 10),
    endDate: post.endDate.toISOString().slice(0, 10),
    createdAt: post.createdAt.toISOString().slice(0, 10),
  };
}

export function mapAdminPostDetail(post: DealFields & {
  description: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  business: {
    businessName: string;
    merchant: { companyName: string };
  };
  branch: {
    number: string;
    street: string;
    barangay: string;
    city: string;
  };
}): AdminPostDetail {
  return {
    ...mapAdminPostListItem(post),
    description: post.description,
    branchLabel: `${post.branch.number} ${post.branch.street}, ${post.branch.city}`,
  };
}

export function mapAdminMerchantRequest(merchant: {
  id: string;
  companyName: string;
  phoneNumber: string;
  taxId: string;
  user: { id: string; email: string; displayName: string };
}): AdminMerchantRequest {
  return {
    id: merchant.id,
    companyName: merchant.companyName,
    phoneNumber: merchant.phoneNumber,
    taxId: merchant.taxId,
    ownerUserId: merchant.user.id,
    ownerName: merchant.user.displayName,
    ownerEmail: merchant.user.email,
  };
}
