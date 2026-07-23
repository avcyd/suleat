import Link from "next/link";
import { adminDashboardHref } from "@/lib/admin-href";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  /** Current list query params (page is overwritten per link). */
  listParams: Record<string, string | undefined>;
};

export function Pagination({
  page,
  pageSize,
  total,
  listParams,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const hrefForPage = (nextPage: number) =>
    adminDashboardHref({ ...listParams, page: String(nextPage) });

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/8 px-4 py-3 text-sm">
      <p className="text-muted">
        {total === 0
          ? "No results"
          : `Showing ${from}–${to} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span className="rounded-lg px-3 py-1.5 text-muted opacity-50">
            Previous
          </span>
        ) : (
          <Link
            href={hrefForPage(page - 1)}
            className="rounded-lg px-3 py-1.5 font-medium text-ink hover:bg-black/[0.04]"
          >
            Previous
          </Link>
        )}
        <span className="text-xs text-muted">
          Page {page} / {totalPages}
        </span>
        {nextDisabled ? (
          <span className="rounded-lg px-3 py-1.5 text-muted opacity-50">
            Next
          </span>
        ) : (
          <Link
            href={hrefForPage(page + 1)}
            className="rounded-lg px-3 py-1.5 font-medium text-ink hover:bg-black/[0.04]"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
