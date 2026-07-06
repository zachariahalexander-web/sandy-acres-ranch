"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cancelRoomReservation } from "@/lib/actions/rooms";

export default function CancelReservationButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await cancelRoomReservation(reservationId);
          router.refresh();
        })
      }
      className="rounded-full border-2 border-rust px-4 py-2 text-sm font-semibold text-rust hover:bg-rust hover:text-cream disabled:opacity-60"
    >
      Cancel
    </button>
  );
}
