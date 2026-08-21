"use client";

import type { EventItem } from "@/lib/events-data";
import { formatEventDate } from "@/lib/events-data";
import EventArt from "./EventArt";
import { ArrowIcon, BookmarkIcon } from "./icons";

export default function EventCard({
  event,
  index,
  saved,
  onToggleSave,
}: {
  event: EventItem;
  index: number;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  return (
    // The card is fully clickable (the <a> below) with an independent Save button
    // layered on top — nesting a <button> inside that <a> would be invalid HTML
    // (interactive content inside interactive content) and unreliable for assistive
    // tech, so the link uses `contents` to stay transparent to layout while the
    // button becomes a real sibling, both positioned by this wrapper.
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover">
      <a href="#" className="contents">
        <div className="relative aspect-[4/3] overflow-hidden">
          <EventArt category={event.category} index={index} className="absolute inset-0" />
        </div>

        <div className="flex flex-1 flex-col p-5 lg:p-[clamp(20px,calc(0.36vw_+_14.9px),24px)]">
          <p className="text-[12.5px] font-medium tracking-[0.01em] text-eu-blue">
            {formatEventDate(event.date)} · {event.city}
          </p>
          <h3 className="mt-2 text-[18px] font-semibold leading-[1.3] text-ink transition-transform duration-300 ease-out group-hover:translate-x-0.5 lg:text-[19px]">
            {event.title}
          </h3>

          <div className="mt-auto flex items-center justify-between pt-5">
            <p className="text-[13px] text-ink-muted">
              {event.category} · {event.language}
            </p>
            <ArrowIcon className="size-3.5 shrink-0 text-ink-muted opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0.5 group-hover:text-eu-blue group-hover:opacity-100" />
          </div>
        </div>
      </a>

      <button
        type="button"
        onClick={() => onToggleSave(event.id)}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved events" : "Save event"}
        className={`absolute right-3.5 top-3.5 flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
          saved ? "bg-eu-yellow text-ink" : "bg-white/15 text-white hover:bg-white/25"
        }`}
      >
        <BookmarkIcon className="size-3.5" filled={saved} />
      </button>
    </div>
  );
}
