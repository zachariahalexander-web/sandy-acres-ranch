"use client";

import { useActionState } from "react";
import { acceptWaiver } from "@/lib/actions/auth";

export default function WaiverAcceptForm() {
  const [state, action, pending] = useActionState(acceptWaiver, undefined);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-semibold text-wood-dark">
        Type your full legal name as your signature
        <input
          name="typed_signature_name"
          type="text"
          required
          minLength={2}
          className="rounded border-2 border-wood/20 bg-white px-3 py-2 text-base font-normal text-ink focus:border-rust focus:outline-none"
        />
      </label>

      <label className="flex items-start gap-3 text-sm text-ink/80">
        <input type="checkbox" name="agreed" className="mt-1 h-4 w-4" required />
        <span>
          I have read and understood the Release, Waiver of Liability,
          Assumption of Risk, and Indemnity Agreement above, and I agree to
          be bound by all of its terms.
        </span>
      </label>

      {state?.error && (
        <p className="rounded bg-rust/10 px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start rounded-full bg-rust px-6 py-3 text-sm font-bold uppercase tracking-wide text-cream transition-colors hover:bg-leather disabled:opacity-60"
      >
        {pending ? "Submitting..." : "I Agree, Continue"}
      </button>
    </form>
  );
}
