import Image from "next/image";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { EventListItem, CommunityCard, CategoryTileColor } from "@/components/cards";
import { categories, upcomingEvents, communities } from "@/lib/data";
import { imgSvg, imgSvg2, imgImage1, imgImage2 } from "@/assets/home";

const HERO_GRADIENT =
  "linear-gradient(97deg, #ab46dd 0%, #f31a7c 36%, #f8712b 51%, #eaab26 77%)";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#131517]">
          <NavBar variant="home" />
          <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pt-28 pb-20 text-center sm:pt-36 sm:pb-28">
            <Image src={imgSvg} alt="luma" width={80} height={29} className="mb-4 opacity-90" />
            <h1 className="text-[44px] font-medium leading-[1.05] tracking-[-0.8px] text-white sm:text-[64px] md:text-[80px]">
              Delightful
              <br />
              events
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: HERO_GRADIENT }}
              >
                start here
              </span>
            </h1>
            <p className="mt-6 max-w-md text-[18px] leading-[1.5] text-white/50 tracking-[-0.46px] sm:text-[20px]">
              From{" "}
              <a href="#" className="underline decoration-wavy underline-offset-2">
                run clubs
              </a>{" "}
              to{" "}
              <a href="#" className="underline decoration-wavy underline-offset-2">
                launch parties
              </a>{" "}
              and{" "}
              <a href="#" className="underline decoration-wavy underline-offset-2">
                firework shows
              </a>
              , Luma makes every event feel effortless.
            </p>
            <div className="mt-8">
              <Button variant="primary" href="#">
                Create Your First Event
              </Button>
            </div>
            <Link
              href="/discover"
              className="mt-4 inline-flex items-center gap-1.5 text-[16px] font-medium text-white/50 tracking-[-0.32px] hover:text-white/80 transition-colors"
            >
              Discover Events
              <Image src={imgSvg2} alt="" width={15} height={15} />
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-[1160px] px-4 py-6 sm:px-6">
          <h2 className="mb-4 text-[20px] font-semibold text-white tracking-[-0.46px]">
            Upcoming Major Events
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingEvents.map((event) => (
              <EventListItem key={event.title} event={event} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
          <h2 className="mb-4 text-[20px] font-semibold text-white tracking-[-0.46px]">
            Explore Global Communities
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {communities.map((community) => (
              <CommunityCard key={community.title} community={community} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
          <h2 className="mb-4 text-center text-[20px] font-semibold text-white tracking-[-0.46px]">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <CategoryTileColor key={category.slug} category={category} />
            ))}
          </div>
        </section>

        <section className="relative mt-8 overflow-hidden py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0">
            <Image
              src={imgImage2}
              alt=""
              fill
              className="object-cover opacity-70"
              style={{ maskImage: `url(${imgImage1})`, maskSize: "100% 100%", maskRepeat: "no-repeat" }}
            />
          </div>
          <div className="relative mx-auto flex max-w-xl flex-col items-center px-4 text-center">
            <h2
              className="bg-clip-text text-[32px] font-medium leading-[1.2] tracking-[0.4px] text-transparent sm:text-[40px]"
              style={{ backgroundImage: HERO_GRADIENT }}
            >
              Your next unforgettable
              <br />
              memory awaits.
            </h2>
            <div className="mt-8 flex items-center gap-3">
              <Button variant="outline" href="/discover">
                Discover Events
              </Button>
              <Button variant="subtle" href="#">
                Get the App
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer legal />
    </>
  );
}
