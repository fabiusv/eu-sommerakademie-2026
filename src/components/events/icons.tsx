import type { EventCategory } from "@/lib/events-data";

export function SearchIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 11 14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ClearIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "size-2" }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" fill="none" aria-hidden className={className}>
      <path d="M1 2.5 4 5.5 7 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className = "size-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FiltersIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="5.5" cy="4.5" r="1.4" fill="var(--color-page)" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="10.5" cy="8" r="1.4" fill="var(--color-page)" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6.5" cy="11.5" r="1.4" fill="var(--color-page)" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function BookmarkIcon({ className = "size-4", filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"} aria-hidden className={className}>
      <path
        d="M4 2.75h8a.75.75 0 0 1 .75.75v10.2a.4.4 0 0 1-.63.33L8 11.2l-4.12 2.83a.4.4 0 0 1-.63-.33V3.5a.75.75 0 0 1 .75-.75Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GridIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function MapPinIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M8 14.5s5-4.2 5-8.2A5 5 0 0 0 3 6.3c0 4 5 8.2 5 8.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.3" r="1.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

// One quiet line-art glyph per category, used oversized/low-opacity as card watermarks —
// same treatment PulseMark gets on the homepage's event cards, kept simple and geometric
// rather than illustrative so it stays legible at any scale.
export function CategoryIcon({ category, className = "size-full" }: { category: EventCategory; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (category) {
    case "Climate":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
          <path {...common} d="M32 8c10 8 16 18 16 28a16 16 0 1 1-32 0c0-10 6-20 16-28Z" />
        </svg>
      );
    case "Democracy":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
          <rect x="14" y="14" width="36" height="36" rx="4" {...common} />
          <path {...common} d="M22 32l7 7 13-15" />
        </svg>
      );
    case "Civic Tech":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
          <circle cx="18" cy="20" r="6" {...common} />
          <circle cx="46" cy="20" r="6" {...common} />
          <circle cx="32" cy="46" r="6" {...common} />
          <path {...common} d="M23 22.5 41 22.5M21 25.5 29.5 41M43 25.5 34.5 41" />
        </svg>
      );
    case "Culture":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
          <path {...common} d="M12 26 32 12l20 14" />
          <path {...common} d="M16 26v22h32V26" />
          <path {...common} d="M26 48V34h12v14" />
        </svg>
      );
    case "Community":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
          <circle cx="24" cy="30" r="12" {...common} />
          <circle cx="40" cy="30" r="12" {...common} />
        </svg>
      );
    case "Education":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
          <path {...common} d="M8 24 32 14l24 10-24 10Z" />
          <path {...common} d="M20 30v12c0 3 6 6 12 6s12-3 12-6V30" />
        </svg>
      );
    case "Volunteering":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
          <path
            {...common}
            d="M32 46S12 34 12 21a10 10 0 0 1 20-2 10 10 0 0 1 20 2c0 13-20 25-20 25Z"
          />
        </svg>
      );
    case "Human Rights":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className={className}>
          <path {...common} d="M32 10 52 18v14c0 12-8 20-20 22-12-2-20-10-20-22V18Z" />
          <path {...common} d="M24 32l6 6 12-13" />
        </svg>
      );
    default:
      return null;
  }
}
