import Image from "next/image";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import SectionCta from "./SectionCta";
import { products } from "@/lib/home-data";

export default function Market() {
  return (
    <section className="bg-[#e9e9e9] pt-16 lg:pt-[80px]">
      <Container>
        <SectionHeading
          eyebrow="Market"
          title={"A curated marketplace\nfor digital & physical products"}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <a
              key={product.title}
              href="#"
              className="group flex flex-col overflow-hidden rounded-[14px] bg-white/90"
            >
              <div className="relative aspect-[439/329] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <p className="text-[13px] font-light text-[#222]">Digital Product</p>
                <h3 className="text-[18px] font-semibold leading-[1.2] text-[#222]">
                  {product.title}
                </h3>
                <div className="-mx-6 mt-auto flex items-center justify-between border-t border-[#ededed] px-6 pt-4">
                  <span className="text-[12px] font-light text-[#222]">
                    By <span className="font-semibold">{product.by}</span>
                  </span>
                  {product.price && (
                    <span className="flex items-baseline gap-1">
                      <span className="text-[11px] font-semibold text-[#222]">from</span>
                      <span className="text-[26px] font-semibold text-[#222]">
                        {product.price}
                      </span>
                      <span className="text-[10px] text-[#222]">USD</span>
                    </span>
                  )}
                </div>
                <div className="-mx-6 flex items-center justify-between border-t border-[#ededed] px-6 pt-4 text-[14px] font-semibold text-[#222]">
                  View Product
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path
                      d="M3 10h13.5M11 4.5 16.5 10 11 15.5"
                      stroke="#222"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
        <SectionCta label="Browse specially curated products" linkLabel="View Market" />
      </Container>
    </section>
  );
}
