"use client";

import Link from "next/link";
import PulseMark from "./PulseMark";
import ScrollToTopButton from "./ScrollToTopButton";
import { useNavVisibility } from "./NavVisibility";
import { ArrowRightIcon } from "@/components/icons";

const navItems = [
  { label: "Events", href: "/events" },
  { label: "Communities", href: "#" },
  { label: "Opportunities", href: "#" },
  { label: "Map", href: "#" },
  { label: "Initiatives", href: "#" },
];

export default function FloatingDock() {
  const { showBottomNav } = useNavVisibility();

  const visibility = showBottomNav
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-3 opacity-0";

  return (
    <>
      {/* Left: back-to-top — shared between mobile and desktop */}
      <div
        className={`nav-visibility fixed bottom-5 left-4 z-40 transition-all duration-[250ms] ease-out sm:left-6 lg:bottom-7 lg:left-10 ${visibility}`}
      >
        <ScrollToTopButton />
      </div>

      {/* Center: standalone Join Europe CTA — mobile only. Wrapper is full-width
          (inset-x-0) to center the pill, which would otherwise swallow clicks meant
          for the back-to-top button underneath — see the desktop pill nav below for
          the same fix. */}
      <div
        className={`nav-visibility pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-20 transition-all duration-[250ms] ease-out lg:hidden ${visibility}`}
      >
        <Link
          href="/sign-up"
          className="pointer-events-auto flex shrink-0 items-center gap-2 rounded-full bg-eu-blue px-6 py-3.5 text-[13.5px] font-medium text-white shadow-card-hover transition-all hover:brightness-110"
        >
          Join Europe
          <ArrowRightIcon size={13} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Right: standalone logo button — mobile only */}
      <div
        className={`nav-visibility fixed bottom-5 right-4 z-40 transition-all duration-[250ms] ease-out sm:right-6 lg:hidden ${visibility}`}
      >
        <Link
          href="/"
          aria-label="Democratic Pulse home"
          className="flex size-13 shrink-0 items-center justify-center rounded-full bg-surface text-eu-blue shadow-card-hover transition-transform hover:scale-105"
        >
          <PulseMark className="size-4" />
        </Link>
      </div>

      {/* Desktop: combined pill nav — unchanged, lg and up only. The wrapper spans the
          full width (inset-x-0) just to center its child, but that made it swallow
          pointer events across the whole strip — including over the back-to-top button
          on the left, well outside the visible pill. pointer-events-none on the wrapper
          plus pointer-events-auto on the nav itself keeps the hit target matched to what
          is actually visible. */}
      <div
        className={`nav-visibility pointer-events-none fixed inset-x-0 bottom-5 z-40 hidden justify-center px-4 transition-all duration-[250ms] ease-out lg:flex lg:bottom-7 ${visibility}`}
      >
        <nav
          aria-label="Quick navigation"
          className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-surface/85 p-1.5 shadow-card-hover backdrop-blur-xl"
        >
          <Link
            href="/"
            aria-label="Democratic Pulse home"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-eu-blue transition-transform hover:scale-105 lg:size-11"
          >
            <PulseMark className="size-3.5" />
          </Link>

          <div className="hidden items-center gap-0.5 px-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2.5 text-[13.5px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-eu-blue"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            href="/sign-up"
            className="flex shrink-0 items-center gap-2 rounded-full bg-eu-blue px-5 py-2.5 text-[13.5px] font-medium text-white transition-all hover:brightness-110 lg:px-6 lg:py-3 lg:text-[14px]"
          >
            Join Europe
            <ArrowRightIcon size={13} strokeWidth={1.5} />
          </Link>
        </nav>
      </div>
    </>
  );
}
