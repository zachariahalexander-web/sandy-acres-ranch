"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return profile;
}

export async function approveGuest(guestId: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "approved",
      approved_by: admin.id,
      approved_at: new Date().toISOString(),
      revoked_at: null,
    })
    .eq("id", guestId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export type CreateWeekendState = { error?: string } | undefined;

export async function createWeekend(
  _prevState: CreateWeekendState,
  formData: FormData
): Promise<CreateWeekendState> {
  await requireAdmin();

  const label = String(formData.get("label") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");

  if (!label || !startDate || !endDate) {
    return { error: "Fill in a label, start date, and end date." };
  }
  if (endDate <= startDate) {
    return { error: "End date must be after start date." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("weekends").insert({
    label,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    return { error: "Could not create the weekend. Please try again." };
  }

  revalidatePath("/admin/weekends");
  return undefined;
}

export async function deleteWeekend(weekendId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("weekends").delete().eq("id", weekendId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/weekends");
}

export async function revokeGuest(guestId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("id", guestId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function promoteToAdmin(guestId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", guestId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function demoteAdmin(adminId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: "guest" })
    .eq("id", adminId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
