/**
 * Merchant dashboard domain types (frontend / mock).
 * Aligned with Prisma Business, Branch, Menu + Promotion concepts.
 */

export type BranchLocation = {
  id: string;
  number: string;
  building?: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
};

export type BusinessProfile = {
  id: string;
  businessName: string;
  description: string;
  dateEstablishment: string; // YYYY-MM-DD
  coverPhoto: string;
  /** One business can have multiple branches */
  branches: BranchLocation[];
  createdAt: string;
};

/** Matches Prisma Category enum */
export type MenuCategory =
  | "BEVERAGE"
  | "PASTRY"
  | "PASTA"
  | "DESSERT"
  | "BURGER"
  | "PIZZA"
  | "CHICKEN"
  | "PORK";

export const MENU_CATEGORIES: MenuCategory[] = [
  "BEVERAGE",
  "PASTRY",
  "PASTA",
  "DESSERT",
  "BURGER",
  "PIZZA",
  "CHICKEN",
  "PORK",
];

export type MenuItem = {
  id: string;
  businessId: string;
  itemName: string;
  description?: string;
  /** Decimal(10,2) in Prisma — number on the frontend */
  price: number;
  category: MenuCategory;
  isAvailable: boolean;
};

export type PromotionStatus = "active" | "archived";
export type PromotionType = "DISCOUNT" | "BUNDLE";
export type BundleType = "FREE" | "PERCENTAGE_OFF";

export type PromotionPost = {
  id: string;
  businessId: string;
  /** Branch where the promotion is effective */
  branchId: string;
  caption: string;
  description: string;
  promotionType: PromotionType;
  /** Used when promotionType === DISCOUNT */
  discountPercent?: number;
  /** Used when promotionType === BUNDLE */
  bundleType?: BundleType;
  /** FREE: Buy X Get Y free — also used later for highest-discount sorting */
  buyQuantity?: number;
  getQuantity?: number;
  /** PERCENTAGE_OFF: Buy X Get Y% off */
  bundleDiscountPercent?: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  createdAt: string;
};

export type MerchantAccount = {
  displayName: string;
  email: string;
  companyName: string;
  phoneNumber: string;
  taxId: string;
};

export type SortDirection = "asc" | "desc";

export function formatMenuCategory(category: MenuCategory): string {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function formatMenuPrice(price: number): string {
  return `₱${price.toFixed(2)}`;
}

/** Short branch label for lists/selects, e.g. "BGC · 5th Ave, Taguig". */
export function formatBranchLabel(branch: BranchLocation): string {
  const streetLine = [branch.number, branch.street].filter(Boolean).join(" ");
  const area = [branch.barangay, branch.city].filter(Boolean).join(", ");
  return `${streetLine} · ${area}`;
}

export function formatBranchAddress(branch: BranchLocation): string {
  const parts = [
    branch.number,
    branch.building,
    branch.street,
    branch.barangay,
    branch.city,
    branch.province,
  ].filter(Boolean);
  return parts.join(", ");
}

/** Human-readable deal badge, e.g. "Buy 2 Get 1" or "Buy 2 Get 20% off". */
export function formatPromotionDeal(promo: PromotionPost): string {
  if (promo.promotionType === "DISCOUNT") {
    return `-${promo.discountPercent ?? 0}%`;
  }

  if (promo.bundleType === "PERCENTAGE_OFF") {
    return `Buy ${promo.buyQuantity ?? 0} Get ${promo.bundleDiscountPercent ?? 0}% off`;
  }

  // FREE bundle
  return `Buy ${promo.buyQuantity ?? 0} Get ${promo.getQuantity ?? 0}`;
}

type DiscountSortFields = Pick<
  PromotionPost,
  | "promotionType"
  | "discountPercent"
  | "bundleType"
  | "buyQuantity"
  | "getQuantity"
  | "bundleDiscountPercent"
>;

/**
 * Normalized discount % for future "highest discount" sorting.
 * FREE: get / (buy + get) * 100
 * PERCENTAGE_OFF / DISCOUNT: the percent value
 */
export function getEffectiveDiscountPercent(promo: DiscountSortFields): number {
  if (promo.promotionType === "DISCOUNT") {
    return promo.discountPercent ?? 0;
  }

  if (promo.bundleType === "PERCENTAGE_OFF") {
    return promo.bundleDiscountPercent ?? 0;
  }

  const buy = promo.buyQuantity ?? 0;
  const get = promo.getQuantity ?? 0;
  const total = buy + get;
  if (total <= 0) return 0;
  return Math.round((get / total) * 100);
}
