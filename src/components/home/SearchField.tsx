"use client";

export function SearchGlyph({ className = "size-[15px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 11 14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ClearGlyph({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// The one shared Search interaction system for the site: nav bar, mobile full-screen
// menu, and the /events page search all render through this component. Only geometry
// (padding, rounding, text size, icon size) varies per call site via the className
// props — the focus/border/outline treatment is intentionally NOT parameterized, so
// every instance stays in sync automatically instead of drifting into its own variant.
export default function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  clearable = false,
  containerClassName,
  iconClassName = "size-[15px]",
  inputClassName = "",
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  ariaLabel?: string;
  clearable?: boolean;
  containerClassName: string;
  iconClassName?: string;
  inputClassName?: string;
}) {
  return (
    <label
      className={`group flex w-full items-center border border-transparent bg-page-secondary transition-colors duration-200 focus-within:border-eu-blue/60 ${containerClassName}`}
    >
      <SearchGlyph
        className={`shrink-0 text-ink-muted transition-colors group-focus-within:text-eu-blue ${iconClassName}`}
      />
      <input
        type="search"
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        className={`search-field-input w-full cursor-text appearance-none bg-transparent leading-none text-ink outline-none placeholder:text-ink-muted ${inputClassName}`}
      />
      {clearable && value && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          aria-label="Clear search"
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-eu-blue"
        >
          <ClearGlyph />
        </button>
      )}
    </label>
  );
}
