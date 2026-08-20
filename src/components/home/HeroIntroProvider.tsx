"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import HyperspacePreloader from "@/components/preloader/HyperspacePreloader";

type HeroIntroState = {
  headlineVisible: boolean;
  copyVisible: boolean;
  ctaVisible: boolean;
  gradientActive: boolean;
  navVisible: boolean;
  ready: boolean;
};

const HIDDEN: HeroIntroState = {
  headlineVisible: false,
  copyVisible: false,
  ctaVisible: false,
  gradientActive: false,
  navVisible: false,
  ready: false,
};

const HeroIntroContext = createContext<HeroIntroState>(HIDDEN);

type TimelineEntry = { key: keyof HeroIntroState; at: number };

// One deterministic timeline, keyed off the instant the preloader starts its exit fade
// (t=0). Every post-preloader reveal on the page reads its cue from here instead of
// scheduling its own timers — this is the single place that owns "when."
const TIMELINE: TimelineEntry[] = [
  { key: "headlineVisible", at: 150 },
  { key: "copyVisible", at: 600 },
  { key: "ctaVisible", at: 750 },
  { key: "gradientActive", at: 900 },
  { key: "navVisible", at: 950 },
  { key: "ready", at: 1300 },
];

// Same order, compressed into a short opacity-only reveal for reduced-motion users.
const REDUCED_TIMELINE: TimelineEntry[] = [
  { key: "headlineVisible", at: 0 },
  { key: "copyVisible", at: 120 },
  { key: "ctaVisible", at: 200 },
  { key: "gradientActive", at: 260 },
  { key: "navVisible", at: 280 },
  { key: "ready", at: 360 },
];

// Same order again, for pages that skip the hyperspace preloader entirely (see `instant`
// below) but still want the reveal choreography — just starting from t=0 on mount instead
// of from the preloader's exit cue.
const INSTANT_TIMELINE: TimelineEntry[] = [
  { key: "navVisible", at: 120 },
  { key: "headlineVisible", at: 80 },
  { key: "copyVisible", at: 340 },
  { key: "ctaVisible", at: 540 },
  { key: "gradientActive", at: 680 },
  { key: "ready", at: 780 },
];

export function HeroIntroProvider({
  children,
  instant = false,
}: {
  children: ReactNode;
  // Skips the hyperspace preloader and starts the reveal timeline immediately on mount.
  // For pages that aren't the primary site entrance (e.g. 404) — they still get the same
  // nav-visibility + reveal machinery, without forcing a multi-second intro every time.
  instant?: boolean;
}) {
  const [state, setState] = useState<HeroIntroState>(HIDDEN);
  const startedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Scroll is locked for as long as the intro hasn't reached `ready` — covers both the
  // preloader and the Hero reveal that follows it, keyed off the same state this context
  // already produces rather than a timer of its own. `touchmove` is blocked directly
  // (not just body `overflow`) because iOS Safari can still rubber-band the page behind a
  // fixed-position element via touch even with `overflow: hidden` set.
  useEffect(() => {
    if (state.ready) return;

    const { documentElement, body } = document;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousOverscroll = body.style.overscrollBehaviorY;

    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.overscrollBehaviorY = "none";

    const preventTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };
    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
      body.style.overscrollBehaviorY = previousOverscroll;
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [state.ready]);

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeline = reducedMotion ? REDUCED_TIMELINE : TIMELINE;

    timersRef.current = timeline.map(({ key, at }) =>
      window.setTimeout(() => {
        setState((prev) => ({ ...prev, [key]: true }));
      }, at)
    );
  };

  // Self-contained (schedules and cleans up its own timers) rather than routed through
  // `start`/`startedRef` above — those are keyed to the preloader's single, real `onExit`
  // call, which lands long after mount. Dev Strict Mode's mount→cleanup→remount happens
  // *at* mount, so a mount-time start needs a cleanup that can rearm on remount, not one
  // guarded by a ref that survives the simulated unmount.
  useEffect(() => {
    if (!instant) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeline = reducedMotion ? REDUCED_TIMELINE : INSTANT_TIMELINE;

    const ids = timeline.map(({ key, at }) =>
      window.setTimeout(() => {
        setState((prev) => ({ ...prev, [key]: true }));
      }, at)
    );

    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [instant]);

  return (
    <HeroIntroContext.Provider value={state}>
      {!instant && <HyperspacePreloader onExit={start} />}
      {children}
    </HeroIntroContext.Provider>
  );
}

export function useHeroIntro() {
  return useContext(HeroIntroContext);
}

// Gates everything below the Hero (marquee, cards, footer, ...) behind the same `ready`
// flag Hero itself reveals on. Children stay mounted the whole time — geometry never
// changes — only opacity/visibility/pointer-events flip, so there's no second layout
// shift and no window where lower content is visible before the Hero intro finishes.
export function HeroIntroReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ready } = useHeroIntro();

  return (
    <div
      aria-hidden={!ready}
      className={`transition-opacity duration-500 ease-out motion-reduce:transition-none ${
        ready ? "opacity-100" : "invisible pointer-events-none opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
