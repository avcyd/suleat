/**
 * Comparison helpers + pagination (used after search/sort).
 */

import type { SortDirection } from "./types";

export type { SortDirection };

/** Locale-aware string compare with direction. */
export function compareStrings(
  a: string,
  b: string,
  direction: SortDirection = "asc",
): number {
  const cmp = a.localeCompare(b, undefined, { sensitivity: "base" });
  return direction === "asc" ? cmp : -cmp;
}

/** Numeric compare with direction. */
export function compareNumbers(
  a: number,
  b: number,
  direction: SortDirection = "asc",
): number {
  const cmp = a === b ? 0 : a < b ? -1 : 1;
  return direction === "asc" ? cmp : -cmp;
}

/** Date / ISO-string compare with direction. */
export function compareDates(
  a: string | Date,
  b: string | Date,
  direction: SortDirection = "asc",
): number {
  const av = a instanceof Date ? a.getTime() : Date.parse(a);
  const bv = b instanceof Date ? b.getTime() : Date.parse(b);
  return compareNumbers(
    Number.isFinite(av) ? av : 0,
    Number.isFinite(bv) ? bv : 0,
    direction,
  );
}

/**
 * Slice a fully searched+sorted list into a 1-based page.
 * Admin dashboards: algorithm first, then paginate for the UI table.
 */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): { items: T[]; total: number; page: number; pageSize: number } {
  const safePage = page < 1 ? 1 : Math.floor(page);
  const safeSize = pageSize < 1 ? 1 : Math.floor(pageSize);
  const total = items.length;
  const start = (safePage - 1) * safeSize;

  return {
    items: items.slice(start, start + safeSize),
    total,
    page: safePage,
    pageSize: safeSize,
  };
}
