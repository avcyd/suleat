/**
 * Merchant dashboard — Linear Search + Insertion/Merge Sort helpers.
 * Imports algorithms from dedicated files under this folder.
 */
import { linearSearchText } from "./linear-search";
import { insertionSort } from "./insertion-sort";
import { mergeSort } from "./merge-sort";
import {
  compareDates,
  compareNumbers,
  compareStrings,
} from "./helpers";
import type { SortDirection } from "./types";
import type { BusinessProfile, MenuItem, PromotionPost } from "@/types/merchant";
import { formatBranchLabel, formatMenuCategory, formatPromotionDeal } from "@/types/merchant";

export type BusinessSortKey = "name" | "branches";
export type PromotionSortKey = "caption" | "endDate";

/** Encoded sort values for the merchant Sort dropdown (select → Sort button). */
export const BUSINESS_SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "branches-asc", label: "Fewest branches" },
  { value: "branches-desc", label: "Most branches" },
] as const;

export const MENU_SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
] as const;

export const PROMOTION_SORT_OPTIONS = [
  { value: "endDate-asc", label: "Expires soon" },
  { value: "endDate-desc", label: "Expires later" },
  { value: "caption-asc", label: "Caption A–Z" },
  { value: "caption-desc", label: "Caption Z–A" },
] as const;

export function parseBusinessSort(value: string): {
  key: BusinessSortKey;
  direction: SortDirection;
} {
  const direction: SortDirection = value.endsWith("-desc") ? "desc" : "asc";
  const key: BusinessSortKey = value.startsWith("branches")
    ? "branches"
    : "name";
  return { key, direction };
}

export function parseMenuSort(value: string): SortDirection {
  return value.endsWith("-desc") ? "desc" : "asc";
}

export function parsePromotionSort(value: string): {
  key: PromotionSortKey;
  direction: SortDirection;
} {
  const direction: SortDirection = value.endsWith("-desc") ? "desc" : "asc";
  const key: PromotionSortKey = value.startsWith("caption")
    ? "caption"
    : "endDate";
  return { key, direction };
}

export function searchBusinesses(
  businesses: readonly BusinessProfile[],
  query: string,
): BusinessProfile[] {
  return linearSearchText(businesses, query, (business) => [
    business.businessName,
    business.description,
    ...business.branches.flatMap((branch) => [
      branch.city,
      branch.barangay,
      branch.street,
      formatBranchLabel(branch),
    ]),
  ]);
}

/** Insertion Sort — few businesses per merchant. */
export function sortBusinesses(
  businesses: readonly BusinessProfile[],
  key: BusinessSortKey,
  direction: SortDirection,
): BusinessProfile[] {
  if (key === "branches") {
    return insertionSort(businesses, (a, b) =>
      compareNumbers(a.branches.length, b.branches.length, direction),
    );
  }
  return insertionSort(businesses, (a, b) =>
    compareStrings(a.businessName, b.businessName, direction),
  );
}

export function searchMenuItems(
  menuItems: readonly MenuItem[],
  query: string,
  businessNameOf: (businessId: string) => string,
): MenuItem[] {
  return linearSearchText(menuItems, query, (item) => [
    item.itemName,
    item.description,
    businessNameOf(item.businessId),
    formatMenuCategory(item.category),
  ]);
}

/** Insertion Sort — menu catalogs stay modest per merchant. */
export function sortMenuItems(
  menuItems: readonly MenuItem[],
  direction: SortDirection,
): MenuItem[] {
  return insertionSort(menuItems, (a, b) =>
    compareStrings(a.itemName, b.itemName, direction),
  );
}

export function searchPromotions(
  promotions: readonly PromotionPost[],
  query: string,
  businessNameOf: (businessId: string) => string,
  branchLabelOf: (promo: PromotionPost) => string | undefined,
): PromotionPost[] {
  return linearSearchText(promotions, query, (promo) => [
    promo.caption,
    promo.description,
    businessNameOf(promo.businessId),
    promo.menuItemName,
    formatPromotionDeal(promo),
    branchLabelOf(promo),
  ]);
}

/** Merge Sort — promotions accumulate; guaranteed O(n log n). */
export function sortPromotions(
  promotions: readonly PromotionPost[],
  key: PromotionSortKey,
  direction: SortDirection,
): PromotionPost[] {
  if (key === "endDate") {
    return mergeSort(promotions, (a, b) =>
      compareDates(a.endDate, b.endDate, direction),
    );
  }
  return mergeSort(promotions, (a, b) =>
    compareStrings(a.caption, b.caption, direction),
  );
}
