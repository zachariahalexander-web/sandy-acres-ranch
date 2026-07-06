"use client";

import { useActionState } from "react";
import { postMenuIdea, type PostMenuIdeaState } from "@/lib/actions/menu";

export default function MenuIdeaForm({ weekendId }: { weekendId: string }) {
  const action = postMenuIdea.bind(null, weekendId);
  const [state, formAction, pending] = useActionState<
    PostMenuIdeaState,
    FormData
  >(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="body"
        rows={3}
        placeholder="Taco bar Friday night? Bring-your-own-side potluck? Share an idea..."
        className="rounded border-2 border-wood/20 bg-white px-3 py-2 text-sm focus:border-rust focus:outline-none"
      />
      {state?.error && (
        <p className="rounded bg-rust/10 px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-rust px-5 py-2 text-sm font-bold uppercase tracking-wide text-cream hover:bg-leather disabled:opacity-60"
      >
        {pending ? "Posting..." : "Post Idea"}
      </button>
    </form>
  );
}
