"use client";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

/**
 * Client pagination — no navigation; parent already has the sorted list in memory.
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/8 px-4 py-3 text-sm">
      <p className="text-muted">
        {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span className="rounded-lg px-3 py-1.5 text-muted opacity-50">
            Previous
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg px-3 py-1.5 font-medium text-ink hover:bg-black/[0.04]"
          >
            Previous
          </button>
        )}
        <span className="text-xs text-muted">
          Page {page} / {totalPages}
        </span>
        {nextDisabled ? (
          <span className="rounded-lg px-3 py-1.5 text-muted opacity-50">
            Next
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg px-3 py-1.5 font-medium text-ink hover:bg-black/[0.04]"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
