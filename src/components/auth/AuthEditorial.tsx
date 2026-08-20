import EuOrbitStars from "@/components/home/EuOrbitStars";

export default function AuthEditorial({ tag }: { tag: string }) {
  return (
    <div className="relative isolate flex flex-col justify-center overflow-hidden rounded-[28px] bg-eu-blue px-6 py-12 text-white sm:px-10 sm:py-14 lg:min-h-[clamp(560px,46vw,760px)] lg:px-12 lg:py-16 xl:px-14 xl:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Two fixed breakpoint-scoped instances (rather than one vw-scaled radius) so the
            compact mobile/tablet panel keeps its original, already-tuned star spread
            untouched, and only the lg+ panel — which is genuinely taller — gets the wider
            orbit needed to fill it. */}
        <div className="lg:hidden">
          <EuOrbitStars radius="clamp(90px, 16vw, 180px)" />
        </div>
        <div className="hidden lg:block">
          <EuOrbitStars radius="clamp(180px, 22vw, 290px)" />
        </div>
      </div>

      <div className="auth-fade-in relative z-10" style={{ animationDelay: "0ms" }}>
        <p className="text-[12px] font-medium tracking-[0.08em] text-white/60 uppercase">{tag}</p>
        <h2 className="mt-3 max-w-[440px] text-[26px] font-semibold leading-[1.15] tracking-tight sm:text-[30px] lg:mt-4 lg:text-[clamp(28px,2.2vw,38px)]">
          Europe starts with people showing up.
        </h2>
        <p className="mt-4 max-w-[400px] text-[15px] leading-[1.6] text-white/70 lg:mt-5 lg:text-[16px]">
          Democratic Pulse follows the events, communities, and initiatives where that happens —
          one city at a time.
        </p>
      </div>
    </div>
  );
}
