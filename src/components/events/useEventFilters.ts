"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  events as allEvents,
  filterEvents,
  sortEvents,
  DEFAULT_FILTERS,
  CATEGORY_OPTIONS,
  FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  WHEN_OPTIONS,
  WHERE_OPTIONS,
  type EventFilters,
  type SortId,
} from "@/lib/events-data";

const PAGE_SIZE = 9;

export type ActiveChip = {
  key: keyof EventFilters;
  label: string;
};

function labelFor<T extends string>(options: { id: T; label: string }[], id: T) {
  return options.find((option) => option.id === id)?.label ?? String(id);
}

export function useEventFilters() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortId>("recommended");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const signature = JSON.stringify({ query, filters, sort });
  const prevSignature = useRef(signature);
  const [fading, setFading] = useState(false);

  // Reset pagination + play a brief fade whenever the query/filters/sort actually change —
  // "Load more" bumps visibleCount without touching this signature, so it's excluded.
  useEffect(() => {
    if (prevSignature.current === signature) return;
    prevSignature.current = signature;
    setVisibleCount(PAGE_SIZE);
    setFading(true);
    const timeout = window.setTimeout(() => setFading(false), 20);
    return () => window.clearTimeout(timeout);
  }, [signature]);

  const isDefaultFilters = useMemo(
    () => JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS),
    [filters]
  );

  const filteredSorted = useMemo(
    () => sortEvents(filterEvents(allEvents, filters, query), sort),
    [filters, query, sort]
  );

  const featuredEvent = useMemo(() => {
    if (query.trim() || !isDefaultFilters) return undefined;
    return allEvents.find((event) => event.featured);
  }, [query, isDefaultFilters]);

  const gridEvents = useMemo(
    () => filteredSorted.filter((event) => event.id !== featuredEvent?.id),
    [filteredSorted, featuredEvent]
  );

  const visibleEvents = gridEvents.slice(0, visibleCount);
  const hasMore = visibleCount < gridEvents.length;
  const totalCount = filteredSorted.length;

  function setFilter<K extends keyof EventFilters>(key: K, value: EventFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS);
    setQuery("");
  }

  function toggleSaved(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const activeChips: ActiveChip[] = useMemo(() => {
    const chips: ActiveChip[] = [];
    if (filters.when !== DEFAULT_FILTERS.when) {
      chips.push({ key: "when", label: labelFor(WHEN_OPTIONS, filters.when) });
    }
    if (filters.where !== DEFAULT_FILTERS.where) {
      chips.push({ key: "where", label: labelFor(WHERE_OPTIONS, filters.where) });
    }
    if (filters.category !== DEFAULT_FILTERS.category) {
      chips.push({ key: "category", label: labelFor(CATEGORY_OPTIONS, filters.category) });
    }
    if (filters.format !== DEFAULT_FILTERS.format) {
      chips.push({ key: "format", label: labelFor(FORMAT_OPTIONS, filters.format) });
    }
    if (filters.language !== DEFAULT_FILTERS.language) {
      chips.push({ key: "language", label: labelFor(LANGUAGE_OPTIONS, filters.language) });
    }
    if (filters.free) chips.push({ key: "free", label: "Free" });
    if (filters.accessible) chips.push({ key: "accessible", label: "Accessible" });
    if (filters.online) chips.push({ key: "online", label: "Online only" });
    return chips;
  }, [filters]);

  function removeChip(key: keyof EventFilters) {
    setFilters((prev) => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
  }

  return {
    query,
    setQuery,
    filters,
    setFilter,
    clearFilters,
    clearAll,
    sort,
    setSort,
    featuredEvent,
    visibleEvents,
    hasMore,
    totalCount,
    loadMore: () => setVisibleCount((count) => count + PAGE_SIZE),
    fading,
    activeChips,
    removeChip,
    hasActiveFilters: activeChips.length > 0,
    savedIds,
    toggleSaved,
  };
}

export type UseEventFilters = ReturnType<typeof useEventFilters>;
