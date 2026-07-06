import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/dal";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Guest Portal | Sandy Acres Ranch",
};

const HIGHLIGHTS = [
  {
    title: "Two Guest Houses",
    body: "The Main House and the Guest House, each with four bedrooms, ready for family and friends.",
    href: "/accommodations",
  },
  {
    title: "Pickleball Courts",
    body: "Two courts on-site, reservable by the hour.",
    href: "/activities",
  },
  {
    title: "Gym & Yoga Studio",
    body: "Start the morning with a workout or a sunrise stretch on the covered deck.",
    href: "/activities",
  },
  {
    title: "Firepit Evenings",
    body: "Wind down under the oaks with a fire, good company, and Florida sky.",
    href: "/activities",
  },
];

const BOOKING_TOOLS = [
  {
    title: "Room Reservations",
    body: "Book a bedroom in the Main House or Guest House.",
    href: "/portal/rooms",
  },
  {
    title: "Pickleball, Gym & Yoga",
    body: "Reserve courts, the gym, and the yoga studio by time slot.",
    href: "/portal/facilities",
  },
  {
    title: "Weekend Menu Board",
    body: "Trade menu ideas with guests staying the same weekend.",
    href: "/portal/menu-board",
  },
  {
    title: "Private Gallery",
    body: "Interior photos of both houses.",
    href: "/portal/gallery",
  },
];

export default async function PortalPage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        <Image
          src="/images/ranch-pond-sunset.jpg"
          alt="Sunset over the pond at Sandy Acres Ranch"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />
        <div className="relative mx-auto flex w-full max-w-6xl items-end justify-between gap-4 px-6 pb-12 text-cream">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-sand">
              Est. 1989 &middot; Punta Gorda, Florida
            </p>
            <h1 className="font-head text-3xl font-bold sm:text-5xl">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
            </h1>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border-2 border-cream px-4 py-2 text-sm font-semibold text-cream hover:bg-cream hover:text-wood-dark"
            >
              Sign Out
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Welcome to the Ranch</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink/80">
          Sandy Acres Ranch has been welcoming family, friends, and guests
          since 1989. Set on quiet acreage along Washington Loop Road, the
          ranch pairs the comfort of two full guest houses with the kind of
          amenities that make a weekend feel like a real getaway &mdash;
          pickleball, a gym and yoga studio, firepit evenings, and a pond that
          puts on a nightly show at sunset.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-center text-3xl font-bold text-wood-dark">
          Booking Tools
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BOOKING_TOOLS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-col rounded-lg border-2 border-wood/20 bg-white p-6 transition-colors hover:border-rust"
            >
              <h3 className="font-head text-xl font-bold text-wood-dark group-hover:text-rust">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-ink/80">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-sand py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">What&rsquo;s Here</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col rounded-lg border-2 border-wood/20 bg-cream p-6 transition-colors hover:border-rust"
              >
                <h3 className="font-head text-xl font-bold text-wood-dark group-hover:text-rust">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-ink/80">{item.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2">
        <div className="relative h-72 sm:h-96">
          <Image
            src="/images/ranch-yoga-deck.jpg"
            alt="Morning stretching on the covered deck at Sandy Acres Ranch"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative h-72 sm:h-96">
          <Image
            src="/images/ranch-campfire.jpg"
            alt="Firepit evening at Sandy Acres Ranch"
            fill
            className="object-cover"
          />
        </div>
      </section>
    </div>
  );
}
