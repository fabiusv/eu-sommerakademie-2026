"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Container from "./Container";
import PulseMark from "./PulseMark";
import FullScreenMenu from "./FullScreenMenu";
import { useNavVisibility } from "./NavVisibility";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { showTopNav, setMenuOpen } = useNavVisibility();
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(open);
  }, [open, setMenuOpen]);

  return (
    <header
      // z-40 normally, matching the bottom floating dock's layer. While the full-screen
      // menu is open it jumps to z-[80] — above the menu's own z-[70] — so this bar's
      // wordmark + morphed close icon read as the menu's own top area instead of being
      // covered by it.
      className={`nav-visibility sticky top-0 z-40 bg-page transition-all duration-[220ms] ease-out ${
        open ? "z-[80]" : ""
      } ${showTopNav ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
    >
      <Container className="flex h-[64px] items-center justify-between lg:h-[80px]">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <PulseMark className="size-2.5 text-eu-blue" />
          <span className="text-[15px] font-semibold tracking-tight text-ink lg:text-[16px]">
            Democratic Pulse
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center px-6 lg:flex lg:px-10">
          <div className="group flex w-full max-w-[260px] items-center gap-2.5 rounded-full border border-transparent bg-page-secondary px-4 py-3 transition-colors duration-200 focus-within:border-eu-blue/60 xl:max-w-[440px] 2xl:max-w-[480px]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="shrink-0 text-ink-muted transition-colors group-focus-within:text-eu-blue"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11 11 14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              aria-label="Search"
              placeholder="Search across Europe"
              className="w-full cursor-text nav-search-field appearance-none bg-transparent text-[14px] leading-none text-ink placeholder:text-ink-muted outline-none xl:hidden"
            />
            <input
              type="search"
              aria-label="Search"
              placeholder="Search events, communities, and opportunities"
              className="hidden w-full cursor-text nav-search-field appearance-none bg-transparent text-[14px] leading-none text-ink placeholder:text-ink-muted outline-none xl:block"
            />
          </div>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <a
            href="#"
            className="text-[14px] font-medium text-ink-secondary transition-colors hover:text-eu-blue"
          >
            Sign in
          </a>
          <button
            type="button"
            className="flex items-center gap-1 text-[13px] font-medium text-ink-secondary transition-colors hover:text-eu-blue"
          >
            EN
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
              <path d="M1 2.5 4 5.5 7 2.5" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>

        <button
          ref={burgerRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-full-menu"
          onClick={() => setOpen((value) => !value)}
          className="relative flex size-11 shrink-0 items-center justify-center text-ink lg:hidden"
        >
          <span aria-hidden className="relative flex size-4 items-center justify-center">
            <span
              className={`absolute h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ease-out ${
                open ? "translate-y-0 rotate-45" : "-translate-y-[5px] rotate-0"
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-full rounded-full bg-current transition-opacity duration-200 ease-out ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ease-out ${
                open ? "translate-y-0 -rotate-45" : "translate-y-[5px] rotate-0"
              }`}
            />
          </span>
        </button>
      </Container>

      <FullScreenMenu open={open} onClose={() => setOpen(false)} triggerRef={burgerRef} />
    </header>
  );
}
