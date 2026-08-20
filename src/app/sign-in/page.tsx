import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in — Democratic Pulse",
  description:
    "Sign in to Democratic Pulse to keep up with events, communities, and initiatives across Europe.",
};

export default function SignInPage() {
  return (
    <AuthLayout
      tag="Member sign in"
      heading="Welcome back"
      description="Sign in to keep up with the events, communities, and initiatives you follow."
      footer={
        <p className="text-[14px] text-ink-secondary">
          New to Democratic Pulse?{" "}
          <Link href="/sign-up" className="font-medium text-eu-blue hover:underline">
            Create account
          </Link>
        </p>
      }
    >
      <SignInForm />
    </AuthLayout>
  );
}
