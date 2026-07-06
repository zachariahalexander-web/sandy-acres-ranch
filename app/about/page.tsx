import type { Metadata } from "next";
import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  title: "About | Sandy Acres Ranch",
};

export default function AboutPage() {
  return (
    <div>
      <PageHero
        title="About the Ranch"
        subtitle="Est. 1989 · Punta Gorda, Florida"
        image="/images/ranch-suv-sunset.jpg"
        alt="Sandy Acres Ranch grounds"
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-lg leading-relaxed text-ink/80">
          Sandy Acres Ranch sits on quiet acreage along Washington Loop Road
          in Punta Gorda, Florida, owned by Dr. Zachariah Zachariah. Since
          1989, the ranch has grown from a family property into a private
          guest ranch built for gathering &mdash; two full guest houses,
          courts and a studio for staying active, and grounds shaped by old
          oaks, Spanish moss, and a pond that catches the sunset every
          evening.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-ink/80">
          The ranch is intentionally private. Every guest creates a profile
          and agrees to the ranch&rsquo;s waiver before visiting, and an
          admin personally reviews and approves each account before it can be
          used to book a room, a court, or a studio slot. It&rsquo;s a small
          extra step that keeps the ranch feeling like what it is &mdash; a
          private property shared with people the owner knows.
        </p>
      </section>
    </div>
  );
}
