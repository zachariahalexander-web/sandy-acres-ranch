import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  status: "pending" | "approved" | "revoked";
  role: "guest" | "admin";
};

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, phone, address_line1, address_line2, city, state, postal_code, status, role"
    )
    .eq("id", user.id)
    .single();

  return data;
});

export const getActiveWaiverAcceptance = cache(async () => {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: activeVersion } = await supabase
    .from("waiver_versions")
    .select("id")
    .eq("is_active", true)
    .single();

  if (!activeVersion) return null;

  const { data } = await supabase
    .from("waiver_acceptances")
    .select("id")
    .eq("profile_id", user.id)
    .eq("waiver_version_id", activeVersion.id)
    .maybeSingle();

  return data;
});
