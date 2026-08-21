import Container from "./Container";
import Reveal from "./Reveal";
import EuOrbitStars from "./EuOrbitStars";
import { ArrowRightIcon } from "@/components/icons";

export default function CtaBanner() {
  return (
    <section className="bg-page py-20 lg:py-28">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[28px] bg-eu-blue px-8 py-16 text-center text-white sm:px-16 lg:px-[clamp(80px,calc(1.43vw_+_59.4px),96px)] lg:py-[clamp(96px,calc(1.43vw_+_75.4px),112px)]">
          <EuOrbitStars />
          <div className="relative z-10">
            <p className="text-[13px] font-medium tracking-[0.08em] text-white/60 uppercase">
              Get involved
            </p>
            <h2 className="mx-auto mt-4 max-w-[clamp(640px,calc(7.14vw_+_537px),720px)] text-[32px] font-semibold leading-[1.2] sm:text-[42px] lg:text-[clamp(52px,calc(1.07vw_+_36.6px),64px)]">
              Have something to share with Europe?
            </h2>
            <p className="mx-auto mt-5 max-w-[440px] text-[15px] leading-[1.6] text-white/70 lg:text-[16px]">
              Start an initiative, host an event, or open your community to people across the
              continent.
            </p>
            <a
              href="#"
              className="mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-medium text-eu-blue transition-all hover:brightness-95 lg:px-10 lg:py-[18px] lg:text-[17px]"
            >
              Start an Initiative
              <ArrowRightIcon />
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
