import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create account — Democratic Pulse",
  description:
    "Create a Democratic Pulse account to follow events, communities, and initiatives across Europe.",
};

export default function SignUpPage() {
  return (
    <AuthLayout
      tag="New member"
      heading="Create your account"
      description="Join Democratic Pulse to discover and take part in what’s happening across Europe."
      footer={
        <p className="text-[14px] text-ink-secondary">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-eu-blue hover:underline">
            Sign in instead
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthLayout>
  );
}
