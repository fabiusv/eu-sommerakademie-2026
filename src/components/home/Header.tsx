import Image from "next/image";
import Link from "next/link";
import Container from "./Container";

const navItems = [
  { label: "Explore", hasCaret: true },
  { label: "Directory" },
  { label: "Academy", badge: "New" },
  { label: "Jobs" },
  { label: "Market" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-page">
      <Container className="flex h-[54px] items-center gap-2 lg:h-[70px] lg:gap-4">
        <button
          type="button"
          aria-label="Open menu"
          className="flex size-8 shrink-0 items-center justify-center xl:hidden"
        >
          <Image src="/images/home/icon-hamburger.svg" alt="" width={16} height={13} />
        </button>

        <Link href="/" className="shrink-0">
          <Image src="/images/home/logo.svg" alt="Awwwards" width={30} height={16} />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-1.5 px-2.5 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:text-accent"
            >
              {item.label}
              {item.badge && (
                <span className="rounded bg-eu-yellow px-1 py-[1px] text-[9px] font-medium text-eu-blue">
                  {item.badge}
                </span>
              )}
              {item.hasCaret && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                  <path d="M1 2.5 4 5.5 7 2.5" stroke="currentColor" strokeWidth="1" />
                </svg>
              )}
            </a>
          ))}
        </nav>

        <div className="flex flex-1 items-center rounded-lg border border-line bg-surface px-4 py-2.5 xl:mx-4">
          <Image src="/images/home/search-icon.svg" alt="" width={14} height={14} />
          <span className="ml-2.5 truncate text-[12px] text-ink-secondary">
            Search by Inspiration
          </span>
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex lg:gap-5">
          <a
            href="#"
            className="text-[13px] font-semibold whitespace-nowrap text-ink-secondary transition-colors hover:text-accent"
          >
            Log in
          </a>
          <a
            href="#"
            className="text-[13px] font-semibold whitespace-nowrap text-ink-secondary transition-colors hover:text-accent"
          >
            Sign Up
          </a>
          <a
            href="#"
            className="rounded-lg bg-eu-blue px-5 py-2.5 text-[13px] font-medium whitespace-nowrap text-white transition-colors hover:brightness-110"
          >
            Be Pro
          </a>
          <a
            href="#"
            className="hidden rounded-lg border border-line px-5 py-2.5 text-[13px] font-medium whitespace-nowrap text-ink-secondary transition-colors hover:border-accent hover:text-ink lg:inline-block"
          >
            Submit Website
          </a>
        </div>

        <button
          type="button"
          aria-label="Account"
          className="flex size-8 shrink-0 items-center justify-center md:hidden"
        >
          <Image src="/images/home/icon-user-login.svg" alt="" width={20} height={20} />
        </button>
      </Container>
    </header>
  );
}
