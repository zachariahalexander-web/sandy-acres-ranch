import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/page-hero";

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

export default function AccommodationsPage() {
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

        <div className="mt-12 rounded-lg bg-sand p-8 text-center">
          <h3 className="font-head text-xl font-bold text-wood-dark">
            Booking a room
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-ink/80">
            Specific bedrooms in the Main House and Guest House are reserved
            by date through the guest portal, once your profile has been
            approved by the ranch admin. This keeps every stay conflict-free
            &mdash; no two guests are ever booked into the same room on
            overlapping dates.
          </p>
        </div>
      </section>
    </div>
  );
}
