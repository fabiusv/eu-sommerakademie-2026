"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useHeroIntro } from "./HeroIntroProvider";

type NavVisibilityState = {
  showTopNav: boolean;
  showBottomNav: boolean;
  setMenuOpen: (open: boolean) => void;
};

// Hidden by default — the top nav is part of the post-preloader entrance sequence and
// only starts becoming scroll-reactive once the intro reaches its nav phase.
const DEFAULT_STATE: NavVisibilityState = {
  showTopNav: false,
  showBottomNav: false,
  setMenuOpen: () => {},
};

const NavVisibilityContext = createContext<NavVisibilityState>(DEFAULT_STATE);

const HERO_ID = "hero";
const DIRECTION_THRESHOLD = 12;

export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const { navVisible } = useHeroIntro();
  const [state, setState] = useState({ showTopNav: false, showBottomNav: false });
  const [menuOpen, setMenuOpen] = useState(false);

  const pastHeroRef = useRef(false);
  const directionRef = useRef<"up" | "down">("up");
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (!navVisible) return;

    lastYRef.current = window.scrollY;

    const applyState = () => {
      const pastHero = pastHeroRef.current;
      const nextShowTop = !pastHero || directionRef.current === "up";
      const nextShowBottom = pastHero && directionRef.current === "down";

      setState((prev) =>
        prev.showTopNav === nextShowTop && prev.showBottomNav === nextShowBottom
          ? prev
          : { showTopNav: nextShowTop, showBottomNav: nextShowBottom }
      );
    };

    // Fire once immediately so the top nav appears the instant its intro phase starts,
    // rather than waiting on the IntersectionObserver's async first callback.
    applyState();

    const hero = document.getElementById(HERO_ID);
    let observer: IntersectionObserver | undefined;

    if (hero) {
      observer = new IntersectionObserver(
        ([entry]) => {
          pastHeroRef.current = !entry.isIntersecting;
          applyState();
        },
        { threshold: 0 }
      );
      observer.observe(hero);
    }

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastYRef.current;

        if (Math.abs(delta) > DIRECTION_THRESHOLD) {
          directionRef.current = delta > 0 ? "down" : "up";
          lastYRef.current = currentY;
          applyState();
        }

        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, [navVisible]);

  // The full-screen mobile menu is the highest navigation layer while open — the bottom
  // floating dock (back-to-top / Join Europe / logo) must never show above it, so it's
  // suppressed here rather than left for every consumer to re-derive.
  const value: NavVisibilityState = {
    showTopNav: state.showTopNav,
    showBottomNav: state.showBottomNav && !menuOpen,
    setMenuOpen,
  };

  return <NavVisibilityContext.Provider value={value}>{children}</NavVisibilityContext.Provider>;
}

export function useNavVisibility() {
  return useContext(NavVisibilityContext);
}
