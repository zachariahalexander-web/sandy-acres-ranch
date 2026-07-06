import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoomBookingCalendar from "@/components/room-booking-calendar";

export const metadata: Metadata = {
  title: "Reserve a Room | Sandy Acres Ranch",
};

export default async function BedroomPage({
  params,
}: {
  params: Promise<{ bedroomId: string }>;
}) {
  const { bedroomId } = await params;
  const supabase = await createClient();

  const { data: bedroomRaw } = await supabase
    .from("bedrooms")
    .select("id, name, max_occupancy, properties(name)")
    .eq("id", bedroomId)
    .single();

  if (!bedroomRaw) {
    notFound();
  }

  const bedroom = bedroomRaw as unknown as {
    id: string;
    name: string;
    max_occupancy: number;
    properties: { name: string };
  };

  const { data: existing } = await supabase
    .from("room_reservations")
    .select("start_date, end_date")
    .eq("bedroom_id", bedroomId)
    .eq("status", "confirmed");

  const bookedRanges = (existing ?? []).map((r) => ({
    from: r.start_date,
    to: r.end_date,
  }));

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        {bedroom.properties?.name} &mdash; {bedroom.name}
      </h1>
      <p className="mt-2 text-ink/80">
        Sleeps {bedroom.max_occupancy}. Select your check-in and check-out
        dates below &mdash; already-booked dates are disabled.
      </p>

      <div className="mt-8">
        <RoomBookingCalendar bedroomId={bedroomId} bookedRanges={bookedRanges} />
      </div>
    </div>
  );
}
