"use client";

import { ClearIcon } from "./icons";
import type { EventFilters } from "@/lib/events-data";
import type { ActiveChip } from "./useEventFilters";

export default function ActiveFilters({
  chips,
  onRemove,
  onClearAll,
}: {
  chips: ActiveChip[];
  onRemove: (key: keyof EventFilters) => void;
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="group flex items-center gap-1.5 rounded-full bg-page-secondary py-1.5 pl-3.5 pr-2.5 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-eu-blue/[0.08] hover:text-eu-blue"
        >
          {chip.label}
          <span className="flex size-4 items-center justify-center rounded-full text-ink-muted transition-colors group-hover:text-eu-blue">
            <ClearIcon className="size-2.5" />
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-[13px] font-medium text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-eu-blue"
      >
        Clear all
      </button>
    </div>
  );
}
