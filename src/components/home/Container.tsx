import type { ReactNode } from "react";

export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[clamp(1920px,88vw,2260px)] px-4 md:px-10 lg:px-[clamp(52px,calc(6.875vw_-_80px),96px)] ${className}`}
    >
      {children}
    </div>
  );
}
