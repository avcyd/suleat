# Algorithms (Algorithm & Complexity)

Each algorithm lives in its **own file** with step-by-step comments:

| File | Algorithm |
| ---- | --------- |
| `linear-search.ts` | Linear Search — O(*n*) |
| `insertion-sort.ts` | Insertion Sort — O(*n*²) / O(*n*) best |
| `merge-sort.ts` | Merge Sort — O(*n* log *n*) |
| `helpers.ts` | Comparators + pagination |
| `types.ts` | Shared types |
| `merchant.ts` / `admin.ts` | Dashboard wrappers that **import** the algorithms above |

**Merchant + admin dashboards:** data is loaded once, then Linear Search / Insertion / Merge Sort run **in the browser** so Sort feels instant.

**Public offers:** database `ORDER BY` before `LIMIT` (`src/services/offer.service.ts`).
