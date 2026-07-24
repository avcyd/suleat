"use client";

type SortOption = {
  value: string;
  label: string;
};

type SearchSortBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  /** Options shown in the sort dropdown (select a method, then click Sort). */
  sortOptions: SortOption[];
  /** Currently selected sort method in the dropdown (may not be applied yet). */
  sortValue: string;
  onSortValueChange: (value: string) => void;
  /** Apply the selected sort method. */
  onSort: () => void;
  placeholder?: string;
};

/**
 * Merchant dashboard toolbar: live search input + sort method select + Sort button.
 */
export function SearchSortBar({
  query,
  onQueryChange,
  sortOptions,
  sortValue,
  onSortValueChange,
  onSort,
  placeholder = "Search...",
}: SearchSortBarProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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
        className="shrink-0 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-[#1a2430]"
      >
        Sort
      </button>
    </div>
  );
}
