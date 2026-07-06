"use client";

import { useActionState, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";
import { reserveRoom, type ReserveRoomState } from "@/lib/actions/rooms";

export default function RoomBookingCalendar({
  bedroomId,
  bookedRanges,
}: {
  bedroomId: string;
  bookedRanges: { from: string; to: string }[];
}) {
  const [range, setRange] = useState<DateRange | undefined>();
  const action = reserveRoom.bind(null, bedroomId);
  const [state, formAction, pending] = useActionState<
    ReserveRoomState,
    FormData
  >(action, undefined);

  const disabled = [
    { before: new Date() },
    ...bookedRanges.map((r) => ({
      from: new Date(r.from),
      to: new Date(r.to),
    })),
  ];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        disabled={disabled}
        excludeDisabled
        className="rounded-lg border-2 border-wood/20 bg-white p-4"
      />

      <input
        type="hidden"
        name="start_date"
        value={range?.from ? format(range.from, "yyyy-MM-dd") : ""}
      />
      <input
        type="hidden"
        name="end_date"
        value={range?.to ? format(range.to, "yyyy-MM-dd") : ""}
      />

      {range?.from && range?.to && (
        <p className="text-sm text-ink/80">
          {format(range.from, "MMM d, yyyy")} &rarr;{" "}
          {format(range.to, "MMM d, yyyy")}
        </p>
      )}

      {state?.error && (
        <p className="rounded bg-rust/10 px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !range?.from || !range?.to}
        className="self-start rounded-full bg-rust px-6 py-3 text-sm font-bold uppercase tracking-wide text-cream transition-colors hover:bg-leather disabled:opacity-60"
      >
        {pending ? "Booking..." : "Reserve These Dates"}
      </button>
    </form>
  );
}
