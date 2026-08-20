import Container from "./Container";
import Reveal from "./Reveal";
import SectionEyebrow from "./SectionEyebrow";
import { communities, opportunities } from "@/lib/home-data";

function ListRow({
  title,
  meta,
  tag,
  trailing,
}: {
  title: string;
  meta: string;
  tag: string;
  trailing: string;
}) {
  return (
    <a href="#" className="group flex items-center justify-between gap-4 border-t border-line py-5">
      <span>
        <span className="block text-[16px] font-semibold text-ink transition-colors group-hover:text-eu-blue lg:text-[17px]">
          {title}
        </span>
        <span className="mt-1 block text-[13px] text-ink-muted">{meta}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="rounded-full bg-eu-blue/10 px-2.5 py-1 text-[11px] font-medium text-eu-blue">
          {tag}
        </span>
        <span className="text-[12px] text-ink-secondary">{trailing}</span>
      </span>
    </a>
  );
}

export default function CommunityAndOpportunities() {
  return (
    <section className="bg-page py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionEyebrow index="03" label="Community & opportunities" />
          <h2 className="mt-8 max-w-[560px] text-[28px] font-semibold leading-[1.2] text-ink lg:mt-10 lg:text-[38px]">
            Join the people and programs shaping Europe.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:mt-16 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="text-[13px] font-semibold tracking-[0.04em] text-ink uppercase">
                Communities
              </h3>
              <div className="mt-2 border-b border-line">
                {communities.map((c) => (
                  <ListRow key={c.name} title={c.name} meta={c.city} tag={c.focus} trailing={c.members} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-[0.04em] text-ink uppercase">
                Opportunities
              </h3>
              <div className="mt-2 border-b border-line">
                {opportunities.map((o) => (
                  <ListRow
                    key={o.title}
                    title={o.title}
                    meta={o.org}
                    tag={o.type}
                    trailing={`Deadline: ${o.deadline}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
