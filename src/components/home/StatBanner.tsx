import Container from "./Container";
import Reveal from "./Reveal";
import PulseMark from "./PulseMark";
import { stat } from "@/lib/home-data";

export default function StatBanner() {
  return (
    <section className="bg-page-secondary py-24 lg:py-32">
      <Container>
        <Reveal className="mx-auto flex max-w-[clamp(720px,calc(7.14vw_+_617px),800px)] flex-col items-center text-center">
          <PulseMark className="size-4 text-eu-blue" />
          <p className="mt-6 text-[26px] font-semibold leading-[1.3] text-ink sm:text-[32px] lg:text-[clamp(40px,calc(0.71vw_+_29.7px),48px)]">
            {stat.headline}
          </p>
          <p className="mt-5 max-w-[480px] text-[15px] leading-[1.6] text-ink-secondary lg:text-[16px]">
            {stat.subtext}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
