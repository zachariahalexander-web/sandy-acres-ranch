import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/page-hero";
import { createClient } from "@/lib/supabase/server";

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
const SIGNED_URL_TTL_SECONDS = 60 * 10;

export default async function GalleryPage() {
  const supabase = await createClient();

  const { data: files } = await supabase.storage
    .from("gallery-private")
    .list("", { sortBy: { column: "name", order: "asc" } });

  const imageFiles = (files ?? []).filter((f) => f.id !== null);

  const interiorPhotos = await Promise.all(
    imageFiles.map(async (file) => {
      const { data } = await supabase.storage
        .from("gallery-private")
        .createSignedUrl(file.name, SIGNED_URL_TTL_SECONDS);
      return { name: file.name, url: data?.signedUrl };
    })
  );

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

        <div className="mt-16">
          <h2 className="font-head text-2xl font-bold text-wood-dark">
            Interior Photos
          </h2>
          {interiorPhotos.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">
              No interior photos have been uploaded yet.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {interiorPhotos.map(
                (file) =>
                  file.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={file.name}
                      src={file.url}
                      alt={file.name}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  )
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
