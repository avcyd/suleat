/**
 * Algorithm & Complexity — public barrel
 * --------------------------------------
 * Import primitives from dedicated files:
 *   - linear-search.ts
 *   - insertion-sort.ts
 *   - merge-sort.ts
 *   - helpers.ts / types.ts
 *
 * Domain wrappers: merchant.ts, admin.ts
 * Public offers still use database ORDER BY (offer.service.ts).
 */

export type { CompareFn, SortDirection } from "./types";
export { normalizeQuery } from "./types";

export { linearSearch, linearSearchText } from "./linear-search";
export { insertionSort } from "./insertion-sort";
export { mergeSort } from "./merge-sort";
export {
  compareDates,
  compareNumbers,
  compareStrings,
  paginate,
} from "./helpers";
