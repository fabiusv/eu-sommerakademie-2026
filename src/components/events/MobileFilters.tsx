"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClearIcon, ChevronDownIcon, CheckIcon } from "./icons";
import Switch from "./Switch";
import {
  WHEN_OPTIONS,
  WHERE_OPTIONS,
  CATEGORY_OPTIONS,
  FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  type EventFilters,
} from "@/lib/events-data";

// Same mount/exit-timeout pattern as MoreFiltersDrawer/FullScreenMenu, full-screen instead
// of a side panel — see components/home/FullScreenMenu for the original.
const EXIT_DURATION = 300;

type RowKey = "when" | "where" | "category" | "format" | "language" | null;

function AccordionRow<T extends string>({
  label,
  options,
  value,
  onChange,
  open,
  onToggle,
}: {
  label: string;
  options: { id: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (id: T) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const selectedLabel = options.find((option) => option.id === value)?.label ?? label;

  return (
    <div className="border-b border-line">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between py-4.5 text-left">
        <span>
          <span className="block text-[12px] font-medium tracking-[0.05em] text-ink-muted uppercase">{label}</span>
          <span className="mt-0.5 block text-[16.5px] font-medium text-ink">{selectedLabel}</span>
        </span>
        <ChevronDownIcon
          className={`size-2.5 shrink-0 text-ink-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-2 pb-5">
          {options.map((option) => {
            const selected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                disabled={option.disabled}
                onClick={() => onChange(option.id)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] transition-colors ${
                  option.disabled
                    ? "cursor-not-allowed border-line text-ink-muted/60"
                    : selected
                      ? "border-eu-blue/30 bg-eu-blue/[0.06] font-medium text-eu-blue"
                      : "border-line text-ink-secondary"
                }`}
              >
                <span className="truncate">
                  {option.label}
                  {option.disabled && <span className="ml-1.5 text-[11px] text-ink-muted">Soon</span>}
                </span>
                {selected && !option.disabled && <CheckIcon className="size-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MobileFilters({
  open,
  onClose,
  filters,
  setFilter,
  clearFilters,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: EventFilters;
  setFilter: <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => void;
  clearFilters: () => void;
  resultCount: number;
}) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [openRow, setOpenRow] = useState<RowKey>(null);
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

  function select<K extends keyof EventFilters>(key: K, value: EventFilters[K]) {
    setFilter(key, value);
    setOpenRow(null);
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter events"
      className={`fixed inset-0 z-[70] flex flex-col bg-page transition-transform duration-[300ms] ease-out lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8">
        <h2 className="text-[13px] font-semibold tracking-[0.08em] text-ink uppercase">Filter events</h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-page-secondary hover:text-ink"
        >
          <ClearIcon className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-8">
        <div className="mt-1">
          <AccordionRow
            label="When"
            options={WHEN_OPTIONS}
            value={filters.when}
            onChange={(v) => select("when", v)}
            open={openRow === "when"}
            onToggle={() => setOpenRow(openRow === "when" ? null : "when")}
          />
          <AccordionRow
            label="Where"
            options={WHERE_OPTIONS}
            value={filters.where}
            onChange={(v) => select("where", v)}
            open={openRow === "where"}
            onToggle={() => setOpenRow(openRow === "where" ? null : "where")}
          />
          <AccordionRow
            label="Category"
            options={CATEGORY_OPTIONS}
            value={filters.category}
            onChange={(v) => select("category", v)}
            open={openRow === "category"}
            onToggle={() => setOpenRow(openRow === "category" ? null : "category")}
          />
          <AccordionRow
            label="Format"
            options={FORMAT_OPTIONS}
            value={filters.format}
            onChange={(v) => select("format", v)}
            open={openRow === "format"}
            onToggle={() => setOpenRow(openRow === "format" ? null : "format")}
          />
          <AccordionRow
            label="Language"
            options={LANGUAGE_OPTIONS}
            value={filters.language}
            onChange={(v) => select("language", v)}
            open={openRow === "language"}
            onToggle={() => setOpenRow(openRow === "language" ? null : "language")}
          />
        </div>

        <div className="mt-2 flex flex-col divide-y divide-line">
          <Switch checked={filters.free} onChange={(v) => setFilter("free", v)} label="Free events only" />
          <Switch checked={filters.accessible} onChange={(v) => setFilter("accessible", v)} label="Wheelchair accessible" />
          <Switch checked={filters.online} onChange={(v) => setFilter("online", v)} label="Online only" />
        </div>
      </div>

      <div
        className="flex items-center gap-4 border-t border-line px-5 py-5 sm:px-8"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={clearFilters}
          className="shrink-0 text-[14px] font-medium text-ink-muted transition-colors hover:text-eu-blue"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-full bg-eu-blue px-6 py-3.5 text-[14.5px] font-medium text-white transition-all hover:brightness-110"
        >
          Show {resultCount} {resultCount === 1 ? "event" : "events"}
        </button>
      </div>
    </div>,
    document.body
  );
}
