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
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg bg-search px-3 py-2 text-sm outline-none placeholder:text-muted focus:ring-1 focus:ring-ink/10"
      />
      <button
        type="button"
        onClick={onToggleSort}
        className="shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium text-[#555] hover:bg-black/[0.04]"
      >
        {sortLabel}
      </button>
    </div>
  );
}
