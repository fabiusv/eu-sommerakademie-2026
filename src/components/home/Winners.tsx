import Container from "./Container";
import SectionHeading from "./SectionHeading";
import SectionCta from "./SectionCta";
import SiteCard from "./SiteCard";
import { winners } from "@/lib/home-data";

export default function Winners() {
  return (
    <section className="bg-[#e9e9e9] py-16 lg:py-[80px]">
      <Container>
        <SectionHeading eyebrow="Winners" title={"Recent Sites\nof the Day."} />
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((site) => (
            <SiteCard key={site.name} {...site} />
          ))}
        </div>
        <SectionCta label="Check out all submitted websites" linkLabel="View Winners" />
      </Container>
    </section>
  );
}
