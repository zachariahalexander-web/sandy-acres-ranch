import type { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "@/components/sign-up-form";

export const metadata: Metadata = {
  title: "Create a Profile | Sandy Acres Ranch",
};

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Create Your Guest Profile
      </h1>
      <p className="mt-2 text-ink/80">
        After you sign up, you&rsquo;ll review and accept the ranch waiver.
        An admin then reviews your account before booking access is turned
        on.
      </p>
      <SignUpForm />
      <p className="mt-6 text-sm text-ink/70">
        Already have a profile?{" "}
        <Link href="/sign-in" className="font-semibold text-rust">
          Sign in
        </Link>
      </p>
    </div>
  );
}
