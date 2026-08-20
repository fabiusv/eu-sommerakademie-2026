import Container from "./Container";

export default function Hero() {
  return (
    <section className="bg-page pt-16 pb-14 lg:pt-[90px] lg:pb-[70px]">
      <Container>
        <div className="mx-auto flex flex-col items-center text-center">
          <p className="text-[13px] font-light tracking-[0.04em] text-ink-muted lg:text-[15px]">
            Democratic Pulse
          </p>

          <h1 className="mt-6 text-[42px] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[58px] md:text-[74px] lg:mt-8 lg:text-[92px] xl:text-[108px]">
            Delightful
            <br />
            events
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(97deg, var(--color-eu-blue) 0%, var(--color-eu-blue) 35%, var(--color-eu-gold) 100%)",
              }}
            >
              start here
            </span>
          </h1>

          <p className="mt-6 max-w-[480px] text-[16px] font-light leading-[1.5] text-ink-secondary lg:mt-8 lg:max-w-[560px] lg:text-[19px]">
            Discover events, communities, and opportunities driving change across Europe.
          </p>

          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-eu-blue px-8 py-4 text-[15px] font-medium text-white shadow-card transition-all hover:brightness-110 lg:mt-9 lg:px-10 lg:py-[18px] lg:text-[17px]"
          >
            Explore Opportunities
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <a
            href="#"
            className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted transition-colors hover:text-accent lg:mt-5 lg:text-[15px]"
          >
            <span className="border-b border-current/30 pb-0.5">Discover Events</span>
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
      </Container>
    </section>
  );
}
