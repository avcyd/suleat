import Link from "next/link";

type AdminSearchBarProps = {
  defaultQuery: string;
  placeholder: string;
  /** Current searchParams as a plain object (excluding q/page which we control). */
  baseParams: Record<string, string | undefined>;
  sortOptions: Array<{ value: string; label: string }>;
  currentSort: string;
};

/**
 * GET form that updates URL search params (server-driven search/sort).
 */
export function AdminSearchBar({
  defaultQuery,
  placeholder,
  baseParams,
  sortOptions,
  currentSort,
}: AdminSearchBarProps) {
  return (
    <form
      method="get"
      className="flex flex-wrap items-center gap-2 border-b border-black/8 p-3"
    >
      {Object.entries(baseParams).map(([key, value]) =>
        value ? (
          <input key={key} type="hidden" name={key} value={value} />
        ) : null,
      )}
      <input type="hidden" name="page" value="1" />
      <input
        type="search"
        name="q"
        defaultValue={defaultQuery}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg bg-search px-3 py-2 text-sm outline-none placeholder:text-muted focus:ring-1 focus:ring-ink/10"
      />
      <label className="flex items-center gap-1.5 text-xs text-muted">
        Sort
        <select
          name="sort"
          defaultValue={currentSort}
          className="rounded-lg bg-search px-2 py-2 text-xs font-medium text-ink outline-none focus:ring-1 focus:ring-ink/10"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-[#1a2430]"
      >
        Sort
      </button>
      {defaultQuery ? (
        <Link
          href={buildClearHref(baseParams)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-black/[0.04]"
        >
          Clear
        </Link>
      ) : null}
    </form>
  );
}

function buildClearHref(baseParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(baseParams)) {
    if (value) params.set(key, value);
  }
  params.set("page", "1");
  const qs = params.toString();
  return qs ? `/admin/dashboard?${qs}` : "/admin/dashboard";
}
