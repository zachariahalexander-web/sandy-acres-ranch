import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";
import MenuIdeaForm from "@/components/menu-idea-form";
import DeleteMenuIdeaButton from "@/components/delete-menu-idea-button";

export const metadata: Metadata = {
  title: "Weekend Menu Board | Sandy Acres Ranch",
};

export default async function WeekendMenuBoardPage({
  params,
}: {
  params: Promise<{ weekendId: string }>;
}) {
  const { weekendId } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: weekend } = await supabase
    .from("weekends")
    .select("id, label, start_date, end_date")
    .eq("id", weekendId)
    .single();

  if (!weekend) {
    notFound();
  }

  const { data: ideas } = await supabase
    .from("menu_ideas")
    .select("id, guest_id, guest_name, body, created_at")
    .eq("weekend_id", weekendId)
    .order("created_at");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        {weekend.label}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        {weekend.start_date} &rarr; {weekend.end_date}
      </p>

      <div className="mt-8">
        <MenuIdeaForm weekendId={weekendId} />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {(ideas ?? []).length === 0 && (
          <p className="text-sm text-ink/60">
            No ideas yet &mdash; be the first to share one.
          </p>
        )}
        {(ideas ?? []).map((idea) => (
          <div
            key={idea.id}
            className="rounded-lg border-2 border-wood/20 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-wood-dark">
                {idea.guest_name}
              </p>
              {idea.guest_id === user?.id && (
                <DeleteMenuIdeaButton ideaId={idea.id} weekendId={weekendId} />
              )}
            </div>
            <p className="mt-1 text-ink/80">{idea.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
