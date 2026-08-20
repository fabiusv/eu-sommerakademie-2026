export default function SectionEyebrow({
  index,
  label,
  align = "left",
}: {
  index: string;
  label: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
      <span className="text-[13px] font-semibold tracking-[0.08em] text-eu-blue">{index}</span>
      <span className="h-px w-8 bg-line" />
      <span className="text-[13px] font-medium tracking-[0.04em] text-ink-secondary uppercase">
        {label}
      </span>
    </div>
  );
}
