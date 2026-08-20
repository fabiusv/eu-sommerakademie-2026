"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { createPortal } from "react-dom";

const NAV_ITEMS = ["Events", "Communities", "Opportunities", "Map", "Initiatives"];

// Exit duration must match the CSS transition below — it's how long we keep the panel
// mounted after `open` flips false so the close animation can finish before unmount.
const EXIT_DURATION = 380;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function FullScreenMenu({
  open,
  onClose,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  // Tracks the `open` value as of the last render so the block below can tell an actual
  // transition apart from a re-render, and adjust state during render instead of in an
  // effect — see https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-when-a-prop-changes.
  const [prevOpen, setPrevOpen] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setRendered(true);
    } else {
      setVisible(false);
    }
  }

  // Mount happens synchronously above; the entrance transition still needs a real frame
  // boundary (browser must commit the closed state before we flip to open, or it'll just
  // snap), and unmount-after-exit needs a real timer — both stay in effects.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (open || !rendered) return;
    const timeout = window.setTimeout(() => setRendered(false), EXIT_DURATION);
    return () => window.clearTimeout(timeout);
  }, [open, rendered]);

  // Body scroll lock that preserves scroll position, kept for the full mounted lifetime
  // (open + closing animation) so the page never moves while the panel is still visible.
  useEffect(() => {
    if (!rendered) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [rendered]);

  // Focus trap + Escape-to-close, and restore focus to the trigger button on close.
  // Focus lands on the panel itself, not the search input — autofocusing a
  // type="search" field would pop the mobile keyboard the instant the menu opens.
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      panelRef.current?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open, triggerRef]);

  useEffect(() => {
    if (!rendered) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      const trigger = triggerRef.current;
      if (!panel) return;

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      // The visible close control is the real header's burger/× button, elevated above
      // this panel rather than duplicated inside it — fold it into the trap as the loop's
      // pivot so Tab/Shift+Tab still cycles through every visible control: trigger → first
      // → … → last → trigger.
      if (event.shiftKey) {
        // `active === panel` covers the very first Shift+Tab right after open, when focus
        // still sits on the panel container itself rather than on `first`.
        if ((active === first || active === panel) && trigger) {
          event.preventDefault();
          trigger.focus();
        } else if (active === trigger) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last && trigger) {
        event.preventDefault();
        trigger.focus();
      } else if (active === trigger) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [rendered, onClose, triggerRef]);

  if (!rendered) return null;

  const revealStyle = reducedMotion
    ? undefined
    : {
        clipPath: visible
          ? "circle(150% at calc(100% - 2.25rem) 2.25rem)"
          : "circle(0% at calc(100% - 2.25rem) 2.25rem)",
        transition: "clip-path 560ms cubic-bezier(0.16, 1, 0.3, 1)",
      };

  const contentStep = (index: number, baseDelay: number, step = 55) =>
    reducedMotion
      ? undefined
      : {
          transitionDelay: `${baseDelay + index * step}ms`,
        };

  const enterClass = reducedMotion
    ? "opacity-100"
    : `transition-all duration-[420ms] ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`;

  return createPortal(
    // z-[70]: sits above the bottom floating dock (z-40) and all page content, but below
    // the sticky header (elevated to z-[80] while open) so the wordmark + close control
    // painted by Header stay on top and read as this panel's own top area.
    <div
      className={`fixed inset-0 z-[70] bg-page ${reducedMotion ? "transition-opacity duration-150" : ""} ${
        reducedMotion ? (visible ? "opacity-100" : "opacity-0") : ""
      }`}
      style={revealStyle}
    >
      <div
        ref={panelRef}
        id="mobile-full-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        tabIndex={-1}
        className="flex h-full w-full flex-col overflow-y-auto pt-[64px] pb-[max(1.75rem,env(safe-area-inset-bottom))] outline-none"
      >
        <div className="flex flex-1 flex-col justify-between px-6 pt-8 sm:px-10">
          <div>
            <div className={enterClass} style={contentStep(0, 60)}>
              <label className="group flex items-center gap-3 rounded-2xl bg-page-secondary px-5 py-4 transition-colors focus-within:ring-1 focus-within:ring-eu-blue">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                  className="shrink-0 text-ink-muted transition-colors group-focus-within:text-eu-blue"
                >
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M11 11 14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  aria-label="Search"
                  placeholder="Search events, communities, and opportunities"
                  className="w-full cursor-text appearance-none bg-transparent text-[15px] leading-none text-ink placeholder:text-ink-muted outline-none"
                />
              </label>
            </div>

            <nav aria-label="Primary" className="mt-10">
              <ul>
                {NAV_ITEMS.map((label, index) => (
                  <li
                    key={label}
                    className={`border-b border-line first:border-t ${enterClass}`}
                    style={contentStep(index, 160)}
                  >
                    <a
                      href="#"
                      onClick={onClose}
                      className="group flex items-baseline gap-4 py-4 [@media(hover:hover)]:hover:translate-x-1.5 active:translate-x-0.5 transition-transform duration-200"
                    >
                      <span className="text-[13px] font-semibold tabular-nums text-eu-blue/60 transition-colors [@media(hover:hover)]:group-hover:text-eu-blue">
                        0{index + 1}
                      </span>
                      <span className="text-[clamp(1.75rem,8vw,2.5rem)] font-semibold leading-[1.15] tracking-tight text-ink transition-colors [@media(hover:hover)]:group-hover:text-eu-blue">
                        {label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-12 flex flex-col items-center gap-8 pb-2">
            <div className={enterClass} style={contentStep(0, 480)}>
              <a
                href="#"
                onClick={onClose}
                className="inline-flex items-center gap-2.5 rounded-full bg-eu-blue px-8 py-4 text-[16px] font-semibold text-white shadow-card-hover transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-eu-yellow" />
                Join Europe
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            <div
              className={`flex w-full items-center justify-between ${enterClass}`}
              style={contentStep(0, 540)}
            >
              <a
                href="#"
                onClick={onClose}
                className="text-[14px] font-medium text-ink-secondary transition-colors [@media(hover:hover)]:hover:text-eu-blue"
              >
                Sign in
              </a>
              <button
                type="button"
                className="flex items-center gap-1 text-[13px] font-medium text-ink-secondary transition-colors [@media(hover:hover)]:hover:text-eu-blue"
              >
                EN
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                  <path d="M1 2.5 4 5.5 7 2.5" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
