"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Container from "@/components/home/Container";
import { useHeroIntro } from "@/components/home/HeroIntroProvider";

// How far the "0" is allowed to drift from center, in px/deg, at the very edge of the
// section. Deliberately small — this is a signature detail, not a game.
const DRIFT_X = 16;
const DRIFT_Y = 11;
const DRIFT_ROTATE = 2.2;

export default function NotFoundHero() {
  const { headlineVisible, copyVisible, ctaVisible, gradientActive } = useHeroIntro();
  const sectionRef = useRef<HTMLElement>(null);
  const zeroRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const section = sectionRef.current;
    const zero = zeroRef.current;
    if (!section || !zero) return;

    const applyTransform = () => {
      frameRef.current = null;
      const { x, y } = targetRef.current;
      zero.style.transform = `translate3d(${x * DRIFT_X}px, ${y * DRIFT_Y}px, 0) rotate(${x * DRIFT_ROTATE}deg)`;
    };

    const queueFrame = () => {
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(applyTransform);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      targetRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };
      queueFrame();
    };

    const onPointerLeave = () => {
      targetRef.current = { x: 0, y: 0 };
      queueFrame();
    };

    section.addEventListener("pointermove", onPointerMove);
    section.addEventListener("pointerleave", onPointerLeave);
    return () => {
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative overflow-hidden bg-page pt-16 pb-24 lg:pt-20 lg:pb-32 2xl:flex 2xl:min-h-[min(78vh,760px)] 2xl:flex-col 2xl:justify-center 2xl:pt-0 2xl:pb-0"
    >
      <Container>
        <div aria-hidden="true" className="select-none text-right">
          {/* hero-intro-line is display:inline-block (see globals.css) — deliberately kept
              on this span, not the div above, so text-right can position it: an inline-block
              box participates in its parent's inline alignment, a block one wouldn't. */}
          <span
            className={`hero-intro-line ${headlineVisible ? "hero-intro-line-visible" : ""} font-semibold leading-[0.82] tracking-tighter text-ink text-[clamp(6.5rem,34vw,11.5rem)] lg:text-[clamp(15rem,17vw,27rem)]`}
          >
            4
            <span
              ref={zeroRef}
              style={{ display: "inline-block", willChange: "transform" }}
              className={`hero-shimmer bg-clip-text text-transparent transition-transform duration-300 ease-out ${
                gradientActive ? "hero-shimmer-active" : ""
              }`}
            >
              0
            </span>
            4
          </span>
        </div>

        <div className="mt-2 grid gap-10 lg:mt-6 lg:grid-cols-12 lg:items-start lg:gap-x-[clamp(32px,calc(0.71vw_+_21.7px),40px)]">
          <div className="lg:col-span-6">
            <h1
              style={{ transitionDelay: "0ms" }}
              className={`hero-intro-fade text-[30px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[38px] lg:text-[46px] xl:text-[clamp(52px,calc(1.43vw_+_31.4px),68px)] ${
                copyVisible ? "hero-intro-fade-visible" : ""
              }`}
            >
              <span className="sr-only">Error 404: </span>
              You&rsquo;re off the map.
            </h1>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-3">
            <p
              style={{ transitionDelay: "60ms" }}
              className={`hero-intro-fade max-w-[clamp(420px,calc(5.36vw_+_342.8px),480px)] text-[16px] font-light leading-[1.6] text-ink-secondary lg:text-[clamp(18px,calc(0.27vw_+_14.1px),21px)] ${
                copyVisible ? "hero-intro-fade-visible" : ""
              }`}
            >
              The page you&rsquo;re looking for isn&rsquo;t here. There&rsquo;s still plenty
              happening across Europe.
            </p>

            <span
              style={{ transitionDelay: "0ms" }}
              className={`hero-intro-fade mt-8 inline-block ${ctaVisible ? "hero-intro-fade-visible" : ""}`}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 rounded-full bg-eu-blue px-8 py-4 text-[15px] font-medium text-white shadow-card transition-all hover:brightness-110 lg:px-[clamp(36px,calc(0.54vw_+_28.3px),42px)] lg:py-[clamp(17px,calc(0.18vw_+_14.4px),19px)] lg:text-[clamp(16px,calc(0.18vw_+_13.4px),18px)]"
              >
                Back Home
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
