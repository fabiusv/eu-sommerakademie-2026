import Image from "next/image";
import Link from "next/link";
import type { Category, City, Community, UpcomingEvent } from "@/lib/data";
import { FollowButton } from "@/components/Button";

export function EventListItem({ event }: { event: UpcomingEvent }) {
  return (
    <a
      href="#"
      className="group relative flex items-center gap-3 overflow-hidden rounded-xl bg-white/8 p-3 transition-colors hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/8">
        <Image src={event.avatar} alt="" fill className="object-cover" sizes="40px" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[16px] font-medium text-white tracking-[-0.32px]">
          {event.title}
        </span>
        <span className="block truncate text-[14px] text-white/50 tracking-[-0.154px]">
          {event.dates} · {event.location}
        </span>
      </span>
    </a>
  );
}

export function CommunityCard({
  community,
  showFollow = false,
}: {
  community: Community;
  showFollow?: boolean;
}) {
  return (
    <a
      href="#"
      className="group flex flex-col gap-3 rounded-2xl border border-white/4 bg-white/4 p-3.5 transition-colors hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/8">
          <Image src={community.avatar} alt="" fill className="object-cover" sizes="48px" />
        </span>
        {showFollow && <FollowButton />}
      </div>
      <div>
        <h3 className="text-[18px] font-medium text-white tracking-[-0.45px]">{community.title}</h3>
        <p className="mt-1 line-clamp-2 text-[14px] leading-[21px] text-white/50 tracking-[-0.154px]">
          {community.description}
        </p>
      </div>
    </a>
  );
}

export function CategoryTileColor({ category }: { category: Category }) {
  return (
    <Link
      href={category.href}
      className="group flex h-[108px] flex-col justify-end gap-2 rounded-xl bg-white/8 p-2.5 transition-colors hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      <span className="relative h-9 w-9 shrink-0">
        <Image src={category.icon} alt="" fill className="object-contain" sizes="36px" />
      </span>
      <span className="truncate text-[16px] font-medium text-white tracking-[-0.32px]">
        {category.label}
      </span>
    </Link>
  );
}

export function CategoryTileFlat({ category }: { category: Category }) {
  return (
    <Link
      href={category.href}
      className="flex items-center gap-3.5 rounded-3xl border border-white/4 bg-white/4 px-3.5 py-3 transition-colors hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      <span className="relative h-12 w-12 shrink-0">
        <Image src={category.icon} alt="" fill className="object-contain" sizes="48px" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[16px] font-medium text-white tracking-[-0.32px]">
          {category.label}
        </span>
        <span className="block text-[14px] text-white/50 tracking-[-0.154px]">{category.count}</span>
      </span>
    </Link>
  );
}

export function CityTile({ city }: { city: City }) {
  return (
    <a
      href="#"
      className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-white/4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      <span
        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: city.color }}
      >
        <Image src={city.icon} alt="" fill className="object-contain p-1.5" sizes="40px" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[16px] font-medium text-white tracking-[-0.32px]">
          {city.name}
        </span>
        <span className="block text-[14px] text-white/50 tracking-[-0.154px]">{city.count}</span>
      </span>
    </a>
  );
}
