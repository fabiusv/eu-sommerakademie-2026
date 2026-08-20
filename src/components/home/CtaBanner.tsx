import Image from "next/image";
import Container from "./Container";

const tiles = [
  {
    label: "Share your work",
    title: "Submit your website for\nvisibility and\nrecognition",
    cta: "Submit Website",
    image: "/images/home/cta-submit-website-bg.png",
  },
  {
    label: "Be a member",
    title: "Get access to special\npro features",
    cta: "Be Pro",
    image: "/images/home/cta-be-pro-bg.png",
  },
];

export default function CtaBanner() {
  return (
    <section className="bg-[#e9e9e9] py-16 lg:py-[80px]">
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="relative flex min-h-[440px] flex-col justify-between gap-8 overflow-hidden rounded-[14px] bg-[#222] p-8 text-white lg:aspect-[898/558] lg:min-h-0 lg:p-16"
            >
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 object-cover opacity-60"
              />
              <div className="relative z-10">
                <p className="text-[13px] font-light">{tile.label}</p>
                <h3 className="mt-3 max-w-[420px] whitespace-pre-line text-[28px] font-semibold leading-[1.2] lg:text-[46px]">
                  {tile.title}
                </h3>
                <a
                  href="#"
                  className="mt-6 inline-block rounded-lg border border-white px-8 py-4 text-[16px] lg:mt-8"
                >
                  {tile.cta}
                </a>
              </div>
              <p className="relative z-10 text-right text-[13px] font-light">
                Got questions? Read our{" "}
                <a href="#" className="border-b border-white/30">
                  FAQs
                </a>
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
