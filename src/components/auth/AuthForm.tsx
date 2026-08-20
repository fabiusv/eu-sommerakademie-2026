import type { FormEvent, ReactNode } from "react";

export type AuthFormStatus = "idle" | "submitting" | "success";

export default function AuthForm({
  onSubmit,
  status,
  children,
  className = "",
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status: AuthFormStatus;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form noValidate onSubmit={onSubmit} aria-busy={status === "submitting"} className={className}>
      <fieldset disabled={status === "submitting"} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
