import type { ReactNode } from "react";

export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1920px] px-4 md:px-10 lg:px-[52px] ${className}`}>
      {children}
    </div>
  );
}
