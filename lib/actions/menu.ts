"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";

export type PostMenuIdeaState = { error?: string } | undefined;

export async function postMenuIdea(
  weekendId: string,
  _prevState: PostMenuIdeaState,
  formData: FormData
): Promise<PostMenuIdeaState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { error: "You must be signed in." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "Write an idea before posting." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("menu_ideas").insert({
    weekend_id: weekendId,
    guest_id: profile.id,
    guest_name: profile.full_name,
    body,
  });

  if (error) {
    return { error: "Could not post your idea. Please try again." };
  }

  revalidatePath(`/portal/menu-board/${weekendId}`);
  return undefined;
}

export async function deleteMenuIdea(ideaId: string, weekendId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_ideas")
    .delete()
    .eq("id", ideaId);

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/menu-board/${weekendId}`);
}
