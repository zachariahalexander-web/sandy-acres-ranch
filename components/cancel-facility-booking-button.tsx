"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cancelFacilityBooking } from "@/lib/actions/facilities";

export default function CancelFacilityBookingButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await cancelFacilityBooking(bookingId);
          router.refresh();
        })
      }
      className="rounded-full border-2 border-rust px-4 py-2 text-sm font-semibold text-rust hover:bg-rust hover:text-cream disabled:opacity-60"
    >
      Cancel
    </button>
  );
}
