import type { Metadata } from "next";
import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Contact | Sandy Acres Ranch",
};

export default function ContactPage() {
  return (
    <div>
      <PageHero
        title="Contact"
        subtitle="Questions about a stay? Reach out."
        image="/images/ranch-campfire.jpg"
        alt="Sandy Acres Ranch"
      />

      <section className="mx-auto grid max-w-4xl gap-10 px-6 py-16 sm:grid-cols-2">
        <div>
          <h2 className="font-head text-2xl font-bold text-wood-dark">
            Get in Touch
          </h2>
          <dl className="mt-4 space-y-3 text-ink/80">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-rust">
                Address
              </dt>
              <dd>
                31550 Washington Loop Road
                <br />
                Punta Gorda, FL 33982
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-rust">
                Phone
              </dt>
              <dd>
                <a href="tel:+19415550142" className="hover:text-rust">
                  (941) 555-0142
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-rust">
                Email
              </dt>
              <dd>
                <a
                  href="mailto:stay@sandyacresranch.com"
                  className="hover:text-rust"
                >
                  stay@sandyacresranch.com
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg bg-sand p-6">
          <h2 className="font-head text-xl font-bold text-wood-dark">
            Already have a stay planned?
          </h2>
          <p className="mt-2 text-ink/80">
            Room reservations, court and studio bookings, and the weekend
            menu board all live in the guest portal. Sign in or create a
            profile there &mdash; new accounts are reviewed by an admin
            before booking access is turned on.
          </p>
        </div>
      </section>
    </div>
  );
}
