import Container from "./Container";
import Reveal from "./Reveal";
import SectionEyebrow from "./SectionEyebrow";
import PulseMark from "./PulseMark";
import { events } from "@/lib/home-data";

const glowPositions = ["85% 15%", "15% 85%", "90% 90%", "10% 15%", "80% 80%", "20% 20%"];

function eventGlow(index: number) {
  const pos = glowPositions[index % glowPositions.length];
  return `radial-gradient(140% 140% at ${pos}, color-mix(in srgb, var(--color-eu-gold) 60%, transparent) 0%, transparent 55%)`;
}

export default function UpcomingEvents() {
  return (
    <section className="bg-page py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionEyebrow index="02" label="Upcoming events" />
          <h2 className="mt-8 max-w-[520px] text-[28px] font-semibold leading-[1.2] text-ink lg:mt-10 lg:text-[38px]">
            Community-led events happening across Europe.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
            {events.map((event, i) => (
              <a
                key={event.title}
                href="#"
                className="group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden bg-eu-blue"
                  style={{ backgroundImage: eventGlow(i) }}
                >
                  <PulseMark className="absolute -right-7 -bottom-7 size-36 text-white/15 transition-transform duration-500 ease-out group-hover:scale-110" />
                  <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-black/20 to-transparent" />
                  <div className="relative flex items-start justify-between p-5">
                    <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                      {event.category}
                    </span>
                    <span className="text-[12px] font-semibold text-white/80">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 lg:p-7">
                  <h3 className="text-[19px] font-semibold leading-[1.3] text-ink lg:text-[21px]">
                    {event.title}
                  </h3>
                  <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[13px] font-medium text-ink-secondary">
                    <span>
                      {event.city} · {event.date}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-ink-muted transition-colors group-hover:text-eu-blue"
                      aria-hidden
                    >
                      <path
                        d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10 flex justify-center lg:mt-14">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted transition-colors hover:text-eu-blue"
            >
              View all events
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
