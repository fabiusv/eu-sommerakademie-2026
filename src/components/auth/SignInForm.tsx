"use client";

import { useState, type FormEvent } from "react";
import AuthForm, { type AuthFormStatus } from "./AuthForm";
import AuthField from "./AuthField";
import PasswordField from "./PasswordField";
import SocialAuthButton from "./SocialAuthButton";
import AuthSubmitButton from "./AuthSubmitButton";
import AuthStatusNotice from "./AuthStatusNotice";
import { validateEmail, validateRequiredPassword } from "@/lib/auth-validation";
import { mockAuthRequest } from "@/lib/auth-mock";

type FieldErrors = {
  email?: string;
  password?: string;
};

type SocialProvider = "google" | "apple";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<AuthFormStatus>("idle");
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const [socialNote, setSocialNote] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      password: validateRequiredPassword(password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setStatus("submitting");
    // Placeholder submission — swap for a real sign-in call once auth is connected.
    await mockAuthRequest({ email, password });
    setStatus("success");
  };

  const handleSocial = async (provider: SocialProvider) => {
    setSocialNote(null);
    setSocialLoading(provider);
    await mockAuthRequest({ provider });
    setSocialLoading(null);
    setSocialNote(
      `${provider === "google" ? "Google" : "Apple"} sign-in isn't connected yet — coming soon.`
    );
  };

  const reset = () => {
    setStatus("idle");
    setEmail("");
    setPassword("");
    setErrors({});
  };

  if (status === "success") {
    return (
      <AuthStatusNotice
        heading="Form submitted"
        description="This is a frontend preview — Democratic Pulse doesn't sign anyone in yet. Real authentication will be connected here."
        onReset={reset}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SocialAuthButton
          provider="google"
          onClick={() => handleSocial("google")}
          loading={socialLoading === "google"}
          disabled={socialLoading !== null}
        />
        <SocialAuthButton
          provider="apple"
          onClick={() => handleSocial("apple")}
          loading={socialLoading === "apple"}
          disabled={socialLoading !== null}
        />
      </div>

      {socialNote && (
        <p role="status" className="text-[13px] text-ink-muted">
          {socialNote}
        </p>
      )}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[12px] font-medium tracking-[0.06em] text-ink-muted uppercase">
          or
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <AuthForm onSubmit={handleSubmit} status={status} className="flex flex-col gap-5">
        <AuthField
          id="sign-in-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            const value = event.target.value;
            setEmail(value);
            setErrors((prev) => (prev.email ? { ...prev, email: validateEmail(value) } : prev));
          }}
          error={errors.email}
          required
        />

        <div>
          <PasswordField
            id="sign-in-password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              const value = event.target.value;
              setPassword(value);
              setErrors((prev) =>
                prev.password ? { ...prev, password: validateRequiredPassword(value) } : prev
              );
            }}
            error={errors.password}
            required
          />
          <div className="mt-2 text-right">
            <a
              href="#"
              className="text-[13px] font-medium text-eu-blue transition-colors hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <AuthSubmitButton loading={status === "submitting"}>Sign in</AuthSubmitButton>
      </AuthForm>
    </div>
  );
}
