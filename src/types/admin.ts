/**
 * Admin dashboard view types (mapped from Prisma).
 */

export type AdminUserListItem = {
  id: string;
  displayName: string;
  email: string;
  role: "USER" | "MERCHANT" | "ADMIN";
  companyName?: string;
};

export type AdminUserDetail = AdminUserListItem & {
  merchant?: {
    id: string;
    companyName: string;
    phoneNumber: string;
    taxId: string;
    verificationStatus: boolean;
  };
};

export type AdminCompanyListItem = {
  id: string;
  companyName: string;
  phoneNumber: string;
  taxId: string;
  verificationStatus: boolean;
  businessCount: number;
  ownerEmail: string;
  ownerName: string;
  ownerUserId: string;
};

export type AdminCompanyDetail = AdminCompanyListItem & {
  businesses: Array<{
    id: string;
    businessName: string;
    description: string;
    coverPhoto: string;
    dateEstablishment: string;
    branchCount: number;
    menuCount: number;
    promotionCount: number;
  }>;
};

export type AdminBusinessDetail = {
  id: string;
  merchantId: string;
  companyName: string;
  businessName: string;
  description: string;
  coverPhoto: string;
  dateEstablishment: string;
  promotionCount: number;
  branches: Array<{
    id: string;
    label: string;
  }>;
  menu: Array<{
    id: string;
    itemName: string;
    description?: string;
    priceLabel: string;
    categoryLabel: string;
    isAvailable: boolean;
  }>;
};

/** Lean row for the posts table (description loaded only in detail). */
export type AdminPostListItem = {
  id: string;
  caption: string;
  promotionType: string;
  dealLabel: string;
  businessName: string;
  companyName: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type AdminPostDetail = AdminPostListItem & {
  description: string;
  branchLabel: string;
};

export type SortDirection = "asc" | "desc";

export type AdminPageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminCounts = {
  users: number;
  companies: number;
  posts: number;
  admins: number;
  pendingRequests: number;
};

export type AdminMerchantRequest = {
  id: string;
  companyName: string;
  phoneNumber: string;
  taxId: string;
  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
};

export type AdminTab = "users" | "companies" | "posts" | "requests";

export const ADMIN_PAGE_SIZE = 20;
