import Image from "next/image";
import Container from "./Container";

const columns = [
  { heading: null, links: ["Websites", "Collections", "Elements"] },
  { heading: null, links: ["Academy", "Jobs", "Market"] },
  { heading: null, links: ["Directory", "Conferences"] },
  { heading: null, links: ["FAQs", "About Us", "Contact Us"] },
];

const legal = ["Cookies Policy", "Legal Terms", "Privacy Policy"];
const social = ["Instagram", "LinkedIn", "Twitter", "Facebook", "YouTube", "TikTok", "Pinterest"];

export default function Footer() {
  return (
    <footer className="bg-page-secondary pt-12 pb-28 lg:pt-16 lg:pb-32">
      <Container>
        <Image src="/images/home/footer-logo.svg" alt="Awwwards" width={30} height={16} />

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:mt-16">
          {columns.map((col, i) => (
            <ul key={i} className="flex flex-col gap-3 text-[13px] font-semibold text-ink-secondary">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="transition-colors hover:text-accent">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-line pt-6 text-[12px] text-ink-secondary lg:mt-16 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap gap-6">
            {legal.map((item) => (
              <li key={item}>
                <a href="#" className="transition-colors hover:text-accent">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap items-center gap-4">
            <li className="font-semibold text-ink">Connect:</li>
            {social.map((item) => (
              <li key={item}>
                <a href="#" className="transition-colors hover:text-accent">
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
