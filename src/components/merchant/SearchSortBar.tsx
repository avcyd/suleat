"use client";

type SearchSortBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sortLabel: string;
  onToggleSort: () => void;
  placeholder?: string;
};

export function SearchSortBar({
  query,
  onQueryChange,
  sortLabel,
  onToggleSort,
  placeholder = "Search...",
}: SearchSortBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        className="w-full flex-1 rounded-full bg-search px-5 py-3 text-sm outline-none placeholder:text-muted focus:ring-1 focus:ring-ink/10"
      />
      <button
        type="button"
        onClick={onToggleSort}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Sort: {sortLabel}
      </button>
    </div>
  );
}
