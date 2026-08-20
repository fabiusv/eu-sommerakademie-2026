import type { Metadata } from "next";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import FloatingDock from "@/components/home/FloatingDock";
import { NavVisibilityProvider } from "@/components/home/NavVisibility";
import { HeroIntroProvider } from "@/components/home/HeroIntroProvider";
import EventsPage from "@/components/events/EventsPage";

export const metadata: Metadata = {
  title: "Events — Democratic Pulse",
  description:
    "Discover events, meetups, workshops, civic initiatives, volunteering, and cultural gatherings happening across Europe.",
};

export default function Page() {
  return (
    <HeroIntroProvider instant>
      <NavVisibilityProvider>
        <Header />
        <main>
          <EventsPage />
        </main>
        <Footer />
        <FloatingDock />
      </NavVisibilityProvider>
    </HeroIntroProvider>
  );
}
