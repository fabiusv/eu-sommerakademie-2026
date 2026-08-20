"use client";

import { useState } from "react";
import FilterPopover from "./FilterPopover";
import { GridIcon, MapPinIcon } from "./icons";
import { SORT_OPTIONS, type SortId } from "@/lib/events-data";

export default function EventsResultsHeader({
  count,
  sort,
  setSort,
}: {
  count: number;
  sort: SortId;
  setSort: (sort: SortId) => void;
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortLabel = SORT_OPTIONS.find((option) => option.id === sort)?.label ?? "Recommended";

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-[14.5px] font-medium text-ink-secondary lg:text-[15px]">
        <span className="font-semibold text-ink">{count}</span> {count === 1 ? "event" : "events"}
      </p>

      <div className="hidden items-center gap-3 lg:flex">
        <div
          role="group"
          aria-label="Layout"
          className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-page-secondary px-3.5 py-2 text-[13px] font-medium text-ink">
            <GridIcon />
            Grid
          </span>
          <span
            aria-disabled
            title="Map view is coming soon"
            className="flex cursor-not-allowed items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium text-ink-muted/70"
          >
            <MapPinIcon />
            Map
          </span>
        </div>

        <FilterPopover
          label={`Sort: ${sortLabel}`}
          options={SORT_OPTIONS}
          value={sort}
          onChange={setSort}
          open={sortOpen}
          onOpenChange={setSortOpen}
          align="right"
        />
      </div>
    </div>
  );
}
