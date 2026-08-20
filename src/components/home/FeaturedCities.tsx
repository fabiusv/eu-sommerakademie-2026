import Container from "./Container";
import Reveal from "./Reveal";
import SectionEyebrow from "./SectionEyebrow";
import { cities } from "@/lib/home-data";

export default function FeaturedCities() {
  return (
    <section className="bg-page py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionEyebrow index="01" label="Featured cities" />

          <div className="mt-8 flex flex-col gap-6 lg:mt-10 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-[420px] text-[28px] font-semibold leading-[1.2] text-ink lg:text-[38px]">
              Where Democratic Pulse is most active right now.
            </h2>
            <a
              href="#"
              className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-ink-muted transition-colors hover:text-eu-blue"
            >
              View all cities
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

          <div className="mt-10 grid grid-cols-1 border-b border-line sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {cities.map((city) => (
              <div
                key={city.name}
                className="flex items-baseline gap-3 border-t border-line py-5 pr-6 lg:py-6"
              >
                <span className="text-[13px] font-semibold text-eu-blue">{city.rank}</span>
                <span className="flex-1">
                  <span className="block text-[19px] font-semibold text-ink lg:text-[21px]">
                    {city.name}
                  </span>
                  <span className="block text-[13px] text-ink-muted">{city.country}</span>
                </span>
                <span className="text-[13px] font-medium text-ink-secondary">
                  {city.eventCount} events
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
