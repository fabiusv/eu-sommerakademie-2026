import Image from "next/image";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import SectionCta from "./SectionCta";
import { blogPosts } from "@/lib/home-data";

export default function Blog() {
  return (
    <section className="bg-[#e9e9e9] py-16 lg:py-[80px]">
      <Container>
        <SectionHeading eyebrow="Blog" title={"Explore these\npopular posts."} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {blogPosts.map((post) => (
            <a
              key={post.title}
              href="#"
              className="group flex flex-col overflow-hidden rounded-[14px] bg-white"
            >
              <div className="relative aspect-[439/329.25] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="text-[18px] font-semibold leading-[1.2] text-[#222]">
                  {post.title}
                </h3>
                <p className="text-[13px] font-light leading-[1.6] text-[#222]">{post.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
        <SectionCta label="Browse all articles" linkLabel="View Blog" />
      </Container>
    </section>
  );
}
