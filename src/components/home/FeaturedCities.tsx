import Container from "./Container";
import Reveal from "./Reveal";
import SectionEyebrow from "./SectionEyebrow";
import CityLandmark from "./CityLandmark";
import { cities } from "@/lib/home-data";

const arrow = (
  <path
    d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

export default function FeaturedCities() {
  const [featured, ...rest] = cities;

  return (
    <section className="bg-page py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionEyebrow index="01" label="Featured cities" />

          <div className="mt-8 flex flex-col gap-6 lg:mt-10 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-[420px] text-[28px] font-semibold leading-[1.2] text-ink lg:text-[clamp(38px,calc(0.71vw_+_27.7px),46px)]">
              Where Democratic Pulse is most active right now.
            </h2>
            <a
              href="#"
              className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-ink-muted transition-colors hover:text-eu-blue"
            >
              View all cities
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                {arrow}
              </svg>
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:mt-14 lg:grid-cols-12 lg:items-stretch lg:gap-[clamp(24px,calc(0.71vw_+_13.7px),32px)]">
            {/* Featured city — the one immersive, always-visible tile the rest of the
                section plays against. */}
            <a
              href="#"
              className="group relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#00194f] to-eu-blue p-8 lg:col-span-5 lg:min-h-0 lg:p-[clamp(40px,calc(1.43vw_+_19.4px),56px)]"
            >
              <CityLandmark
                city={featured.name}
                className="absolute inset-x-0 bottom-0 h-[62%] w-full text-white/15 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:text-white/20"
              />
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/15 to-transparent" />

              <div className="relative flex items-center justify-between">
                <span className="text-[13px] font-semibold text-white/60">{featured.rank}</span>
                <span className="rounded-full border border-white/25 px-3 py-1 text-[11px] font-medium tracking-[0.03em] text-white/80 uppercase backdrop-blur-sm">
                  Featured city
                </span>
              </div>

              <div className="relative">
                <h3 className="text-[46px] font-semibold leading-[0.95] text-white lg:text-[clamp(60px,calc(1.43vw_+_39.4px),76px)]">
                  {featured.name}
                </h3>
                <p className="mt-3 text-[15px] text-white/65">{featured.country}</p>

                <div className="mt-7 flex items-center justify-between border-t border-white/15 pt-5">
                  <span className="text-[14px] font-medium text-white/85">
                    {featured.eventCount} events
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-eu-yellow text-ink transition-transform duration-500 ease-out group-hover:rotate-45">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      {arrow}
                    </svg>
                  </span>
                </div>
              </div>
            </a>

            {/* Supporting cities — clean typography by default; each row reveals its own
                landmark mark on hover instead of showing eight identical image cards. A
                single shared duration/easing across every child keeps the reveal, text
                color, and arrow moving in sync rather than arriving at slightly different
                moments, which is what made the earlier version feel abrupt. */}
            <div className="flex flex-col overflow-hidden rounded-3xl border border-line lg:col-span-7">
              {rest.map((city) => (
                <a
                  key={city.name}
                  href="#"
                  className="group relative flex items-center gap-4 border-t border-line px-3 py-5 transition-colors duration-150 first:border-t-0 active:bg-page-secondary sm:gap-6 sm:px-4 lg:py-[clamp(24px,calc(0.71vw_+_13.7px),32px)]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-1.5 scale-[0.985] overflow-hidden rounded-2xl bg-gradient-to-l from-[#00194f] to-eu-blue opacity-0 transition-all duration-500 ease-out [@media(hover:hover)]:group-hover:scale-100 [@media(hover:hover)]:group-hover:opacity-100"
                  >
                    <CityLandmark city={city.name} className="absolute inset-y-0 right-0 h-full w-full text-white/20" />
                  </span>

                  <span className="relative w-7 shrink-0 text-[13px] font-semibold text-eu-blue/70 transition-colors duration-500 ease-out [@media(hover:hover)]:group-hover:text-eu-yellow">
                    {city.rank}
                  </span>

                  <span className="relative flex-1 py-1 transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:translate-x-1">
                    <span className="block text-[24px] font-semibold leading-tight text-ink transition-colors duration-500 ease-out [@media(hover:hover)]:group-hover:text-white sm:text-[28px] lg:text-[clamp(28px,calc(0.54vw_+_20.3px),34px)]">
                      {city.name}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-ink-muted transition-colors duration-500 ease-out [@media(hover:hover)]:group-hover:text-white/65">
                      {city.country}
                    </span>
                  </span>

                  <span className="relative flex shrink-0 items-center gap-3">
                    <span className="text-[13px] font-medium text-ink-secondary transition-colors duration-500 ease-out [@media(hover:hover)]:group-hover:text-white">
                      {city.eventCount} events
                    </span>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted opacity-0 transition-all duration-500 ease-out [@media(hover:hover)]:group-hover:border-white/30 [@media(hover:hover)]:group-hover:text-white [@media(hover:hover)]:group-hover:opacity-100">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                        {arrow}
                      </svg>
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
