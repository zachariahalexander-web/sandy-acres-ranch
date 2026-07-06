import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { slotLabel } from "@/lib/slots";

export const metadata: Metadata = {
  title: "All Reservations | Sandy Acres Ranch",
};

type RoomReservation = {
  id: string;
  start_date: string;
  end_date: string;
  status: "confirmed" | "cancelled";
  bedrooms: { name: string; properties: { name: string } };
  profiles: { full_name: string; email: string | null };
};

type FacilityBooking = {
  id: string;
  booking_date: string;
  slot_index: number;
  status: "confirmed" | "cancelled";
  facilities: { name: string; type: string };
  profiles: { full_name: string; email: string | null };
};

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-sage/10 text-sage-dark",
  cancelled: "bg-ink/10 text-ink/60",
};

export default async function AdminReservationsPage() {
  const supabase = await createClient();

  const { data: roomReservationsRaw } = await supabase
    .from("room_reservations")
    .select(
      "id, start_date, end_date, status, bedrooms(name, properties(name)), profiles(full_name, email)"
    )
    .order("start_date", { ascending: false });

  const { data: facilityBookingsRaw } = await supabase
    .from("facility_bookings")
    .select(
      "id, booking_date, slot_index, status, facilities(name, type), profiles(full_name, email)"
    )
    .order("booking_date", { ascending: false });

  const roomReservations = roomReservationsRaw as unknown as RoomReservation[] | null;
  const facilityBookings = facilityBookingsRaw as unknown as FacilityBooking[] | null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        All Reservations
      </h1>
      <p className="mt-2 text-ink/80">
        Every room reservation and facility booking, including cancelled ones.
      </p>

      <section className="mt-10">
        <h2 className="font-head text-xl font-bold text-wood-dark">
          Room Reservations ({(roomReservations ?? []).length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {(roomReservations ?? []).length === 0 && (
            <p className="text-sm text-ink/60">No room reservations yet.</p>
          )}
          {(roomReservations ?? []).map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-wood/20 bg-white p-4"
            >
              <div>
                <p className="font-semibold text-wood-dark">
                  {r.profiles?.full_name}{" "}
                  <span className="font-normal text-ink/60">
                    {r.profiles?.email}
                  </span>
                </p>
                <p className="text-sm text-ink/70">
                  {r.bedrooms?.properties?.name} &mdash; {r.bedrooms?.name}
                </p>
                <p className="text-sm text-ink/70">
                  {r.start_date} &rarr; {r.end_date}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[r.status]}`}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-head text-xl font-bold text-wood-dark">
          Facility Bookings ({(facilityBookings ?? []).length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {(facilityBookings ?? []).length === 0 && (
            <p className="text-sm text-ink/60">No facility bookings yet.</p>
          )}
          {(facilityBookings ?? []).map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-wood/20 bg-white p-4"
            >
              <div>
                <p className="font-semibold text-wood-dark">
                  {b.profiles?.full_name}{" "}
                  <span className="font-normal text-ink/60">
                    {b.profiles?.email}
                  </span>
                </p>
                <p className="text-sm text-ink/70">{b.facilities?.name}</p>
                <p className="text-sm text-ink/70">
                  {b.booking_date} &middot; {slotLabel(b.slot_index)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[b.status]}`}
              >
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
