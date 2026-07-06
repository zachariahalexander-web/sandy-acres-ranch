"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteMenuIdea } from "@/lib/actions/menu";

export default function DeleteMenuIdeaButton({
  ideaId,
  weekendId,
}: {
  ideaId: string;
  weekendId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteMenuIdea(ideaId, weekendId);
          router.refresh();
        })
      }
      className="text-xs font-semibold uppercase tracking-wide text-ink/40 hover:text-rust disabled:opacity-60"
    >
      Delete
    </button>
  );
}
