import type { Metadata } from "next";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Access Revoked | Sandy Acres Ranch",
};

export default function RevokedPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Access Has Been Revoked
      </h1>
      <p className="mt-4 text-ink/80">
        Your booking access is no longer active. If you believe this is a
        mistake, please contact the ranch directly.
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
