"use client";

export default function ScrollToTopButton() {
  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="flex size-13 shrink-0 items-center justify-center rounded-full border border-line bg-surface/85 text-ink-secondary shadow-card-hover backdrop-blur-xl transition-colors hover:bg-surface-hover hover:text-eu-blue lg:size-14"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 13.5V2.5M3.5 7 8 2.5 12.5 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
