import Image from "next/image";
import Link from "next/link";
import { imgVector1 } from "@/assets/home";
import { imgLinkLumaHomeSvg } from "@/assets/discover";

function SignInButton() {
  return (
    <button
      type="button"
      className="h-[30px] shrink-0 rounded-full border border-transparent bg-white/8 px-3.5 text-[14px] font-medium text-white/64 tracking-[-0.154px] hover:bg-white/12 transition-colors"
    >
      Sign In
    </button>
  );
}

export function NavBar({ variant = "app" }: { variant?: "home" | "app" }) {
  if (variant === "home") {
    return (
      <header className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="luma home" className="opacity-30 hover:opacity-60 transition-opacity">
          <Image src={imgVector1} alt="" width={20} height={20} />
        </Link>
        <SignInButton />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.07] backdrop-blur-[8px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] bg-gradient-to-b from-[rgba(62,158,255,0.15)] via-[rgba(180,165,132,0.05)] to-transparent" />
      <nav className="relative mx-auto flex h-[52px] max-w-[1160px] items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="luma home">
          <Image src={imgLinkLumaHomeSvg} alt="luma" width={44} height={16} />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/discover"
            className="hidden sm:inline text-[14px] font-medium text-white/50 tracking-[-0.154px] hover:text-white/80 transition-colors"
          >
            Discover Events
          </Link>
          <span className="hidden md:inline text-[14px] text-white/50 tracking-[-0.154px]">
            4:53 PM GMT+2
          </span>
          <SignInButton />
        </div>
      </nav>
    </header>
  );
}
