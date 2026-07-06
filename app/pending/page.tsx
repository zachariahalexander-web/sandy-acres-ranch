import type { Metadata } from "next";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Awaiting Approval | Sandy Acres Ranch",
};

export default function PendingPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Your Profile Is Awaiting Approval
      </h1>
      <p className="mt-4 text-ink/80">
        Thanks for signing up and reviewing the waiver. An admin still needs
        to personally approve your account before you can book rooms,
        courts, the gym, or the yoga studio. You&rsquo;ll be able to sign in
        and use the portal as soon as that happens.
      </p>
      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="rounded-full border-2 border-wood-dark px-6 py-3 text-sm font-bold uppercase tracking-wide text-wood-dark transition-colors hover:bg-wood-dark hover:text-cream"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
