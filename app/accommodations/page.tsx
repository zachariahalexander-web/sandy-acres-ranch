import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/dal";
import CancelReservationButton from "@/components/cancel-reservation-button";

export const metadata: Metadata = {
  title: "Accommodations | Sandy Acres Ranch",
};

const HOUSES = [
  {
    name: "Main House",
    description:
      "Four bedrooms in the heart of the property, close to the firepit and the pond. A comfortable home base for a family group or a mixed party of friends.",
    image: "/images/ranch-suv-sunset.jpg",
  },
  {
    name: "Guest House",
    description:
      "A second four-bedroom house nearby, ideal for a second family or a larger group splitting across both homes for the weekend.",
    image: "/images/ranch-yoga-deck.jpg",
  },
];

type MyReservation = {
  id: string;
  start_date: string;
  end_date: string;
  bedrooms: { name: string; properties: { name: string } };
};

export default async function AccommodationsPage() {
  const profile = await getCurrentProfile();
  const isApproved = profile?.status === "approved" || profile?.role === "admin";

  let properties: { id: string; name: string; description: string | null; bedrooms: { id: string; name: string; max_occupancy: number }[] }[] = [];
  let myReservations: MyReservation[] = [];

  if (isApproved) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    const { data: propertiesData } = await supabase
      .from("properties")
      .select("id, name, description, bedrooms(id, name, max_occupancy)")
      .order("name");
    properties = propertiesData ?? [];

    const { data: myReservationsRaw } = await supabase
      .from("room_reservations")
      .select("id, start_date, end_date, status, bedrooms(name, properties(name))")
      .eq("guest_id", user!.id)
      .eq("status", "confirmed")
      .order("start_date");
    myReservations = (myReservationsRaw as unknown as MyReservation[]) ?? [];
  }

  return (
    <div>
      <PageHero
        title="Accommodations"
        subtitle="Two houses, eight bedrooms, room for everyone."
        image="/images/ranch-suv-sunset.jpg"
        alt="Evening at Sandy Acres Ranch"
      />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2">
          {HOUSES.map((house) => (
            <div
              key={house.name}
              className="overflow-hidden rounded-lg border-2 border-wood/20 bg-white"
            >
              <div className="relative h-56">
                <Image
                  src={house.image}
                  alt={house.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="font-head text-2xl font-bold text-wood-dark">
                  {house.name}
                </h2>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-rust">
                  4 Bedrooms
                </p>
                <p className="mt-3 text-ink/80">{house.description}</p>
              </div>
            </div>
          ))}
        </div>

        {isApproved ? (
          <>
            <div className="mt-16">
              <h2 className="font-head text-2xl font-bold text-wood-dark">
                Reserve a Bedroom
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="rounded-lg border-2 border-wood/20 bg-white p-6"
                  >
                    <h3 className="font-head text-xl font-bold text-wood-dark">
                      {property.name}
                    </h3>
                    <ul className="mt-4 flex flex-col gap-2">
                      {(property.bedrooms ?? []).map((bedroom) => (
                        <li key={bedroom.id}>
                          <Link
                            href={`/accommodations/${bedroom.id}`}
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
            </div>

            <div className="mt-12">
              <h2 className="font-head text-2xl font-bold text-wood-dark">
                My Reservations
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {myReservations.length === 0 && (
                  <p className="text-sm text-ink/60">
                    No upcoming reservations.
                  </p>
                )}
                {myReservations.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-wood/20 bg-white p-4"
                  >
                    <div>
                      <p className="font-semibold text-wood-dark">
                        {r.bedrooms?.properties?.name} &mdash;{" "}
                        {r.bedrooms?.name}
                      </p>
                      <p className="text-sm text-ink/70">
                        {r.start_date} &rarr; {r.end_date}
                      </p>
                    </div>
                    <CancelReservationButton reservationId={r.id} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-lg bg-sand p-8 text-center">
            <h3 className="font-head text-xl font-bold text-wood-dark">
              Booking a room
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-ink/80">
              Specific bedrooms in the Main House and Guest House are reserved
              by date once your profile has been approved by the ranch admin.
              This keeps every stay conflict-free &mdash; no two guests are
              ever booked into the same room on overlapping dates.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
