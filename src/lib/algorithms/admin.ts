/**
 * Admin dashboard — Linear Search + Merge Sort (view-model / client-safe).
 * Panels import these and run them in the browser for instant Sort.
 */
import { linearSearch } from "./linear-search";
import { mergeSort } from "./merge-sort";
import {
  compareDates,
  compareNumbers,
  compareStrings,
  paginate,
} from "./helpers";
import { normalizeQuery, type SortDirection } from "./types";
import type {
  AdminCompanyListItem,
  AdminMerchantRequest,
  AdminPostListItem,
  AdminUserListItem,
} from "@/types/admin";

export function parseAdminSort(sort?: string): {
  field: string;
  direction: SortDirection;
} {
  const raw = (sort ?? "").trim();
  if (!raw) return { field: "", direction: "asc" };
  if (raw.startsWith("-")) {
    return { field: raw.slice(1), direction: "desc" };
  }
  return { field: raw, direction: "asc" };
}

export function searchAdminUserList(
  items: readonly AdminUserListItem[],
  query: string,
): AdminUserListItem[] {
  const q = normalizeQuery(query);
  if (!q) return [...items];

  return linearSearch(items, (user) => {
    if (user.id.toLowerCase() === q) return true;
    return (
      user.email.toLowerCase().includes(q) ||
      user.displayName.toLowerCase().includes(q) ||
      (user.companyName?.toLowerCase().includes(q) ?? false)
    );
  });
}

export function sortAdminUserList(
  items: readonly AdminUserListItem[],
  field: string,
  direction: SortDirection,
): AdminUserListItem[] {
  if (field === "displayName") {
    return mergeSort(items, (a, b) =>
      compareStrings(a.displayName, b.displayName, direction),
    );
  }
  if (field === "role") {
    return mergeSort(items, (a, b) =>
      compareStrings(a.role, b.role, direction),
    );
  }
  return mergeSort(items, (a, b) =>
    compareStrings(a.email, b.email, direction),
  );
}

export function searchAdminCompanyList(
  items: readonly AdminCompanyListItem[],
  query: string,
): AdminCompanyListItem[] {
  const q = normalizeQuery(query);
  if (!q) return [...items];

  return linearSearch(items, (company) => {
    if (company.id.toLowerCase() === q) return true;
    return (
      company.companyName.toLowerCase().includes(q) ||
      company.taxId.toLowerCase().includes(q) ||
      company.phoneNumber.toLowerCase().includes(q) ||
      company.ownerEmail.toLowerCase().includes(q) ||
      company.ownerName.toLowerCase().includes(q)
    );
  });
}

export function sortAdminCompanyList(
  items: readonly AdminCompanyListItem[],
  field: string,
  direction: SortDirection,
): AdminCompanyListItem[] {
  if (field === "businessCount") {
    return mergeSort(items, (a, b) =>
      compareNumbers(a.businessCount, b.businessCount, direction),
    );
  }
  return mergeSort(items, (a, b) =>
    compareStrings(a.companyName, b.companyName, direction),
  );
}

export function searchAdminRequestList(
  items: readonly AdminMerchantRequest[],
  query: string,
): AdminMerchantRequest[] {
  const q = normalizeQuery(query);
  if (!q) return [...items];

  return linearSearch(items, (request) => {
    if (request.id.toLowerCase() === q) return true;
    return (
      request.companyName.toLowerCase().includes(q) ||
      request.taxId.toLowerCase().includes(q) ||
      request.phoneNumber.toLowerCase().includes(q) ||
      request.ownerEmail.toLowerCase().includes(q) ||
      request.ownerName.toLowerCase().includes(q)
    );
  });
}

export function sortAdminRequestList(
  items: readonly AdminMerchantRequest[],
  field: string,
  direction: SortDirection,
): AdminMerchantRequest[] {
  if (field === "email") {
    return mergeSort(items, (a, b) =>
      compareStrings(a.ownerEmail, b.ownerEmail, direction),
    );
  }
  if (field === "id") {
    return mergeSort(items, (a, b) =>
      compareStrings(a.id, b.id, direction),
    );
  }
  return mergeSort(items, (a, b) =>
    compareStrings(a.companyName, b.companyName, direction),
  );
}

export function searchAdminPostList(
  items: readonly AdminPostListItem[],
  query: string,
): AdminPostListItem[] {
  const q = normalizeQuery(query);
  if (!q) return [...items];

  return linearSearch(items, (post) => {
    if (post.id.toLowerCase() === q) return true;
    return (
      post.caption.toLowerCase().includes(q) ||
      post.dealLabel.toLowerCase().includes(q) ||
      post.businessName.toLowerCase().includes(q) ||
      post.companyName.toLowerCase().includes(q)
    );
  });
}

export function sortAdminPostList(
  items: readonly AdminPostListItem[],
  field: string,
  direction: SortDirection,
): AdminPostListItem[] {
  if (field === "caption") {
    return mergeSort(items, (a, b) =>
      compareStrings(a.caption, b.caption, direction),
    );
  }
  if (field === "startDate") {
    return mergeSort(items, (a, b) =>
      compareDates(a.startDate, b.startDate, direction),
    );
  }
  if (field === "endDate") {
    return mergeSort(items, (a, b) =>
      compareDates(a.endDate, b.endDate, direction),
    );
  }
  return mergeSort(items, (a, b) =>
    compareDates(a.createdAt, b.createdAt, direction),
  );
}

export { paginate };
