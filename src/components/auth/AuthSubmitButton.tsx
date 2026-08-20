import type { ButtonHTMLAttributes } from "react";
import { ArrowRightIcon, Spinner } from "./icons";

type AuthSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function AuthSubmitButton({
  loading = false,
  disabled,
  children,
  ...props
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      aria-busy={loading}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-eu-blue px-8 py-4 text-[15px] font-medium text-white shadow-card transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      {...props}
    >
      {loading ? (
        <Spinner className="size-4" />
      ) : (
        <>
          <span>{children}</span>
          <ArrowRightIcon />
        </>
      )}
    </button>
  );
}
