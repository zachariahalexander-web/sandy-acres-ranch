import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";
import { slotLabel } from "@/lib/slots";
import CancelFacilityBookingButton from "@/components/cancel-facility-booking-button";

export const metadata: Metadata = {
  title: "Pickleball, Gym & Yoga | Sandy Acres Ranch",
};

const TYPE_LABELS: Record<string, string> = {
  pickleball: "Pickleball",
  gym: "Gym",
  yoga: "Yoga",
};

export default async function FacilitiesPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: facilities } = await supabase
    .from("facilities")
    .select("id, name, type")
    .order("type")
    .order("name");

  const { data: myBookingsRaw } = await supabase
    .from("facility_bookings")
    .select("id, booking_date, slot_index, facilities(name)")
    .eq("guest_id", user!.id)
    .eq("status", "confirmed")
    .order("booking_date");

  const myBookings = myBookingsRaw as unknown as
    | {
        id: string;
        booking_date: string;
        slot_index: number;
        facilities: { name: string };
      }[]
    | null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Pickleball, Gym &amp; Yoga
      </h1>
      <p className="mt-2 text-ink/80">
        Pick a facility and reserve an hourly slot, 8am&ndash;8pm.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(facilities ?? []).map((facility) => (
          <Link
            key={facility.id}
            href={`/portal/facilities/${facility.id}`}
            className="rounded-lg border-2 border-wood/20 bg-white p-6 hover:border-rust"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-rust">
              {TYPE_LABELS[facility.type] ?? facility.type}
            </p>
            <h2 className="mt-1 font-head text-xl font-bold text-wood-dark">
              {facility.name}
            </h2>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-head text-xl font-bold text-wood-dark">
          My Bookings
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {(myBookings ?? []).length === 0 && (
            <p className="text-sm text-ink/60">No upcoming bookings.</p>
          )}
          {(myBookings ?? []).map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-wood/20 bg-white p-4"
            >
              <div>
                <p className="font-semibold text-wood-dark">
                  {b.facilities?.name}
                </p>
                <p className="text-sm text-ink/70">
                  {b.booking_date} &middot; {slotLabel(b.slot_index)}
                </p>
              </div>
              <CancelFacilityBookingButton bookingId={b.id} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
