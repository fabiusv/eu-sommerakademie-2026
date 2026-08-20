import Image from "next/image";
import Container from "./Container";

export default function Hero() {
  return (
    <section className="bg-[#e9e9e9] pt-5 pb-16 lg:pt-[60px] lg:pb-[80px]">
      <Container>
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#222] lg:gap-3 lg:text-[13px]">
            <span>Site of the Day</span>
            <span className="rounded border border-[#222]/30 px-2.5 py-1 font-medium">
              Aug 16, 2026
            </span>
            <span>
              Score 7.17<sup className="ml-px text-[8px]">of 10</sup>
            </span>
          </div>

          <h1 className="mt-3 max-w-[1312px] text-[39px] font-semibold uppercase leading-[1.07] text-[#222] sm:text-[64px] md:text-[92px] lg:text-[130px] xl:text-[158px]">
            SSTR - Friction Reduction
          </h1>

          <a href="#" className="mt-4 flex items-center gap-2.5 lg:mt-6">
            <span className="relative size-[32px] overflow-hidden rounded-full">
              <Image
                src="/images/home/avatar-dmitry-golub.png"
                alt="Dmitry Golub"
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
            <span className="hidden border-b border-[#222] text-[19px] font-semibold text-[#222] lg:inline">
              Dmitry Golub
            </span>
          </a>
        </div>

        <div className="relative mx-auto mt-9 aspect-[1600/1200] w-full max-w-[1600px] overflow-hidden rounded-lg lg:mt-14">
          <Image
            src="/images/home/hero-screenshot.png"
            alt="SSTR - Friction Reduction"
            fill
            priority
            sizes="(min-width: 1600px) 1600px, 100vw"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
