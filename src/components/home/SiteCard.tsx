import Image from "next/image";
import type { SiteEntry } from "@/lib/home-data";

export default function SiteCard({ name, image, avatar, by, pro }: SiteEntry) {
  return (
    <a href="#" className="group block">
      <div className="relative aspect-[592/444] overflow-hidden rounded-[14px] bg-[#dcdcdc]">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[17px] font-semibold text-[#222] lg:text-[20px]">{name}</span>
        <span className="text-[10px] font-light text-[#222]">by</span>
        <span className="flex items-center gap-2">
          <span className="relative size-[28px] overflow-hidden rounded-full lg:size-[32px]">
            <Image src={avatar} alt={by} fill sizes="32px" className="object-cover" />
          </span>
          <span className="border-b border-[#222] text-[17px] font-semibold text-[#222] lg:text-[20px]">
            {by}
          </span>
          {pro && (
            <span className="text-[7px] font-medium tracking-wide text-[#222]">PRO</span>
          )}
        </span>
      </div>
    </a>
  );
}
