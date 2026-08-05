import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { UnitCalendarCard } from "@/components/UnitCalendarCard";
import { imgArtsIconPng } from "@/assets/home";
import {
  imgCoverImageForCategory,
  imgAvatarForRecCreateCollective,
  imgAvatarForWorldCafeCat,
  imgAvatarForTheCanvasNyc,
} from "@/assets/unit";

export const metadata = {
  title: "Arts & Culture — luma",
};

const popularCalendars = [
  {
    avatar: imgAvatarForRecCreateCollective,
    title: "RecCreate Collective",
    location: "New York",
    description: "Live a life full of creativity & connection. Join us for a club, project,",
  },
  {
    avatar: imgAvatarForWorldCafeCat,
    title: "World Cafe CAT",
    location: "Hong Kong",
    description: "World Café is a dynamic and collaborative conversation method…",
  },
  {
    avatar: imgAvatarForTheCanvasNyc,
    title: "The Canvas NYC",
    location: "New York",
    description: "The Canvas is a sustainable fashion platform with multiple",
  },
];

function SubscribeForm() {
  return (
    <form className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        placeholder="me@email.com"
        className="h-[38px] flex-1 rounded-full border border-white/8 bg-white/4 px-4 text-[14px] text-white placeholder:text-white/40 outline-none focus:border-white/30"
      />
      <Button variant="primary" type="submit" className="shrink-0">
        Subscribe
      </Button>
    </form>
  );
}

export default function ArtsCulturePage() {
  return (
    <>
      <NavBar variant="app" />
      <main className="flex-1">
        <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col-reverse items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="w-full max-w-md">
              <h1 className="text-[36px] font-medium text-white tracking-[-0.4px] sm:text-[40px]">
                Arts &amp; Culture
              </h1>
              <div className="mt-3 flex items-center gap-4 border-b border-white/8 pb-4 text-[14px] text-white/79">
                <span>2K Events</span>
                <span>22K Subscribers</span>
              </div>
              <p className="mt-4 text-[16px] leading-[24px] text-white/79 tracking-[-0.32px]">
                Whether it&rsquo;s painting workshops or pottery classes, join an event to unleash
                your creativity, learn new techniques, and connect with fellow makers.
              </p>
              <SubscribeForm />
            </div>
            <div className="relative aspect-square w-full max-w-[380px] shrink-0 overflow-hidden rounded-3xl bg-white">
              <Image
                src={imgCoverImageForCategory}
                alt="Arts & Culture"
                fill
                className="object-contain"
                sizes="380px"
                priority
              />
            </div>
          </div>

          <section className="mt-16">
            <h2 className="mb-4 text-[20px] font-semibold text-white tracking-[-0.46px]">
              Popular Calendars
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {popularCalendars.map((cal) => (
                <UnitCalendarCard key={cal.title} {...cal} />
              ))}
            </div>
          </section>

          <section className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="mb-4 text-[20px] font-semibold text-white tracking-[-0.46px]">
                Nearby Events
              </h2>
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_70%)] sm:aspect-[16/9]">
                <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative flex flex-col items-center gap-3 px-6 text-center">
                  <p className="text-[16px] font-medium text-white">No Events Nearby</p>
                  <p className="max-w-xs text-[14px] leading-[21px] text-white/50">
                    There are currently no relevant events near you. You can explore all events on
                    the map.
                  </p>
                  <Button variant="subtle" href="/discover/arts-culture/map">
                    Explore Events
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/4 bg-white/4 p-5">
              <div className="flex items-center gap-3">
                <span className="relative h-8 w-8 shrink-0">
                  <Image src={imgArtsIconPng} alt="" fill className="object-contain" sizes="32px" />
                </span>
                <span className="text-[16px] font-medium text-white">Arts &amp; Culture</span>
              </div>
              <p className="mt-3 text-[14px] leading-[21px] text-white/50 tracking-[-0.154px]">
                Subscribe to stay up-to-date with the latest events, calendars and other updates.
              </p>
              <SubscribeForm />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
