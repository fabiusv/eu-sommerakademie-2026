import Image from "next/image";
import Link from "next/link";
import {
  imgVector,
  imgGroup,
  imgLinkLumaOnXSvg,
  imgLinkContactUsSvg,
} from "@/assets/discover";

const links = [
  { label: "Discover", href: "/discover" },
  { label: "Pricing", href: "#" },
  { label: "Help", href: "#" },
];

const legalLinks = ["Terms", "Privacy", "Security", "DMCA"];

export function Footer({ legal = false }: { legal?: boolean }) {
  return (
    <footer className="mx-auto w-full max-w-[1160px] px-4 pb-10 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="luma home" className="opacity-80 hover:opacity-100 transition-opacity">
            <Image src={imgVector} alt="luma" width={44} height={16} />
          </Link>
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[14px] text-white/79 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <a href="#" aria-label="luma on Instagram" className="opacity-80 hover:opacity-100 transition-opacity">
            <Image src={imgGroup} alt="" width={16} height={16} />
          </a>
          <a href="#" aria-label="luma on X" className="opacity-80 hover:opacity-100 transition-opacity">
            <Image src={imgLinkLumaOnXSvg} alt="" width={16} height={16} />
          </a>
          <a href="#" aria-label="Contact us" className="opacity-80 hover:opacity-100 transition-opacity">
            <Image src={imgLinkContactUsSvg} alt="" width={16} height={16} />
          </a>
          <button
            type="button"
            className="h-[38px] rounded-full border border-transparent bg-white/8 px-4 text-[16px] font-medium text-white/64 tracking-[-0.32px] hover:bg-white/12 transition-colors"
          >
            Get the App
          </button>
        </div>
      </div>
      {legal && (
        <div className="flex flex-wrap gap-6 pt-4">
          {legalLinks.map((l) => (
            <span key={l} className="text-[13px] text-white/50 tracking-[-0.078px]">
              {l}
            </span>
          ))}
        </div>
      )}
    </footer>
  );
}
