import Image from "next/image";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import SectionCta from "./SectionCta";
import { collections } from "@/lib/home-data";

export default function Collections() {
  return (
    <section className="bg-[#e9e9e9] py-16 lg:py-[80px]">
      <Container>
        <SectionHeading
          eyebrow="Collections"
          title={"Explore a wide\nvariety of collections."}
        />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {collections.map((collection) => (
            <a key={collection.title} href="#" className="group block">
              <div className="relative aspect-[898/641.7] overflow-hidden rounded-[14px] bg-[#1c1c1c]">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-5 flex items-center gap-3">
                <span className="text-[17px] font-semibold text-[#222] lg:text-[20px]">
                  {collection.title}
                </span>
                <span className="text-[10px] font-light text-[#222]">followed by</span>
                <span className="flex -space-x-2">
                  {collection.avatars.map((avatar, i) => (
                    <span
                      key={i}
                      className="relative size-[30px] overflow-hidden rounded-full border-2 border-[#f8f8f8] lg:size-[36px]"
                    >
                      <Image src={avatar} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                  ))}
                </span>
                <span className="text-[13px] font-semibold text-[#222]">{collection.more}</span>
              </div>
            </a>
          ))}
        </div>
        <SectionCta label="Find inspiration for your projects" linkLabel="View Collections" />
      </Container>
    </section>
  );
}
