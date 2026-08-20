import Container from "./Container";
import DisplayHeading from "./DisplayHeading";
import SectionCta from "./SectionCta";
import SiteCard from "./SiteCard";
import { nominees } from "@/lib/home-data";

export default function Nominees() {
  return (
    <section className="bg-page pt-16 pb-4 lg:pt-[80px]">
      <Container>
        <DisplayHeading
          eyebrow="Latest"
          title="Nominees"
          subtitle="Vote for the latest websites on awwwards"
        />
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {nominees.map((site) => (
            <SiteCard key={site.name} {...site} />
          ))}
        </div>
        <SectionCta label="Check out all submitted websites" linkLabel="View Nominees" />
      </Container>
    </section>
  );
}
