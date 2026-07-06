import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import FacilitySlotGrid from "@/components/facility-slot-grid";

export const metadata: Metadata = {
  title: "Reserve a Slot | Sandy Acres Ranch",
};

export default async function FacilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ facilityId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { facilityId } = await params;
  const { date } = await searchParams;

  const today = startOfDay(new Date());
  const selectedDate = date ? startOfDay(parseISO(date)) : today;
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = format(selectedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  const prevDate = format(addDays(selectedDate, -1), "yyyy-MM-dd");
  const nextDate = format(addDays(selectedDate, 1), "yyyy-MM-dd");

  const supabase = await createClient();

  const { data: facility } = await supabase
    .from("facilities")
    .select("id, name, type")
    .eq("id", facilityId)
    .single();

  if (!facility) {
    notFound();
  }

  const { data: bookings } = await supabase
    .from("facility_bookings")
    .select("slot_index")
    .eq("facility_id", facilityId)
    .eq("booking_date", dateStr)
    .eq("status", "confirmed");

  const bookedSlots = (bookings ?? []).map((b) => b.slot_index);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        {facility.name}
      </h1>

      <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border-2 border-wood/20 bg-white px-4 py-3 sm:flex-row sm:justify-between sm:gap-0">
        <span className="font-head text-lg font-bold text-wood-dark">
          {format(selectedDate, "EEEE, MMM d, yyyy")}
        </span>
        <div className="flex w-full items-center justify-between sm:w-auto sm:gap-4">
          {isToday ? (
            <span className="text-sm text-ink/30">&larr; Previous Day</span>
          ) : (
            <Link
              href={`/activities/${facilityId}?date=${prevDate}`}
              className="text-sm font-semibold text-wood-dark hover:text-rust"
            >
              &larr; Previous Day
            </Link>
          )}
          <Link
            href={`/activities/${facilityId}?date=${nextDate}`}
            className="text-sm font-semibold text-wood-dark hover:text-rust"
          >
            Next Day &rarr;
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <FacilitySlotGrid
          facilityId={facilityId}
          bookingDate={dateStr}
          bookedSlots={bookedSlots}
        />
      </div>
    </div>
  );
}
