/**
 * Insertion Sort
 * --------------
 * Algorithm & Complexity course implementation.
 *
 * Idea: grow a sorted prefix of the array. For each new element `key`
 * (starting at index 1), shift larger elements in the prefix one slot right
 * until the correct hole is found, then drop `key` into that hole.
 *
 * Time complexity:
 *   - Best case  O(n)   — already sorted (inner while rarely runs)
 *   - Worst case O(n²)  — reverse sorted (each key shifts far left)
 *   - Average    O(n²)
 * Space complexity: O(1) extra on the working copy we mutate
 *                   (we copy the input first so callers stay immutable)
 *
 * Why it is practical here:
 * - Merchant businesses / menu lists are tiny (often < 10 or a few dozen)
 * - Low overhead vs Merge Sort's recursion + temporary arrays
 * - Adaptive: nearly-sorted data stays cheap after small edits
 */

import type { CompareFn } from "./types";

/**
 * Returns a new array sorted with Insertion Sort.
 *
 * @param items   - Input list (not mutated)
 * @param compare - Ordering function (< 0 means first arg comes first)
 */
export function insertionSort<T>(
  items: readonly T[],
  compare: CompareFn<T>,
): T[] {
  // Work on a copy so React state / server data stay unchanged.
  const arr = [...items];

  // Outer loop: arr[0..i-1] is already sorted; insert arr[i] into it.
  for (let i = 1; i < arr.length; i++) {
    // Element we are placing into the sorted prefix.
    const key = arr[i]!;

    // Start just left of `key` and walk left while elements are out of order.
    let j = i - 1;

    // Shift elements that should come AFTER `key` one position to the right.
    // compare(arr[j], key) > 0  ⇒  arr[j] is "greater" than key ⇒ move right.
    while (j >= 0 && compare(arr[j]!, key) > 0) {
      arr[j + 1] = arr[j]!;
      j -= 1;
    }

    // Hole at j+1 is the correct spot for `key`.
    arr[j + 1] = key;
  }

  return arr;
}
