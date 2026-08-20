import type { InputHTMLAttributes } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

export default function AuthField({ id, label, error, className = "", ...props }: AuthFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-ink-secondary">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-2xl border bg-page-secondary px-4 py-3.5 text-[15px] text-ink outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-transparent focus:border-eu-blue"
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-[13px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
