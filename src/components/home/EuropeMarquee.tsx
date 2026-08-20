import PulseMark from "./PulseMark";

const phrases = [
  "Built across borders",
  "Communities shaping Europe",
  "Ideas that move Europe forward",
  "Local action, shared future",
  "Open cities, open minds",
  "Participation starts here",
  "Europe grows through people",
  "Rooted locally, connected across Europe",
];

function Phrase({ text }: { text: string }) {
  return (
    <span className="flex shrink-0 items-center gap-12 whitespace-nowrap lg:gap-16">
      <span className="text-[15px] font-medium text-ink lg:text-[clamp(17px,calc(0.18vw_+_14.4px),19px)]">{text}</span>
      <PulseMark className="size-1.5 shrink-0 text-eu-blue/40" />
    </span>
  );
}

export default function EuropeMarquee() {
  return (
    <section className="group overflow-hidden border-y border-line bg-page py-6 lg:py-7">
      <div className="marquee-mask flex">
        <div className="flex w-max shrink-0 animate-marquee items-center gap-12 group-hover:[animation-play-state:paused] motion-reduce:animate-none lg:gap-16">
          {phrases.map((phrase) => (
            <Phrase key={phrase} text={phrase} />
          ))}
          <div aria-hidden className="contents motion-reduce:hidden">
            {phrases.map((phrase) => (
              <Phrase key={`dup-${phrase}`} text={phrase} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
