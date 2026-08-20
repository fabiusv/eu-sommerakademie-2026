import type { Metadata } from "next";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import FloatingDock from "@/components/home/FloatingDock";
import { NavVisibilityProvider } from "@/components/home/NavVisibility";
import { HeroIntroProvider } from "@/components/home/HeroIntroProvider";
import NotFoundHero from "@/components/not-found/NotFoundHero";

export const metadata: Metadata = {
  title: "Page not found — Democratic Pulse",
  description:
    "The page you're looking for isn't here. There's still plenty happening across Europe.",
};

export default function NotFound() {
  return (
    <HeroIntroProvider instant>
      <NavVisibilityProvider>
        <Header />
        <main>
          <NotFoundHero />
        </main>
        <Footer />
        <FloatingDock />
      </NavVisibilityProvider>
    </HeroIntroProvider>
  );
}
