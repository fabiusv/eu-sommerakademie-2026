"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "./Container";
import PulseMark from "./PulseMark";
import { useNavVisibility } from "./NavVisibility";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { showTopNav } = useNavVisibility();

  return (
    <header
      className={`nav-visibility sticky top-0 z-40 bg-page transition-all duration-[220ms] ease-out ${
        showTopNav ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
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
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex size-8 items-center justify-center text-ink lg:hidden"
        >
          {open ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M1.5 1.5 14.5 14.5M14.5 1.5 1.5 14.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden>
              <path
                d="M1 1h16M1 6.5h16M1 12h16"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </Container>

      {open && (
        <div className="border-t border-line bg-page lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M11 11 14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                placeholder="Search"
                className="w-full rounded-full border border-line bg-page-secondary py-3 pr-4 pl-10 text-[15px] text-ink placeholder:text-ink-muted focus:border-eu-blue/50 focus:outline-none"
              />
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-line px-3 pt-4">
              <a href="#" className="text-[15px] font-medium text-ink">
                Sign in
              </a>
              <button
                type="button"
                className="flex items-center gap-1 text-[14px] font-medium text-ink-secondary"
              >
                EN
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                  <path d="M1 2.5 4 5.5 7 2.5" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
