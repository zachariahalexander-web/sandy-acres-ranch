import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/dal";
import { slotLabel } from "@/lib/slots";
import CancelFacilityBookingButton from "@/components/cancel-facility-booking-button";

export const metadata: Metadata = {
  title: "Activities | Sandy Acres Ranch",
};

const ACTIVITIES = [
  {
    name: "Pickleball Courts",
    description:
      "Two courts on the property, open to approved guests. Reserve a court for a specific day and time so games never overlap.",
  },
  {
    name: "Gym",
    description:
      "A private on-site gym for guests who want to keep up their routine during a stay. Book time slots below.",
  },
  {
    name: "Yoga Studio",
    description:
      "A covered, open-air deck set up for yoga and stretching, looking out over the grounds. Reserve a slot for a solo practice or a small group.",
  },
  {
    name: "Firepit Evenings",
    description:
      "A stone firepit under the oak trees is the natural gathering spot once the sun goes down — bring a chair and stay a while.",
  },
  {
    name: "Pond & Grounds",
    description:
      "Quiet water, wide sky, and Spanish moss draped over old oaks. The pond is at its best right around sunset.",
  },
  {
    name: "Weekend Menu Board",
    description:
      "Staying the same weekend as other guests? Trade menu ideas for shared meals below.",
  },
];

const TYPE_LABELS: Record<string, string> = {
  pickleball: "Pickleball",
  gym: "Gym",
  yoga: "Yoga",
};

type MyBooking = {
  id: string;
  booking_date: string;
  slot_index: number;
  facilities: { name: string };
};

export default async function ActivitiesPage() {
  const profile = await getCurrentProfile();
  const isApproved = profile?.status === "approved" || profile?.role === "admin";

  let facilities: { id: string; name: string; type: string }[] = [];
  let myBookings: MyBooking[] = [];
  let weekends: { id: string; label: string; start_date: string; end_date: string }[] = [];

  if (isApproved) {
    const supabase = await createClient();
    const user = await getCurrentUser();

    const { data: facilitiesData } = await supabase
      .from("facilities")
      .select("id, name, type")
      .order("type")
      .order("name");
    facilities = facilitiesData ?? [];

    const { data: myBookingsRaw } = await supabase
      .from("facility_bookings")
      .select("id, booking_date, slot_index, facilities(name)")
      .eq("guest_id", user!.id)
      .eq("status", "confirmed")
      .order("booking_date");
    myBookings = (myBookingsRaw as unknown as MyBooking[]) ?? [];

    const { data: weekendsData } = await supabase
      .from("weekends")
      .select("id, label, start_date, end_date")
      .order("start_date");
    weekends = weekendsData ?? [];
  }

  return (
    <div>
      <PageHero
        title="Activities"
        subtitle="Plenty to do, and just as much room to do nothing at all."
        image="/images/ranch-campfire.jpg"
        alt="Firepit at Sandy Acres Ranch"
      />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2">
          {ACTIVITIES.map((activity) => (
            <div
              key={activity.name}
              className="rounded-lg border-2 border-wood/20 bg-white p-6"
            >
              <h2 className="font-head text-2xl font-bold text-wood-dark">
                {activity.name}
              </h2>
              <p className="mt-2 text-ink/80">{activity.description}</p>
            </div>
          ))}
        </div>

        {isApproved ? (
          <>
            <div className="mt-16">
              <h2 className="font-head text-2xl font-bold text-wood-dark">
                Reserve a Time Slot
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {facilities.map((facility) => (
                  <Link
                    key={facility.id}
                    href={`/activities/${facility.id}`}
                    className="rounded-lg border-2 border-wood/20 bg-white p-6 hover:border-rust"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-rust">
                      {TYPE_LABELS[facility.type] ?? facility.type}
                    </p>
                    <h3 className="mt-1 font-head text-xl font-bold text-wood-dark">
                      {facility.name}
                    </h3>
                  </Link>
                ))}
                <Link
                  href="/activities/menu-board"
                  className="rounded-lg border-2 border-wood/20 bg-white p-6 hover:border-rust"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-rust">
                    Weekends
                  </p>
                  <h3 className="mt-1 font-head text-xl font-bold text-wood-dark">
                    Weekend Menu Board
                  </h3>
                </Link>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="font-head text-2xl font-bold text-wood-dark">
                My Bookings
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {myBookings.length === 0 && (
                  <p className="text-sm text-ink/60">No upcoming bookings.</p>
                )}
                {myBookings.map((b) => (
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
            </div>

            {weekends.length === 0 && (
              <p className="mt-4 text-sm text-ink/60">
                No shared weekends yet &mdash; the menu board shows up once
                you have a room reservation that overlaps a weekend the admin
                has set up.
              </p>
            )}
          </>
        ) : (
          <div className="mt-12 rounded-lg bg-sand p-8 text-center">
            <h3 className="font-head text-xl font-bold text-wood-dark">
              Court, gym, and studio bookings are for approved guests
            </h3>
            <p className="mt-2 text-ink/80">
              Create a guest profile, sign the ranch waiver, and once an admin
              approves your account you&rsquo;ll be able to reserve courts,
              gym and yoga slots, and bedrooms in either house.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
