export default function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-4"
    >
      <span className="text-[14.5px] font-medium text-ink">{label}</span>
      <span
        aria-hidden
        className={`relative h-6 w-10 shrink-0 rounded-full border transition-colors duration-200 ${
          checked ? "border-eu-blue bg-eu-blue" : "border-line bg-page-secondary"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4.5 rounded-full bg-white shadow-card transition-transform duration-200 ${
            checked ? "translate-x-[19px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
