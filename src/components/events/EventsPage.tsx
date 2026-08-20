"use client";

import { useState } from "react";
import Container from "@/components/home/Container";
import { useHeroIntro } from "@/components/home/HeroIntroProvider";
import EventSearch from "./EventSearch";
import EventFilterBar from "./EventFilterBar";
import ActiveFilters from "./ActiveFilters";
import EventsResultsHeader from "./EventsResultsHeader";
import EventCard from "./EventCard";
import FeaturedEventCard from "./FeaturedEventCard";
import EmptyState from "./EmptyState";
import MobileFilters from "./MobileFilters";
import { useEventFilters } from "./useEventFilters";

export default function EventsPage() {
  const { headlineVisible, copyVisible, ctaVisible } = useHeroIntro();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
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
    loadMore,
    fading,
    activeChips,
    removeChip,
    savedIds,
    toggleSaved,
  } = useEventFilters();

  const isEmpty = totalCount === 0;

  return (
    <>
      <section id="hero" className="bg-page pt-10 pb-8 lg:pt-16 lg:pb-10">
        <Container>
          <p
            className={`hero-intro-fade text-[13px] font-semibold tracking-[0.08em] text-eu-blue uppercase ${
              headlineVisible ? "hero-intro-fade-visible" : ""
            }`}
          >
            Events across Europe
          </p>
          <h1
            style={{ transitionDelay: "40ms" }}
            className={`hero-intro-fade mt-4 max-w-2xl text-[34px] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[42px] lg:text-[clamp(48px,calc(1.43vw_+_31px),64px)] ${
              headlineVisible ? "hero-intro-fade-visible" : ""
            }`}
          >
            Find something worth showing up for.
          </h1>
          <p
            className={`hero-intro-fade mt-5 max-w-[540px] text-[16px] leading-relaxed text-ink-secondary lg:text-[clamp(17px,calc(0.18vw_+_14.4px),19px)] ${
              copyVisible ? "hero-intro-fade-visible" : ""
            }`}
          >
            Meetups, workshops, civic initiatives, volunteering, and cultural gatherings — find
            what&rsquo;s happening near you or across the continent.
          </p>

          <div className={`hero-intro-fade mt-8 lg:mt-10 ${ctaVisible ? "hero-intro-fade-visible" : ""}`}>
            <EventSearch value={query} onChange={setQuery} />
          </div>
        </Container>
      </section>

      <section className="bg-page pb-24 lg:pb-32">
        <Container>
          <div
            className={`hero-intro-fade flex flex-col gap-4 ${ctaVisible ? "hero-intro-fade-visible" : ""}`}
            style={{ transitionDelay: "80ms" }}
          >
            <EventFilterBar
              filters={filters}
              setFilter={setFilter}
              sort={sort}
              setSort={setSort}
              onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            />
            <ActiveFilters chips={activeChips} onRemove={removeChip} onClearAll={clearFilters} />
          </div>

          <div
            className={`hero-intro-fade ${ctaVisible ? "hero-intro-fade-visible" : ""}`}
            style={{ transitionDelay: "160ms" }}
          >
            <div className="mt-8 border-t border-line pt-6 lg:mt-10 lg:pt-8">
              <EventsResultsHeader count={totalCount} sort={sort} setSort={setSort} />
            </div>

            {isEmpty ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <div
                className={`mt-8 transition-all duration-300 ease-out lg:mt-10 ${
                  fading ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
                }`}
              >
                {featuredEvent && (
                  <div className="mb-6 lg:mb-8">
                    <FeaturedEventCard event={featuredEvent} />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[clamp(24px,calc(0.71vw_+_13.7px),32px)]">
                  {visibleEvents.map((event, i) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={i}
                      saved={savedIds.has(event.id)}
                      onToggleSave={toggleSaved}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 flex justify-center lg:mt-14">
                    <button
                      type="button"
                      onClick={loadMore}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-7 py-3.5 text-[14px] font-medium text-ink transition-all hover:border-eu-blue/40 hover:text-eu-blue"
                    >
                      Load more events
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      <MobileFilters
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        resultCount={totalCount}
      />
    </>
  );
}
