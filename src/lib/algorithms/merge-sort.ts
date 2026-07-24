/**
 * Merge Sort
 * ----------
 * Algorithm & Complexity course implementation.
 *
 * Idea (divide and conquer):
 *   1. Split the array into two halves
 *   2. Recursively Merge-Sort each half
 *   3. Merge the two sorted halves into one sorted array
 *
 * Time complexity:  O(n log n) in all cases (best / average / worst)
 * Space complexity: O(n) for temporary merge buffers + O(log n) recursion
 * Stability:        Yes — equal elements keep their relative order
 *                   (we use <= when merging)
 *
 * Why it is practical here:
 * - Admin tables and merchant promotions can grow large
 * - Guaranteed O(n log n) beats Insertion Sort's O(n²) as n increases
 * - Stability matters when sorting by date then keeping ties tidy
 */

import type { CompareFn } from "./types";

/**
 * Public entry: returns a new array sorted with Merge Sort.
 */
export function mergeSort<T>(
  items: readonly T[],
  compare: CompareFn<T>,
): T[] {
  // Base case: 0 or 1 element is already sorted.
  if (items.length <= 1) {
    return [...items];
  }

  // Divide: midpoint index (floor for odd lengths).
  const mid = Math.floor(items.length / 2);

  // Conquer: sort left half [0 .. mid) and right half [mid .. n).
  const left = mergeSort(items.slice(0, mid), compare);
  const right = mergeSort(items.slice(mid), compare);

  // Combine: merge two sorted runs into one.
  return merge(left, right, compare);
}

/**
 * Merge two already-sorted arrays into one sorted array.
 *
 * Two pointers walk left and right; at each step the smaller head is appended.
 * Remaining tails are copied at the end.
 */
function merge<T>(left: T[], right: T[], compare: CompareFn<T>): T[] {
  const out: T[] = [];
  let i = 0; // pointer into left
  let j = 0; // pointer into right

  // While both runs still have elements, pick the next ordered value.
  while (i < left.length && j < right.length) {
    // <= makes the sort stable: when equal, take from the left run first
    // (left came from earlier in the original array).
    if (compare(left[i]!, right[j]!) <= 0) {
      out.push(left[i]!);
      i += 1;
    } else {
      out.push(right[j]!);
      j += 1;
    }
  }

  // One run is exhausted — append whatever remains from the other.
  while (i < left.length) {
    out.push(left[i]!);
    i += 1;
  }
  while (j < right.length) {
    out.push(right[j]!);
    j += 1;
  }

  return out;
}
