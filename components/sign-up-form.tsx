"use client";

import { useActionState } from "react";
import { signUp } from "@/lib/actions/auth";

export default function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, undefined);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <Field label="Full Name" name="full_name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required minLength={8} />
      <Field label="Phone" name="phone" type="tel" />
      <Field label="Address" name="address_line1" />
      <div className="grid grid-cols-3 gap-3">
        <Field label="City" name="city" />
        <Field label="State" name="state" />
        <Field label="ZIP" name="postal_code" />
      </div>

      {state?.error && (
        <p className="rounded bg-rust/10 px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p className="rounded bg-sage/10 px-3 py-2 text-sm text-sage-dark">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-wood-dark px-6 py-3 text-sm font-bold uppercase tracking-wide text-cream transition-colors hover:bg-rust disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create Profile"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-wood-dark">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        className="rounded border-2 border-wood/20 bg-white px-3 py-2 text-base font-normal text-ink focus:border-rust focus:outline-none"
      />
    </label>
  );
}
