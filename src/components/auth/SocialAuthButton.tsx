import type { ReactNode } from "react";
import { AppleIcon, GoogleIcon, Spinner } from "./icons";

type Provider = "google" | "apple";

const LABEL: Record<Provider, string> = {
  google: "Continue with Google",
  apple: "Continue with Apple",
};

const ICON: Record<Provider, ReactNode> = {
  google: <GoogleIcon />,
  apple: <AppleIcon />,
};

export default function SocialAuthButton({
  provider,
  onClick,
  loading = false,
  disabled = false,
}: {
  provider: Provider;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-line bg-surface px-5 py-3.5 text-[14px] font-medium text-ink transition-all duration-200 hover:border-eu-blue/40 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Spinner className="size-4 text-ink-muted" /> : ICON[provider]}
      <span>{LABEL[provider]}</span>
    </button>
  );
}
