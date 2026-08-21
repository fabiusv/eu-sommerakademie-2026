// Shared across home, not-found, auth, and events call sites — same arrow-right glyph
// used everywhere a link/button ends in a directional cue. `size`/`strokeWidth` default
// to the most common call site (16px / 1.4) so most usages only need the className, if
// anything.
export function ArrowRightIcon({
  size = 16,
  strokeWidth = 1.4,
  className,
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
