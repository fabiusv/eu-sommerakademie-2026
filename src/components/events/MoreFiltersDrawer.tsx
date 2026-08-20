"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClearIcon } from "./icons";
import Switch from "./Switch";
import type { EventFilters } from "@/lib/events-data";

// Mirrors FullScreenMenu's mount/exit-timeout pattern (see components/home/FullScreenMenu)
// at a much smaller scale — no focus trap, just a slide-in panel that needs to survive its
// own close animation before unmounting.
const EXIT_DURATION = 260;

export default function MoreFiltersDrawer({
  open,
  onClose,
  filters,
  setFilter,
}: {
  open: boolean;
  onClose: () => void;
  filters: EventFilters;
  setFilter: <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => void;
}) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setRendered(true);
    else setVisible(false);
  }

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

  useEffect(() => {
    if (!rendered) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [rendered]);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!rendered) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [rendered, onClose]);

  if (!rendered || typeof document === "undefined") return null;

  const activeCount = [filters.free, filters.accessible, filters.online].filter(Boolean).length;

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div
        onClick={onClose}
        aria-hidden
        className={`absolute inset-0 bg-ink/25 backdrop-blur-[2px] transition-opacity duration-[260ms] ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="More filters"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[380px] flex-col bg-surface p-7 shadow-card-hover transition-transform duration-[300ms] ease-out sm:p-8 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-semibold text-ink">More filters</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close more filters"
            className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-page-secondary hover:text-ink"
          >
            <ClearIcon className="size-4" />
          </button>
        </div>

        <div className="mt-7 flex flex-col divide-y divide-line border-y border-line">
          <Switch checked={filters.free} onChange={(v) => setFilter("free", v)} label="Free events only" />
          <Switch checked={filters.accessible} onChange={(v) => setFilter("accessible", v)} label="Wheelchair accessible" />
          <Switch checked={filters.online} onChange={(v) => setFilter("online", v)} label="Online only" />
        </div>

        <button
          type="button"
          onClick={() => {
            setFilter("free", false);
            setFilter("accessible", false);
            setFilter("online", false);
          }}
          disabled={activeCount === 0}
          className="mt-6 self-start text-[14px] font-medium text-ink-muted transition-colors hover:text-eu-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-eu-blue px-6 py-3.5 text-[14.5px] font-medium text-white transition-all hover:brightness-110"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
