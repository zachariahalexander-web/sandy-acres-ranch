"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/dal";

const GATED_LINKS = [
  { href: "/activities", label: "Activities" },
  { href: "/accommodations", label: "Accommodations" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isApproved = profile?.status === "approved" || profile?.role === "admin";
  const navLinks = isApproved ? GATED_LINKS : [];

  return (
    <header className="sticky top-0 z-50 border-b-4 border-rust bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo.png"
            alt="Sandy Acres Ranch"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
          <span className="hidden font-head text-lg font-bold tracking-wide text-wood-dark sm:block">
            Sandy Acres Ranch
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? "text-rust"
                    : "text-wood-dark hover:text-rust"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className={`rounded px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                pathname.startsWith("/admin")
                  ? "text-rust"
                  : "text-wood-dark hover:text-rust"
              }`}
            >
              Admin
            </Link>
          )}
          {profile ? (
            <form action={signOut}>
              <button
                type="submit"
                className="ml-2 rounded-full border-2 border-wood-dark px-4 py-2 text-sm font-semibold text-wood-dark hover:bg-wood-dark hover:text-cream"
              >
                Sign Out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="rounded px-3 py-2 text-sm font-semibold uppercase tracking-wide text-wood-dark hover:text-rust"
              >
                Create Profile
              </Link>
              <Link
                href="/sign-in"
                className="ml-2 rounded-full bg-wood-dark px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-rust"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded md:hidden"
        >
          <span className="block h-0.5 w-6 bg-wood-dark" />
          <span className="block h-0.5 w-6 bg-wood-dark" />
          <span className="block h-0.5 w-6 bg-wood-dark" />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-sand-dark px-6 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded px-2 py-2 text-sm font-semibold uppercase tracking-wide ${
                pathname === link.href ? "text-rust" : "text-wood-dark"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={`rounded px-2 py-2 text-sm font-semibold uppercase tracking-wide ${
                pathname.startsWith("/admin") ? "text-rust" : "text-wood-dark"
              }`}
            >
              Admin
            </Link>
          )}
          {profile ? (
            <form action={signOut}>
              <button
                type="submit"
                className="mt-2 w-full rounded-full border-2 border-wood-dark px-4 py-2 text-center text-sm font-semibold text-wood-dark"
              >
                Sign Out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="rounded px-2 py-2 text-sm font-semibold uppercase tracking-wide text-wood-dark"
              >
                Create Profile
              </Link>
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-wood-dark px-4 py-2 text-center text-sm font-semibold text-cream"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
