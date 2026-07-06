import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-6 py-16 text-center">
      <Image
        src="/images/logo.png"
        alt="Sandy Acres Ranch"
        width={280}
        height={280}
        priority
        className="h-56 w-56 object-contain sm:h-72 sm:w-72"
      />
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/sign-in"
          className="rounded-full bg-rust px-6 py-3 text-sm font-bold uppercase tracking-wide text-cream transition-colors hover:bg-leather"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full border-2 border-wood-dark px-6 py-3 text-sm font-bold uppercase tracking-wide text-wood-dark transition-colors hover:bg-wood-dark hover:text-cream"
        >
          Create a Profile
        </Link>
      </div>
    </div>
  );
}
