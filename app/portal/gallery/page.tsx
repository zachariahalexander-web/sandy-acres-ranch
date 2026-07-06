import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Private Gallery | Sandy Acres Ranch",
};

const SIGNED_URL_TTL_SECONDS = 60 * 10;

export default async function PrivateGalleryPage() {
  const supabase = await createClient();

  const { data: files } = await supabase.storage
    .from("gallery-private")
    .list("", { sortBy: { column: "name", order: "asc" } });

  const imageFiles = (files ?? []).filter((f) => f.id !== null);

  const signedUrls = await Promise.all(
    imageFiles.map(async (file) => {
      const { data } = await supabase.storage
        .from("gallery-private")
        .createSignedUrl(file.name, SIGNED_URL_TTL_SECONDS);
      return { name: file.name, url: data?.signedUrl };
    })
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Private Gallery
      </h1>
      <p className="mt-2 text-ink/80">
        Interior photos of both houses, visible only to approved guests.
      </p>

      {signedUrls.length === 0 ? (
        <p className="mt-8 text-sm text-ink/60">
          No photos have been uploaded yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {signedUrls.map(
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
  );
}
