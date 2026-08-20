import Link from "next/link";
import Container from "./Container";
import PulseMark from "./PulseMark";

const columns = [
  { heading: "Discover", links: ["Events", "Communities", "Opportunities", "Map"] },
  { heading: "Platform", links: ["About", "Interests", "Initiatives"] },
  { heading: "Support", links: ["FAQs", "Contact", "Sign in"] },
];

const legal = ["Cookies Policy", "Legal Terms", "Privacy Policy"];
const social = ["Instagram", "LinkedIn", "Twitter"];

export default function Footer() {
  return (
    <footer className="bg-page-secondary pt-16 pb-12 lg:pt-20 lg:pb-16">
      <Container>
        <Link href="/" className="flex w-fit items-center gap-2">
          <PulseMark className="size-2.5 text-eu-blue" />
          <span className="text-[15px] font-semibold tracking-tight text-ink">Democratic Pulse</span>
        </Link>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:mt-16">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-[12px] font-semibold tracking-[0.04em] text-ink-muted uppercase">
                {col.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-3 text-[14px] text-ink-secondary">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors hover:text-eu-blue">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-6 text-[12px] text-ink-secondary lg:mt-16 lg:flex-row lg:items-center lg:justify-between">
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
