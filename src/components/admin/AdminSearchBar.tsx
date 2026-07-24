"use client";

/**
 * Client admin toolbar — search as you type; pick a sort method then click Sort.
 * (No URL round-trip — algorithms run in the browser.)
 */
type SortOption = { value: string; label: string };

type AdminSearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  sortOptions: SortOption[];
  sortValue: string;
  onSortValueChange: (value: string) => void;
  onSort: () => void;
};

export function AdminSearchBar({
  query,
  onQueryChange,
  placeholder,
  sortOptions,
  sortValue,
  onSortValueChange,
  onSort,
}: AdminSearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-black/8 p-3">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg bg-search px-3 py-2 text-sm outline-none placeholder:text-muted focus:ring-1 focus:ring-ink/10"
      />
      <label className="flex items-center gap-1.5 text-xs text-muted">
        <span className="shrink-0">Sort by</span>
        <select
          value={sortValue}
          onChange={(event) => onSortValueChange(event.target.value)}
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
        type="button"
        onClick={onSort}
        className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-[#1a2430]"
      >
        Sort
      </button>
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-black/[0.04]"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
