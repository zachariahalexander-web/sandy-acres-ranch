import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Gallery | Sandy Acres Ranch",
};

const PHOTOS = [
  { src: "/images/ranch-pond-sunset.jpg", alt: "Sunset over the pond" },
  { src: "/images/ranch-suv-sunset.jpg", alt: "Evening at the ranch" },
  { src: "/images/ranch-yoga-deck.jpg", alt: "Morning stretching on the deck" },
  { src: "/images/ranch-campfire.jpg", alt: "Firepit gathering" },
];

const COMING_SOON_COUNT = 2;

export default function GalleryPage() {
  return (
    <div>
      <PageHero
        title="Gallery"
        subtitle="A few favorite moments from the ranch."
        image="/images/ranch-yoga-deck.jpg"
        alt="Sandy Acres Ranch"
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PHOTOS.map((photo) => (
            <div key={photo.src} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
          {Array.from({ length: COMING_SOON_COUNT }).map((_, i) => (
            <div
              key={`coming-soon-${i}`}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-wood/30 bg-sand text-wood/60"
            >
              <span className="text-3xl">📷</span>
              <span className="text-sm font-semibold uppercase tracking-wide">
                Photo coming soon
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-ink/70">
          Approved guests can browse a larger, private gallery of the interior
          of both houses through the guest portal.
        </p>
      </section>
    </div>
  );
}
