/**
 * Shared types and string helpers for dashboard algorithms.
 */

/** Ascending vs descending order for comparators / sort helpers. */
export type SortDirection = "asc" | "desc";

/**
 * Comparator contract used by Insertion Sort and Merge Sort.
 * Return < 0 if `a` should come before `b`,
 *        > 0 if `a` should come after `b`,
 *        0 if they are considered equal (stable sorts keep original order).
 */
export type CompareFn<T> = (a: T, b: T) => number;

/**
 * Trim + lowercase a user query so Linear Search can do
 * case-insensitive partial matching consistently.
 */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}
