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

export function HeroIntroProvider({ children }: { children: ReactNode }) {
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

  return (
    <HeroIntroContext.Provider value={state}>
      <HyperspacePreloader onExit={start} />
      {children}
    </HeroIntroContext.Provider>
  );
}

export function useHeroIntro() {
  return useContext(HeroIntroContext);
}
