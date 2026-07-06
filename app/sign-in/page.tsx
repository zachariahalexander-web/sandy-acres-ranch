import type { Metadata } from "next";
import Link from "next/link";
import SignInForm from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | Sandy Acres Ranch",
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Sign In
      </h1>
      <p className="mt-2 text-ink/80">
        Sign in to book rooms, courts, the gym, and the yoga studio.
      </p>
      <SignInForm />
      <p className="mt-6 text-sm text-ink/70">
        New to the ranch?{" "}
        <Link href="/sign-up" className="font-semibold text-rust">
          Create a profile
        </Link>
      </p>
    </div>
  );
}
