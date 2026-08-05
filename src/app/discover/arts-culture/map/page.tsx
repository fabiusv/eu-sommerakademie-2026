import Image from "next/image";
import Link from "next/link";
import { imgArtsIconPng } from "@/assets/home";
import { imgLinkLumaHomeSvg } from "@/assets/discover";
import {
  imgBackgroundOverlay,
  imgBackgroundOverlay2,
  imgBackgroundOverlay3,
  imgBackgroundOverlay4,
  imgBackgroundOverlay5,
  imgBackgroundOverlay6,
  imgBackgroundOverlay7,
  imgBackgroundOverlay8,
} from "@/assets/map";

export const metadata = {
  title: "Arts & Culture — Explore Events — luma",
};

type EventRow = {
  time: string;
  title: string;
  host: string;
  venue: string;
  badge?: string;
  attendees?: string;
  image: string;
};

const today: EventRow[] = [
  {
    time: "6:00 PM",
    title: "Portrait drawing on Wednesday",
    host: "By Wei-Chun Chu",
    venue: "Coffee Fellows - Kaffee, Bagels, Frühstück",
    badge: "Near Capacity",
    attendees: "+2",
    image: imgBackgroundOverlay,
  },
  {
    time: "6:30 PM",
    title: "CRY SESSION - Ceramic Painting Workshop @ Mao Mao (Men-Only)",
    host: "By Hot Boys Cry",
    venue: "",
    badge: "Near Capacity",
    attendees: "+13",
    image: imgBackgroundOverlay2,
  },
  {
    time: "7:00 PM",
    title: "Soundbath & Voice Activation Circle with Jeannel (VOICE WISDOM)",
    host: "By Room to Resonate",
    venue: "bUm - Raum für solidarisches Miteinander",
    image: imgBackgroundOverlay3,
  },
  {
    time: "7:30 PM",
    title: "Filmabend: HOLOFICTION",
    host: "By Marie im Bundestag, Sergey Elkind & Nelli Elkind",
    venue: "Adele-Schreiber-Krieger-Straße 1",
    image: imgBackgroundOverlay4,
  },
  {
    time: "8:00 PM",
    title: "Saddle Up XV",
    host: "By Berlin Line",
    venue: "Belushi's Berlin (Mitte)",
    badge: "Waitlist",
    attendees: "+50",
    image: imgBackgroundOverlay5,
  },
];

const tomorrow: EventRow[] = [
  {
    time: "5:00 PM",
    title: "BOMA x Krom First Thursday",
    host: "By BOMA Berlin",
    venue: "Winsstraße 9",
    attendees: "+14",
    image: imgBackgroundOverlay6,
  },
  {
    time: "6:00 PM",
    title: "ANTIclub Invites Julia Walinowska for: An Evening of Poetry",
    host: "By ANTI",
    venue: "ANTI",
    badge: "€19",
    image: imgBackgroundOverlay7,
  },
  {
    time: "6:00 PM",
    title: "CROCHET BAG WORKSHOP",
    host: "By Ania - Not The Creative kind",
    venue: "Nomad Day Bar",
    badge: "Waitlist",
    attendees: "+6",
    image: imgBackgroundOverlay8,
  },
];

function EventRowItem({ event }: { event: EventRow }) {
  return (
    <a href="#" className="flex gap-3 border-b border-white/8 px-4 py-3 hover:bg-white/4 transition-colors">
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-white/8">
        <Image src={event.image} alt="" fill className="object-cover" sizes="56px" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-white/50">{event.time}</p>
        <p className="truncate text-[14px] font-medium text-white">{event.title}</p>
        <p className="truncate text-[13px] text-white/50">{event.host}</p>
        {event.venue && <p className="truncate text-[13px] text-white/40">{event.venue}</p>}
        {event.badge && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-white/70">
            {event.badge}
            {event.attendees && <span className="text-white/40">{event.attendees}</span>}
          </span>
        )}
      </div>
    </a>
  );
}

export default function ArtsCultureMapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#131517]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-4">
        <Link href="/discover/arts-culture" className="flex items-center gap-2">
          <span className="relative h-6 w-6">
            <Image src={imgArtsIconPng} alt="" fill className="object-contain" sizes="24px" />
          </span>
          <span className="text-[15px] font-medium text-white">Arts &amp; Culture</span>
        </Link>
        <Image src={imgLinkLumaHomeSvg} alt="luma" width={44} height={16} />
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="order-2 w-full shrink-0 overflow-y-auto md:order-1 md:h-[calc(100vh-56px)] md:w-[340px] md:border-r md:border-white/8">
          <p className="px-4 pt-4 pb-2 text-[13px] font-medium text-white/50">Today / Wednesday</p>
          {today.map((e, i) => (
            <EventRowItem key={i} event={e} />
          ))}
          <p className="px-4 pt-4 pb-2 text-[13px] font-medium text-white/50">Tomorrow / Thursday</p>
          {tomorrow.map((e, i) => (
            <EventRowItem key={i} event={e} />
          ))}
        </aside>

        <div className="relative order-1 h-[45vh] flex-1 overflow-hidden bg-[#1a1c1e] md:order-2 md:h-[calc(100vh-56px)]">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="absolute left-[46%] top-[46%] flex h-8 w-8 items-center justify-center rounded-full bg-lime-400 text-[12px] font-semibold text-[#131517] shadow-lg">
            65
          </div>
          <div className="absolute left-[45%] top-[58%] h-2.5 w-2.5 rounded-full bg-lime-400 shadow-lg" />
          <div className="absolute bottom-3 left-3 text-[12px] text-white/40"> Maps</div>
          <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-md border border-white/10 text-white/70">
            <button type="button" className="h-7 w-7 bg-white/8 text-[16px] leading-none hover:bg-white/16">
              −
            </button>
            <button type="button" className="h-7 w-7 border-t border-white/10 bg-white/8 text-[16px] leading-none hover:bg-white/16">
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
