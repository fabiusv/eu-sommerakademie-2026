import { CheckIcon } from "./icons";

export default function AuthStatusNotice({
  heading,
  description,
  onReset,
}: {
  heading: string;
  description: string;
  onReset: () => void;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-start gap-4 rounded-[20px] border border-line bg-surface p-6"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-eu-blue/10 text-eu-blue">
        <CheckIcon />
      </span>
      <div>
        <p className="text-[16px] font-semibold text-ink">{heading}</p>
        <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-secondary">{description}</p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="text-[13px] font-medium text-eu-blue transition-colors hover:underline"
      >
        Back to form
      </button>
    </div>
  );
}
