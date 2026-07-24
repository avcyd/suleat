/**
 * Admin dashboard — Linear Search + Merge Sort wrappers.
 * Imports algorithms from dedicated files under this folder.
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

export function searchAdminUsers<
  T extends { id: string; email: string; displayName: string },
>(items: readonly T[], query: string): T[] {
  const q = normalizeQuery(query);
  if (!q) return [...items];

  return linearSearch(items, (user) => {
    if (user.id.toLowerCase() === q) return true;
    return (
      user.email.toLowerCase().includes(q) ||
      user.displayName.toLowerCase().includes(q)
    );
  });
}

export function sortAdminUsers<
  T extends { email: string; displayName: string; role: string },
>(items: readonly T[], field: string, direction: SortDirection): T[] {
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

export function searchAdminCompanies<
  T extends {
    id: string;
    companyName: string;
    taxId: string;
    phoneNumber: string;
    user: { email: string; displayName: string };
  },
>(items: readonly T[], query: string): T[] {
  const q = normalizeQuery(query);
  if (!q) return [...items];

  return linearSearch(items, (company) => {
    if (company.id.toLowerCase() === q) return true;
    return (
      company.companyName.toLowerCase().includes(q) ||
      company.taxId.toLowerCase().includes(q) ||
      company.phoneNumber.toLowerCase().includes(q) ||
      company.user.email.toLowerCase().includes(q) ||
      company.user.displayName.toLowerCase().includes(q)
    );
  });
}

export function sortAdminCompanies<
  T extends { companyName: string; _count: { businesses: number } },
>(items: readonly T[], field: string, direction: SortDirection): T[] {
  if (field === "businessCount") {
    return mergeSort(items, (a, b) =>
      compareNumbers(a._count.businesses, b._count.businesses, direction),
    );
  }
  return mergeSort(items, (a, b) =>
    compareStrings(a.companyName, b.companyName, direction),
  );
}

export function searchAdminRequests<
  T extends {
    id: string;
    companyName: string;
    taxId: string;
    phoneNumber: string;
    user: { email: string; displayName: string };
  },
>(items: readonly T[], query: string): T[] {
  // Same partial-match Linear Search as companies (email + company name).
  return searchAdminCompanies(items, query);
}

export function sortAdminRequests<
  T extends { id: string; companyName: string; user: { email: string } },
>(items: readonly T[], field: string, direction: SortDirection): T[] {
  if (field === "email") {
    return mergeSort(items, (a, b) =>
      compareStrings(a.user.email, b.user.email, direction),
    );
  }
  // id ≈ chronological for CUID primary keys (newest / oldest applications)
  if (field === "id") {
    return mergeSort(items, (a, b) =>
      compareStrings(a.id, b.id, direction),
    );
  }
  return mergeSort(items, (a, b) =>
    compareStrings(a.companyName, b.companyName, direction),
  );
}

export function searchAdminPosts<
  T extends {
    id: string;
    caption: string;
    description?: string | null;
    business: {
      businessName: string;
      merchant: { companyName: string };
    };
  },
>(items: readonly T[], query: string): T[] {
  const q = normalizeQuery(query);
  if (!q) return [...items];

  return linearSearch(items, (post) => {
    if (post.id.toLowerCase() === q) return true;
    return (
      post.caption.toLowerCase().includes(q) ||
      (post.description ?? "").toLowerCase().includes(q) ||
      post.business.businessName.toLowerCase().includes(q) ||
      post.business.merchant.companyName.toLowerCase().includes(q)
    );
  });
}

export function sortAdminPosts<
  T extends {
    caption: string;
    startDate: Date | string;
    endDate: Date | string;
    createdAt: Date | string;
  },
>(items: readonly T[], field: string, direction: SortDirection): T[] {
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
