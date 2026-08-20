import Container from "./Container";
import Reveal from "./Reveal";
import EuOrbitStars from "./EuOrbitStars";

export default function CtaBanner() {
  return (
    <section className="bg-page py-20 lg:py-28">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[28px] bg-eu-blue px-8 py-16 text-center text-white sm:px-16 lg:px-20 lg:py-24">
          <EuOrbitStars />
          <div className="relative z-10">
            <p className="text-[13px] font-medium tracking-[0.08em] text-white/60 uppercase">
              Get involved
            </p>
            <h2 className="mx-auto mt-4 max-w-[640px] text-[32px] font-semibold leading-[1.2] sm:text-[42px] lg:text-[52px]">
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
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
