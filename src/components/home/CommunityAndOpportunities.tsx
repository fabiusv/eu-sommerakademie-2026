import Container from "./Container";
import Reveal from "./Reveal";
import SectionEyebrow from "./SectionEyebrow";
import { opportunities } from "@/lib/home-data";
import { ArrowRightIcon } from "@/components/icons";

// The foundation's own fellowship — the most on-brand, homepage-worthy pick among the
// opportunities. Deeper browsing (grants, residencies, volunteering) belongs on the
// dedicated Opportunities page, not this single homepage moment.
const opportunity = opportunities[0];

export default function CommunityAndOpportunities() {
  return (
    <section className="bg-page py-20 lg:py-28">
      <Container>
        <Reveal>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-[clamp(64px,calc(1.43vw_+_43.4px),80px)]">
            <div className="lg:col-span-5">
              <SectionEyebrow index="03" label="Opportunities" />
              <h2 className="mt-8 text-[28px] font-semibold leading-[1.2] text-ink lg:mt-10 lg:text-[clamp(38px,calc(0.71vw_+_27.7px),46px)]">
                A program worth your time right now.
              </h2>
              <p className="mt-4 max-w-[380px] text-[15px] leading-relaxed text-ink-secondary">
                Hand-picked from the fellowships, grants, and residencies open across the
                Democratic Pulse network.
              </p>
              <a
                href="#"
                className="mt-7 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted transition-colors hover:text-eu-blue lg:mt-8"
              >
                View all opportunities
                <ArrowRightIcon size={13} strokeWidth={1.5} />
              </a>
            </div>

            <a
              href="#"
              className="group relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-3xl bg-surface p-9 shadow-card transition-all duration-300 hover:shadow-card-hover lg:col-span-7 lg:min-h-[clamp(440px,calc(7.14vw_+_337px),520px)] lg:p-[clamp(56px,calc(1.43vw_+_35.4px),72px)]"
            >
              <span className="w-fit rounded-full bg-page-secondary px-3 py-1.5 text-[12px] font-medium text-ink-secondary">
                {opportunity.type}
              </span>

              <div className="mt-10">
                <h3 className="text-[30px] font-semibold leading-tight text-ink transition-colors duration-300 group-hover:text-eu-blue lg:text-[clamp(44px,calc(0.89vw_+_31.1px),54px)]">
                  {opportunity.title}
                </h3>
                <p className="mt-3 text-[15px] text-ink-muted lg:text-[16px]">{opportunity.org}</p>
              </div>

              <div className="mt-12 flex items-end justify-between gap-6 lg:mt-16">
                <div>
                  <span className="block text-[11px] font-medium tracking-[0.04em] text-ink-muted uppercase">
                    Deadline
                  </span>
                  <span className="mt-1 block text-[22px] font-semibold text-eu-blue lg:text-[clamp(26px,calc(0.36vw_+_20.9px),30px)]">
                    {opportunity.deadline}
                  </span>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-eu-yellow text-ink transition-transform duration-500 ease-out group-hover:translate-x-1">
                  <ArrowRightIcon size={15} strokeWidth={1.5} />
                </span>
              </div>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
