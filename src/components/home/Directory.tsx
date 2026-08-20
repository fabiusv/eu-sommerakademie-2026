import Image from "next/image";
import Container from "./Container";
import DisplayHeading from "./DisplayHeading";
import SectionCta from "./SectionCta";
import { creators, directoryRows } from "@/lib/home-data";

export default function Directory() {
  return (
    <section className="bg-page py-16 lg:py-[80px]">
      <Container>
        <DisplayHeading
          eyebrow="Directory"
          title="w.creators"
          subtitle="Active creators in your country."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => {
            const hasPhoto = Boolean(creator.background);
            return (
              <a
                key={creator.name}
                href="#"
                className={`group relative flex aspect-[592/584] flex-col justify-between overflow-hidden rounded-lg bg-surface p-6 shadow-card lg:p-10 ${
                  hasPhoto ? "text-white" : "text-ink"
                }`}
              >
                {creator.background && (
                  <>
                    <Image
                      src={creator.background}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-eu-blue/85 via-eu-blue/20 to-transparent" />
                  </>
                )}
                <span className="relative z-10 size-[44px] overflow-hidden rounded-full lg:size-[52px]">
                  <Image src={creator.avatar} alt={creator.name} fill sizes="52px" className="object-cover" />
                </span>
                <div className="relative z-10">
                  <p className={`text-[12px] font-light ${hasPhoto ? "text-white/70" : "text-ink-secondary"}`}>
                    International
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <h3 className="text-[28px] font-semibold leading-none lg:text-[38px]">
                      {creator.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-lg border px-3 py-2 text-center ${
                        hasPhoto ? "border-white/30" : "border-line"
                      }`}
                    >
                      <span className={`block text-[10px] font-light ${hasPhoto ? "text-white/70" : "text-ink-secondary"}`}>
                        Works
                      </span>
                      <span className="block text-[16px] font-semibold">{creator.works}</span>
                    </span>
                  </div>
                  <div
                    className={`mt-3 flex items-center justify-between text-[12px] font-light ${
                      hasPhoto ? "text-white/70" : "text-ink-secondary"
                    }`}
                  >
                    <span>{creator.website ?? ""}</span>
                    <span>{creator.awards}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-10 overflow-x-auto lg:mt-14">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[13px] font-semibold text-ink">
                <th className="py-4 pr-4">Name</th>
                <th className="py-4 pr-4">Profile</th>
                <th className="py-4 pr-4">Awards</th>
                <th className="py-4 pr-4">Categories</th>
                <th className="py-4" />
              </tr>
            </thead>
            <tbody>
              {directoryRows.map((row) => (
                <tr key={row.name} className="border-b border-line">
                  <td className="py-6 pr-4">
                    <span className="flex items-center gap-2.5">
                      <span className="relative size-[32px] overflow-hidden rounded-full">
                        <Image src={row.avatar} alt={row.name} fill sizes="32px" className="object-cover" />
                      </span>
                      <span className="flex items-baseline gap-1.5">
                        <span className="border-b border-ink/40 text-[16px] font-semibold text-ink">
                          {row.name}
                        </span>
                        {row.pro && (
                          <span className="rounded bg-eu-yellow px-1 py-[1px] text-[8px] font-medium text-eu-blue">
                            PRO
                          </span>
                        )}
                        {row.intl && (
                          <span className="text-[8px] font-medium text-ink-secondary">INT</span>
                        )}
                      </span>
                    </span>
                  </td>
                  <td className="py-6 pr-4 text-[15px] font-light text-ink-secondary">{row.profile}</td>
                  <td className="py-6 pr-4 text-[15px] text-ink-secondary">{row.awards}</td>
                  <td className="max-w-[280px] truncate py-6 pr-4 text-[15px] text-ink-secondary">
                    {row.categories}
                  </td>
                  <td className="py-6 text-right">
                    <a
                      href="#"
                      className="inline-block rounded-lg border border-line px-5 py-2.5 text-[13px] text-ink-secondary transition-colors hover:border-accent hover:text-ink"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionCta
          label="Connect with over 6,063 Agencies and Professionals"
          linkLabel="View Directory"
        />
      </Container>
    </section>
  );
}
