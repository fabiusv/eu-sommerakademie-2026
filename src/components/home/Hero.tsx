"use client";

import Container from "./Container";
import { useHeroIntro } from "./HeroIntroProvider";

const heroGradient =
  "linear-gradient(97deg, var(--color-eu-blue) 0%, var(--color-eu-blue) 35%, var(--color-eu-gold) 100%)";

export default function Hero() {
  const { headlineVisible, copyVisible, ctaVisible, gradientActive } = useHeroIntro();

  return (
    <section id="hero" className="bg-page pt-14 pb-16 lg:pt-20 lg:pb-[90px]">
      <Container>
        <div className="mx-auto flex flex-col items-center text-center">
          <h1 className="text-[42px] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[58px] md:text-[74px] lg:text-[92px] xl:text-[108px]">
            <span
              className={`hero-intro-line ${headlineVisible ? "hero-intro-line-visible" : ""}`}
              style={{ transitionDelay: "0ms" }}
            >
              Delightful
            </span>
            <br />
            <span
              className={`hero-intro-line ${headlineVisible ? "hero-intro-line-visible" : ""}`}
              style={{ transitionDelay: "100ms" }}
            >
              events
            </span>
            <br />
            <span
              className={`hero-intro-line ${headlineVisible ? "hero-intro-line-visible" : ""}`}
              style={{ transitionDelay: "200ms" }}
            >
              <span
                className={`hero-shimmer bg-clip-text text-transparent ${
                  gradientActive ? "hero-shimmer-active" : ""
                }`}
              >
                start here
              </span>
            </span>
          </h1>

          <span
            aria-hidden="true"
            style={{ backgroundImage: heroGradient, transitionDelay: "0ms" }}
            className={`hero-intro-fade mt-6 h-[2px] w-16 rounded-full lg:mt-8 ${
              copyVisible ? "hero-intro-fade-visible" : ""
            }`}
          />

          <p
            style={{ transitionDelay: "60ms" }}
            className={`hero-intro-fade mt-6 max-w-[480px] text-[16px] font-light leading-[1.5] text-ink-secondary lg:mt-7 lg:max-w-[560px] lg:text-[19px] ${
              copyVisible ? "hero-intro-fade-visible" : ""
            }`}
          >
            Discover events, communities, and opportunities driving change across Europe.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:mt-10">
            <span
              style={{ transitionDelay: "0ms" }}
              className={`hero-intro-fade inline-block ${ctaVisible ? "hero-intro-fade-visible" : ""}`}
            >
              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-full bg-eu-blue px-8 py-4 text-[15px] font-medium text-white shadow-card transition-all hover:brightness-110 lg:px-10 lg:py-[18px] lg:text-[17px]"
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
            </span>

            <span
              style={{ transitionDelay: "80ms" }}
              className={`hero-intro-fade inline-block ${ctaVisible ? "hero-intro-fade-visible" : ""}`}
            >
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted transition-colors hover:text-accent lg:text-[15px]"
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
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
