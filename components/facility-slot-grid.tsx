"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bookFacilitySlot } from "@/lib/actions/facilities";
import { SLOT_INDICES, slotLabel } from "@/lib/slots";

export default function FacilitySlotGrid({
  facilityId,
  bookingDate,
  bookedSlots,
}: {
  facilityId: string;
  bookingDate: string;
  bookedSlots: number[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleBook(slotIndex: number) {
    setError(null);
    startTransition(async () => {
      const result = await bookFacilitySlot(facilityId, bookingDate, slotIndex);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded bg-rust/10 px-3 py-2 text-sm text-rust">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SLOT_INDICES.map((slotIndex) => {
          const booked = bookedSlots.includes(slotIndex);
          return (
            <button
              key={slotIndex}
              type="button"
              disabled={booked || isPending}
              onClick={() => handleBook(slotIndex)}
              className={`rounded-lg border-2 px-3 py-3 text-sm font-semibold transition-colors ${
                booked
                  ? "cursor-not-allowed border-wood/10 bg-sand text-ink/30"
                  : "border-wood/20 bg-white text-wood-dark hover:border-rust hover:text-rust"
              }`}
            >
              {slotLabel(slotIndex)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
