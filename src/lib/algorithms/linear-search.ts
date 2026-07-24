/**
 * Linear Search
 * -------------
 * Algorithm & Complexity course implementation.
 *
 * Idea: walk the list from index 0 to n-1 and keep every element that matches.
 * There is no "early exit for the whole list" when we want ALL matches
 * (partial text search), so every element is inspected once.
 *
 * Time complexity:  O(n) — one pass over the array
 * Space complexity: O(k) for the result list (k = number of matches),
 *                   or O(1) extra if you only counted / returned the first hit
 *
 * Why it is practical here:
 * - Merchant/admin lists are unsorted and we need substring / partial matches
 * - Binary Search would require a sorted key and exact comparisons
 */

import { normalizeQuery } from "./types";

/**
 * Generic Linear Search.
 *
 * @param items   - Array to scan left → right
 * @param matches - Predicate; return true to include that item in the result
 */
export function linearSearch<T>(
  items: readonly T[],
  matches: (item: T) => boolean,
): T[] {
  // Accumulator for every item that satisfies the predicate.
  const results: T[] = [];

  // Classic sequential scan: i goes 0, 1, 2, …, n-1.
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;

    // Compare / test the current element.
    // If it matches, append it — we do not stop, because dashboards
    // need every hit (e.g. all businesses whose name contains "cafe").
    if (matches(item)) {
      results.push(item);
    }
  }

  return results;
}

/**
 * Linear Search specialized for text fields.
 *
 * Builds haystacks (strings to search inside) per item, then checks whether
 * the normalized query appears as a substring of any haystack.
 *
 * Empty query → return a shallow copy of the full list (nothing to filter).
 */
export function linearSearchText<T>(
  items: readonly T[],
  query: string,
  getHaystacks: (item: T) => Array<string | null | undefined>,
): T[] {
  const q = normalizeQuery(query);

  // No search term: treat every item as a match (identity filter).
  if (!q) {
    return [...items];
  }

  return linearSearch(items, (item) => {
    const haystacks = getHaystacks(item);

    // OR across fields: match if ANY field contains the query.
    for (let h = 0; h < haystacks.length; h++) {
      const value = (haystacks[h] ?? "").toLowerCase();
      if (value.includes(q)) {
        return true;
      }
    }
    return false;
  });
}
