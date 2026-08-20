import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import EuropeMarquee from "@/components/home/EuropeMarquee";
import FeaturedCities from "@/components/home/FeaturedCities";
import StatBanner from "@/components/home/StatBanner";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import CommunityAndOpportunities from "@/components/home/CommunityAndOpportunities";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/home/Footer";
import FloatingDock from "@/components/home/FloatingDock";
import { NavVisibilityProvider } from "@/components/home/NavVisibility";
import { HeroIntroProvider } from "@/components/home/HeroIntroProvider";

export default function Home() {
  return (
    <HeroIntroProvider>
      <NavVisibilityProvider>
        <Header />
        <main>
          <Hero />
          <EuropeMarquee />
          <FeaturedCities />
          <StatBanner />
          <UpcomingEvents />
          <CommunityAndOpportunities />
          <CtaBanner />
        </main>
        <Footer />
        <FloatingDock />
      </NavVisibilityProvider>
    </HeroIntroProvider>
  );
}
