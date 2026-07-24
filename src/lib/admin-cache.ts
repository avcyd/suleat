/**
 * Cached admin dashboard reads (short TTL — mutations invalidate via tags).
 */
import { unstable_cache } from "next/cache";
import { getAdminCounts } from "@/services/admin.service";

export const getCachedAdminCounts = unstable_cache(
  async () => getAdminCounts(),
  ["admin-counts"],
  { revalidate: 30, tags: ["admin-counts"] },
);
