import Image from "next/image";
import Link from "next/link";
import type { Profile } from "@/lib/dal";

export default function SiteFooter({ profile }: { profile: Profile | null }) {
  const isApproved = profile?.status === "approved" || profile?.role === "admin";

  return (
    <footer className="border-t-4 border-wood bg-wood-dark text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Sandy Acres Ranch"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full bg-cream object-contain p-1"
            />
            <span className="font-head text-lg font-bold">Sandy Acres Ranch</span>
          </div>
          <p className="max-w-xs text-sm text-sand-dark">
            A private guest ranch in Punta Gorda, Florida, welcoming guests
            since 1989.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <h3 className="font-head text-base font-bold text-cream">Visit</h3>
          <p className="text-sand-dark">
            31550 Washington Loop Road
            <br />
            Punta Gorda, FL 33982
          </p>
          <p className="text-sand-dark">(941) 555-0142</p>
          <p className="text-sand-dark">stay@sandyacresranch.com</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          {isApproved ? (
            <>
              <h3 className="font-head text-base font-bold text-cream">Explore</h3>
              <Link href="/activities" className="text-sand-dark hover:text-cream">
                Activities
              </Link>
              <Link href="/accommodations" className="text-sand-dark hover:text-cream">
                Accommodations
              </Link>
              <Link href="/gallery" className="text-sand-dark hover:text-cream">
                Gallery
              </Link>
              <Link href="/contact" className="text-sand-dark hover:text-cream">
                Contact
              </Link>
            </>
          ) : (
            <>
              <h3 className="font-head text-base font-bold text-cream">Guests</h3>
              <Link href="/sign-in" className="text-sand-dark hover:text-cream">
                Guest Portal
              </Link>
              <Link href="/sign-up" className="text-sand-dark hover:text-cream">
                Create a Profile
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-sand-dark">
        &copy; {new Date().getFullYear()} Sandy Acres Ranch. All rights reserved.
      </div>
    </footer>
  );
}
