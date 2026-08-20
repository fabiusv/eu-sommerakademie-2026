import Link from "next/link";
import Container from "./Container";
import PulseMark from "./PulseMark";

const columns = [
  {
    heading: "Discover",
    links: [
      { label: "Events", href: "/events" },
      { label: "Communities", href: "#" },
      { label: "Opportunities", href: "#" },
      { label: "Map", href: "#" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "About", href: "#" },
      { label: "Interests", href: "#" },
      { label: "Initiatives", href: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQs", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
];

const legal = ["Cookies Policy", "Legal Terms", "Privacy Policy"];
const social = ["Instagram", "LinkedIn", "Twitter"];

export default function Footer() {
  return (
    <footer className="bg-page-secondary pt-16 pb-12 lg:pt-20 lg:pb-16">
      <Container>
        <Link href="/" className="flex w-fit items-center gap-2">
          <PulseMark className="size-2.5 text-eu-blue" />
          <span className="text-[15px] font-semibold tracking-tight text-ink lg:text-[clamp(15px,calc(0.18vw_+_12.4px),17px)]">
            Democratic Pulse
          </span>
        </Link>

        {/* Capped at 2xl+: a 3-column fr grid would otherwise stretch these short link
            lists across the whole wide container, turning normal gaps into huge dead
            space between columns instead of using the width for anything. */}
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:mt-16 lg:gap-x-[clamp(24px,calc(0.71vw_+_13.7px),32px)] lg:gap-y-[clamp(40px,calc(1.43vw_+_19.4px),56px)] 2xl:max-w-[clamp(1400px,calc(19.53vw_+_1100px),1600px)]">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-[12px] font-semibold tracking-[0.04em] text-ink-muted uppercase lg:text-[clamp(12px,calc(0.09vw_+_10.7px),13px)]">
                {col.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-3 text-[14px] text-ink-secondary lg:text-[clamp(14px,calc(0.18vw_+_11.4px),16px)]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-eu-blue">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-6 text-[12px] text-ink-secondary lg:mt-16 lg:flex-row lg:items-center lg:justify-between lg:text-[clamp(12px,calc(0.09vw_+_10.7px),13px)]">
          <ul className="flex flex-wrap gap-6">
            {legal.map((item) => (
              <li key={item}>
                <a href="#" className="transition-colors hover:text-eu-blue">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap items-center gap-4">
            {social.map((item) => (
              <li key={item}>
                <a href="#" className="transition-colors hover:text-eu-blue">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
