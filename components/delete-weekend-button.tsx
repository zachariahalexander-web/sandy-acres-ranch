"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteWeekend } from "@/lib/actions/admin";

export default function DeleteWeekendButton({
  weekendId,
}: {
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
          await deleteWeekend(weekendId);
          router.refresh();
        })
      }
      className="rounded-full border-2 border-rust px-4 py-2 text-sm font-semibold text-rust hover:bg-rust hover:text-cream disabled:opacity-60"
    >
      Delete
    </button>
  );
}
