export default function SectionCta({
  label,
  linkLabel,
}: {
  label: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 pt-10 text-center lg:pt-14">
      <p className="text-[15px] font-light text-ink-secondary lg:text-[17px]">{label}</p>
      <a
        href="#"
        className="group inline-flex items-center gap-2 text-[13px] font-semibold text-ink transition-colors hover:text-accent lg:text-[14px]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0"
          aria-hidden
        >
          <path
            d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="border-b border-current/30 pb-0.5 transition-colors">{linkLabel}</span>
      </a>
    </div>
  );
}
