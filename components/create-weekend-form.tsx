"use client";

import { useActionState } from "react";
import { createWeekend, type CreateWeekendState } from "@/lib/actions/admin";

export default function CreateWeekendForm() {
  const [state, formAction, pending] = useActionState<
    CreateWeekendState,
    FormData
  >(createWeekend, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm font-semibold text-wood-dark">
        Label
        <input
          name="label"
          type="text"
          placeholder="July 4th Weekend"
          required
          className="rounded border-2 border-wood/20 bg-white px-3 py-2 text-base font-normal text-ink focus:border-rust focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-wood-dark">
        Start Date
        <input
          name="start_date"
          type="date"
          required
          className="rounded border-2 border-wood/20 bg-white px-3 py-2 text-base font-normal text-ink focus:border-rust focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-wood-dark">
        End Date
        <input
          name="end_date"
          type="date"
          required
          className="rounded border-2 border-wood/20 bg-white px-3 py-2 text-base font-normal text-ink focus:border-rust focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-rust px-5 py-2 text-sm font-bold uppercase tracking-wide text-cream hover:bg-leather disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add Weekend"}
      </button>
      {state?.error && (
        <p className="w-full rounded bg-rust/10 px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}
    </form>
  );
}
