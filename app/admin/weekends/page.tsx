import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CreateWeekendForm from "@/components/create-weekend-form";
import DeleteWeekendButton from "@/components/delete-weekend-button";

export const metadata: Metadata = {
  title: "Manage Weekends | Sandy Acres Ranch",
};

export default async function AdminWeekendsPage() {
  const supabase = await createClient();
  const { data: weekends } = await supabase
    .from("weekends")
    .select("id, label, start_date, end_date")
    .order("start_date");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Manage Weekends
      </h1>
      <p className="mt-2 text-ink/80">
        Create a weekend so guests staying those dates can share menu ideas.
      </p>

      <div className="mt-8 rounded-lg border-2 border-wood/20 bg-white p-6">
        <CreateWeekendForm />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {(weekends ?? []).length === 0 && (
          <p className="text-sm text-ink/60">No weekends created yet.</p>
        )}
        {(weekends ?? []).map((w) => (
          <div
            key={w.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-wood/20 bg-white p-4"
          >
            <div>
              <p className="font-semibold text-wood-dark">{w.label}</p>
              <p className="text-sm text-ink/70">
                {w.start_date} &rarr; {w.end_date}
              </p>
            </div>
            <DeleteWeekendButton weekendId={w.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
