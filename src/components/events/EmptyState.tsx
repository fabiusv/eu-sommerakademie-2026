import { SearchIcon } from "./icons";

export default function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 text-center lg:py-28">
      <span className="flex size-14 items-center justify-center rounded-full bg-page-secondary text-ink-muted">
        <SearchIcon className="size-5" />
      </span>
      <h3 className="mt-6 text-[20px] font-semibold text-ink lg:text-[22px]">Nothing here yet.</h3>
      <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-ink-secondary">
        Try widening your search or removing a filter.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-7 inline-flex items-center rounded-full bg-eu-blue px-7 py-3.5 text-[14px] font-medium text-white transition-all hover:brightness-110"
      >
        Clear filters
      </button>
    </div>
  );
}
