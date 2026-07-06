import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Weekend Menu Board | Sandy Acres Ranch",
};

export default async function MenuBoardPage() {
  const supabase = await createClient();
  const { data: weekends } = await supabase
    .from("weekends")
    .select("id, label, start_date, end_date")
    .order("start_date");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Weekend Menu Board
      </h1>
      <p className="mt-2 text-ink/80">
        Trade menu ideas with guests staying the same weekend as you. Only
        weekends that overlap one of your reservations show up here.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {(weekends ?? []).length === 0 && (
          <p className="text-sm text-ink/60">
            No shared weekends yet &mdash; this shows up once you have a room
            reservation that overlaps a weekend the admin has set up.
          </p>
        )}
        {(weekends ?? []).map((w) => (
          <Link
            key={w.id}
            href={`/portal/menu-board/${w.id}`}
            className="rounded-lg border-2 border-wood/20 bg-white p-4 hover:border-rust"
          >
            <p className="font-semibold text-wood-dark">{w.label}</p>
            <p className="text-sm text-ink/70">
              {w.start_date} &rarr; {w.end_date}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
