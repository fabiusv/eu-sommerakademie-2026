import type { EventItem } from "@/lib/events-data";
import { formatEventDate } from "@/lib/events-data";
import EventArt from "./EventArt";
import { ArrowIcon, MapPinIcon } from "./icons";

export default function FeaturedEventCard({ event }: { event: EventItem }) {
  return (
    <a
      href="#"
      className="group relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-3xl shadow-card transition-all duration-300 ease-out hover:shadow-card-hover lg:min-h-[clamp(420px,calc(9vw_+_260px),520px)]"
    >
      <EventArt category={event.category} index={0} featured className="absolute inset-0" />

      <div className="relative flex items-start justify-between p-7 lg:p-9">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11.5px] font-semibold tracking-[0.05em] text-eu-yellow uppercase backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-eu-yellow" />
          Featured this week
        </span>
      </div>

      <div className="relative p-7 lg:p-9">
        <p className="text-[13px] font-medium text-white/70">{event.organizer}</p>
        <h3 className="mt-2 max-w-xl text-[30px] font-semibold leading-[1.15] text-white transition-transform duration-300 ease-out group-hover:translate-x-1 lg:text-[clamp(34px,calc(1.1vw_+_20px),44px)]">
          {event.title}
        </h3>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-t border-white/15 pt-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-medium text-white/85">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {event.city}
            </span>
            <span>{formatEventDate(event.date)}</span>
            <span className="hidden sm:inline">{event.category}</span>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-eu-yellow text-ink transition-transform duration-500 ease-out group-hover:translate-x-1">
            <ArrowIcon className="size-4" />
          </span>
        </div>
      </div>
    </a>
  );
}
