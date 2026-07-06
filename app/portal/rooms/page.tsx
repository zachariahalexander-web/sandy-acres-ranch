import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";
import CancelReservationButton from "@/components/cancel-reservation-button";

export const metadata: Metadata = {
  title: "Room Reservations | Sandy Acres Ranch",
};

export default async function RoomsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, description, bedrooms(id, name, max_occupancy)")
    .order("name");

  const { data: myReservationsRaw } = await supabase
    .from("room_reservations")
    .select("id, start_date, end_date, status, bedrooms(name, properties(name))")
    .eq("guest_id", user!.id)
    .eq("status", "confirmed")
    .order("start_date");

  const myReservations = myReservationsRaw as unknown as
    | {
        id: string;
        start_date: string;
        end_date: string;
        bedrooms: { name: string; properties: { name: string } };
      }[]
    | null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Room Reservations
      </h1>
      <p className="mt-2 text-ink/80">
        Pick a bedroom in the Main House or Guest House to reserve dates.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {(properties ?? []).map((property) => (
          <div
            key={property.id}
            className="rounded-lg border-2 border-wood/20 bg-white p-6"
          >
            <h2 className="font-head text-xl font-bold text-wood-dark">
              {property.name}
            </h2>
            <p className="mt-1 text-sm text-ink/70">{property.description}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {(property.bedrooms ?? []).map((bedroom) => (
                <li key={bedroom.id}>
                  <Link
                    href={`/portal/rooms/${bedroom.id}`}
                    className="flex items-center justify-between rounded border border-wood/10 px-3 py-2 text-sm hover:border-rust hover:text-rust"
                  >
                    <span>{bedroom.name}</span>
                    <span className="text-ink/50">
                      Sleeps {bedroom.max_occupancy}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-head text-xl font-bold text-wood-dark">
          My Reservations
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {(myReservations ?? []).length === 0 && (
            <p className="text-sm text-ink/60">No upcoming reservations.</p>
          )}
          {(myReservations ?? []).map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-wood/20 bg-white p-4"
            >
              <div>
                <p className="font-semibold text-wood-dark">
                  {r.bedrooms?.properties?.name} &mdash; {r.bedrooms?.name}
                </p>
                <p className="text-sm text-ink/70">
                  {r.start_date} &rarr; {r.end_date}
                </p>
              </div>
              <CancelReservationButton reservationId={r.id} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
