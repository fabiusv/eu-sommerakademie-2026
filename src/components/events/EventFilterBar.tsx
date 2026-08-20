"use client";

import { useState } from "react";
import FilterPopover from "./FilterPopover";
import MoreFiltersDrawer from "./MoreFiltersDrawer";
import { FiltersIcon } from "./icons";
import {
  WHEN_OPTIONS,
  WHERE_OPTIONS,
  CATEGORY_OPTIONS,
  FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  SORT_OPTIONS,
  DEFAULT_FILTERS,
  type EventFilters,
  type SortId,
} from "@/lib/events-data";

type PrimaryKey = "when" | "where" | "category" | "format" | "language" | "sort" | null;

export default function EventFilterBar({
  filters,
  setFilter,
  sort,
  setSort,
  onOpenMobileFilters,
}: {
  filters: EventFilters;
  setFilter: <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => void;
  sort: SortId;
  setSort: (sort: SortId) => void;
  onOpenMobileFilters: () => void;
}) {
  const [openKey, setOpenKey] = useState<PrimaryKey>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const moreCount = [filters.free, filters.accessible, filters.online].filter(Boolean).length;
  const anyPrimaryActive =
    filters.when !== DEFAULT_FILTERS.when ||
    filters.where !== DEFAULT_FILTERS.where ||
    filters.category !== DEFAULT_FILTERS.category ||
    filters.format !== DEFAULT_FILTERS.format ||
    filters.language !== DEFAULT_FILTERS.language;

  return (
    <>
      <div className="hidden flex-wrap items-center gap-2.5 lg:flex">
        <FilterPopover
          label="When"
          options={WHEN_OPTIONS}
          value={filters.when}
          onChange={(v) => setFilter("when", v)}
          open={openKey === "when"}
          onOpenChange={(o) => setOpenKey(o ? "when" : null)}
          active={filters.when !== DEFAULT_FILTERS.when}
        />
        <FilterPopover
          label="Where"
          options={WHERE_OPTIONS}
          value={filters.where}
          onChange={(v) => setFilter("where", v)}
          open={openKey === "where"}
          onOpenChange={(o) => setOpenKey(o ? "where" : null)}
          active={filters.where !== DEFAULT_FILTERS.where}
        />
        <FilterPopover
          label="Category"
          options={CATEGORY_OPTIONS}
          value={filters.category}
          onChange={(v) => setFilter("category", v)}
          open={openKey === "category"}
          onOpenChange={(o) => setOpenKey(o ? "category" : null)}
          active={filters.category !== DEFAULT_FILTERS.category}
        />
        <FilterPopover
          label="Format"
          options={FORMAT_OPTIONS}
          value={filters.format}
          onChange={(v) => setFilter("format", v)}
          open={openKey === "format"}
          onOpenChange={(o) => setOpenKey(o ? "format" : null)}
          active={filters.format !== DEFAULT_FILTERS.format}
        />
        <FilterPopover
          label="Language"
          options={LANGUAGE_OPTIONS}
          value={filters.language}
          onChange={(v) => setFilter("language", v)}
          open={openKey === "language"}
          onOpenChange={(o) => setOpenKey(o ? "language" : null)}
          active={filters.language !== DEFAULT_FILTERS.language}
        />

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-medium transition-colors ${
            moreCount > 0
              ? "border-eu-blue/30 bg-eu-blue/[0.06] text-eu-blue"
              : "border-line bg-surface text-ink-secondary hover:border-eu-blue/30 hover:text-eu-blue"
          }`}
        >
          More filters
          {moreCount > 0 && (
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-eu-blue text-[10px] font-semibold text-white">
              {moreCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2.5 lg:hidden">
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-3 text-[14px] font-medium transition-colors ${
            anyPrimaryActive || moreCount > 0
              ? "border-eu-blue/30 bg-eu-blue/[0.06] text-eu-blue"
              : "border-line bg-surface text-ink-secondary"
          }`}
        >
          <FiltersIcon />
          Filters
          {(anyPrimaryActive || moreCount > 0) && (
            <span className="size-1.5 rounded-full bg-eu-yellow" />
          )}
        </button>

        <FilterPopover
          label="Sort"
          options={SORT_OPTIONS}
          value={sort}
          onChange={setSort}
          open={openKey === "sort"}
          onOpenChange={(o) => setOpenKey(o ? "sort" : null)}
          align="right"
        />
      </div>

      <MoreFiltersDrawer open={moreOpen} onClose={() => setMoreOpen(false)} filters={filters} setFilter={setFilter} />
    </>
  );
}
