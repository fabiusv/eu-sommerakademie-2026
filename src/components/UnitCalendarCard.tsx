import Image from "next/image";
import { FollowButton } from "@/components/Button";

export function UnitCalendarCard({
  avatar,
  title,
  location,
  description,
}: {
  avatar: string;
  title: string;
  location: string;
  description: string;
}) {
  return (
    <a
      href="#"
      className="flex flex-col gap-3 rounded-2xl border border-white/4 bg-white/4 p-3.5 transition-colors hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/8">
          <Image src={avatar} alt="" fill className="object-cover" sizes="48px" />
        </span>
        <FollowButton />
      </div>
      <div>
        <h3 className="text-[18px] font-medium text-white tracking-[-0.45px]">{title}</h3>
        <p className="mt-1 text-[14px] leading-[21px] text-white/50 tracking-[-0.154px]">
          <span className="text-white/50">{location} · </span>
          <span className="line-clamp-2">{description}</span>
        </p>
      </div>
    </a>
  );
}
