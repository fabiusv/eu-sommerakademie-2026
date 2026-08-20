"use client";

import { useEffect, useId, useRef } from "react";
import { ChevronDownIcon, CheckIcon } from "./icons";

export type PopoverOption<T extends string> = { id: T; label: string; disabled?: boolean };

export default function FilterPopover<T extends string>({
  label,
  options,
  value,
  onChange,
  open,
  onOpenChange,
  active = false,
  align = "left",
}: {
  label: string;
  options: PopoverOption<T>[];
  value: T;
  onChange: (id: T) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active?: boolean;
  align?: "left" | "right" | "center";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  const alignClass =
    align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  const selectedLabel = options.find((option) => option.id === value)?.label ?? label;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-medium transition-colors ${
          active
            ? "border-eu-blue/30 bg-eu-blue/[0.06] text-eu-blue"
            : "border-line bg-surface text-ink-secondary hover:border-eu-blue/30 hover:text-eu-blue"
        }`}
      >
        {active ? selectedLabel : label}
        <ChevronDownIcon className={`size-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={label}
          className={`absolute top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-card-hover ${alignClass}`}
        >
          {options.map((option) => {
            const selected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                disabled={option.disabled}
                aria-pressed={selected}
                onClick={() => {
                  onChange(option.id);
                  onOpenChange(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-[14px] transition-colors ${
                  option.disabled
                    ? "cursor-not-allowed text-ink-muted/60"
                    : selected
                      ? "bg-page-secondary font-medium text-eu-blue"
                      : "text-ink-secondary hover:bg-page-secondary hover:text-ink"
                }`}
              >
                <span>
                  {option.label}
                  {option.disabled && <span className="ml-2 text-[11px] text-ink-muted">Soon</span>}
                </span>
                {selected && !option.disabled && <CheckIcon className="size-3.5 shrink-0 text-eu-blue" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
