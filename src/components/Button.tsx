import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const VARIANT_CLASSES = {
  primary: "bg-white text-[#131517] hover:bg-white/90",
  outline: "border border-white text-white hover:bg-white/10",
  subtle: "bg-white/8 text-white/64 border border-transparent hover:bg-white/12",
} as const;

type Variant = keyof typeof VARIANT_CLASSES;

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-4 h-[38px] text-[16px] font-medium tracking-[-0.32px] transition-colors";

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...rest
}: {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = `${base} ${VARIANT_CLASSES[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export function FollowButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={`shrink-0 rounded-full bg-white/8 px-3.5 h-[30px] text-[14px] font-medium text-white/64 tracking-[-0.154px] hover:bg-white/12 transition-colors ${className}`}
    >
      Follow
    </button>
  );
}
