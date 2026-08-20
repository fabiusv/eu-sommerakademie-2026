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
