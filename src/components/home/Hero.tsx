"use client";

import Link from "next/link";
import Container from "./Container";
import { useHeroIntro } from "./HeroIntroProvider";

const heroGradient =
  "linear-gradient(97deg, var(--color-eu-blue) 0%, var(--color-eu-blue) 35%, var(--color-eu-gold) 100%)";

export default function Hero() {
  const { headlineVisible, copyVisible, ctaVisible, gradientActive } = useHeroIntro();

  return (
    <section
      id="hero"
      className="flex min-h-[100svh] items-center bg-page pt-14 pb-16 lg:min-h-[90dvh] lg:pt-0 lg:pb-0"
    >
      <Container>
        <div className="mx-auto flex flex-col items-center text-center">
          <h1 className="text-[42px] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[58px] md:text-[74px] lg:text-[92px] xl:text-[clamp(108px,calc(3.75vw_+_54px),150px)]">
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
            className={`hero-intro-fade mt-6 max-w-[480px] text-[16px] font-light leading-[1.5] text-ink-secondary lg:mt-7 lg:max-w-[clamp(560px,calc(7.14vw_+_457px),640px)] lg:text-[clamp(19px,calc(0.27vw_+_15.1px),22px)] ${
              copyVisible ? "hero-intro-fade-visible" : ""
            }`}
          >
            Discover events, communities, and opportunities driving change across Europe.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:mt-[clamp(40px,calc(1.43vw_+_19.4px),56px)]">
            <span
              style={{ transitionDelay: "0ms" }}
              className={`hero-intro-fade inline-block ${ctaVisible ? "hero-intro-fade-visible" : ""}`}
            >
              <Link
                href="/events"
                className="inline-flex items-center gap-2.5 rounded-full bg-eu-blue px-8 py-4 text-[15px] font-medium text-white shadow-card transition-all hover:brightness-110 lg:px-[clamp(40px,calc(0.54vw_+_32.3px),46px)] lg:py-[clamp(18px,calc(0.27vw_+_14.1px),21px)] lg:text-[clamp(17px,calc(0.18vw_+_14.4px),19px)]"
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
              </Link>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
