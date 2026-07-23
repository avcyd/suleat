import type { Offer } from "@/types/landing";
import { formatBranchAddress, formatPromotionDeal } from "@/types/merchant";
import type { Category } from "../../generated/prisma/client";

type OfferSource = {
  id: string;
  caption: string;
  description: string;
  imageUrl: string | null;
  promotionType: "DISCOUNT" | "BUNDLE";
  discountPercent: number | null;
  bundleType: "FREE" | "PERCENTAGE_OFF" | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  bundleDiscountPercent: number | null;
  startDate: Date | string;
  endDate: Date | string;
  business: {
    id: string;
    businessName: string;
    coverPhoto: string;
    merchant: { companyName: string };
  };
  menu: {
    itemName: string;
    price: { toString(): string } | number | string;
    category: Category;
  };
  branch: {
    number: string;
    building: string | null;
    street: string;
    barangay: string;
    city: string;
    province: string;
  };
};

/** `unstable_cache` JSON-serializes Dates to strings — coerce before formatting. */
function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

function formatExpiresAt(value: Date | string): string {
  const date = toDate(value);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function formatYmd(value: Date | string): string {
  return toDate(value).toISOString().slice(0, 10);
}

/** Title-case category label for offer filters (e.g. PASTRY → Pastry). */
function categoryLabel(category: Category): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

export function toOffer(post: OfferSource): Offer {
  const discountLabel = formatPromotionDeal({
    id: post.id,
    businessId: post.business.id,
    branchId: "",
    menuId: "",
    caption: post.caption,
    description: post.description,
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

  return {
    id: post.id,
    businessId: post.business.id,
    title: post.caption,
    description: post.description,
    merchant: post.business.businessName,
    companyName: post.business.merchant.companyName,
    address: formatBranchAddress({
      id: "",
      number: post.branch.number,
      building: post.branch.building ?? "",
      street: post.branch.street,
      barangay: post.branch.barangay,
      city: post.branch.city,
      province: post.branch.province,
    }),
    image:
      post.imageUrl ||
      post.business.coverPhoto ||
      "/images/landing/offer-latte.png",
    discountLabel,
    expiresAt: formatExpiresAt(post.endDate),
    startDate: formatYmd(post.startDate),
    endDate: formatYmd(post.endDate),
    href: `/offers#${post.id}`,
    category: categoryLabel(post.menu.category),
    menuItemName: post.menu.itemName,
    menuPrice: Number(post.menu.price),
    promotionType: post.promotionType,
    discountPercent: post.discountPercent ?? undefined,
    bundleType: post.bundleType ?? undefined,
    buyQuantity: post.buyQuantity ?? undefined,
    getQuantity: post.getQuantity ?? undefined,
    bundleDiscountPercent: post.bundleDiscountPercent ?? undefined,
  };
}
