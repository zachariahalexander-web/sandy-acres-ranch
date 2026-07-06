"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";

export default function SignInForm() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-semibold text-wood-dark">
        Email
        <input
          name="email"
          type="email"
          required
          className="rounded border-2 border-wood/20 bg-white px-3 py-2 text-base font-normal text-ink focus:border-rust focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-wood-dark">
        Password
        <input
          name="password"
          type="password"
          required
          className="rounded border-2 border-wood/20 bg-white px-3 py-2 text-base font-normal text-ink focus:border-rust focus:outline-none"
        />
      </label>

      {state?.error && (
        <p className="rounded bg-rust/10 px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-wood-dark px-6 py-3 text-sm font-bold uppercase tracking-wide text-cream transition-colors hover:bg-rust disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
