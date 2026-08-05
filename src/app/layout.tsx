import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "luma — Delightful events start here",
  description:
    "From run clubs to launch parties and firework shows, Luma makes every event feel effortless.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#131517] text-white">
        {children}
      </body>
    </html>
  );
}
