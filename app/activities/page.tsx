import type { Metadata } from "next";
import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Activities | Sandy Acres Ranch",
};

const ACTIVITIES = [
  {
    name: "Pickleball Courts",
    description:
      "Two courts on the property, open to approved guests. Reserve a court for a specific day and time through the guest portal so games never overlap.",
  },
  {
    name: "Gym",
    description:
      "A private on-site gym for guests who want to keep up their routine during a stay. Book time slots through the guest portal.",
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
      "Staying the same weekend as other guests? Trade menu ideas for shared meals through the guest portal before you arrive.",
  },
];

export default function ActivitiesPage() {
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
      </section>
    </div>
  );
}
