"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

export async function signUp(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const addressLine1 = String(formData.get("address_line1") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const postalCode = String(formData.get("postal_code") ?? "").trim();

  if (fullName.length < 2) {
    return { error: "Please enter your full name." };
  }
  if (!email.includes("@")) {
    return { error: "Please enter a valid email." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await supabase
      .from("profiles")
      .update({
        phone: phone || null,
        address_line1: addressLine1 || null,
        city: city || null,
        state: state || null,
        postal_code: postalCode || null,
      })
      .eq("id", data.user.id);
  }

  if (!data.session) {
    return {
      message:
        "Check your email for a confirmation link, then sign in to continue to the ranch waiver.",
    };
  }

  redirect("/waiver");
}

export async function signIn(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect("/accommodations");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function acceptWaiver(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const typedSignatureName = String(
    formData.get("typed_signature_name") ?? ""
  ).trim();
  const agreed = formData.get("agreed") === "on";

  if (!agreed) {
    return { error: "You must check the box to confirm you agree." };
  }
  if (typedSignatureName.length < 2) {
    return { error: "Please type your full legal name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: activeVersion } = await supabase
    .from("waiver_versions")
    .select("id")
    .eq("is_active", true)
    .single();

  if (!activeVersion) {
    return { error: "No waiver is currently available. Contact the ranch." };
  }

  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const userAgent = headerList.get("user-agent") ?? undefined;

  const { error } = await supabase.from("waiver_acceptances").insert({
    profile_id: user.id,
    waiver_version_id: activeVersion.id,
    typed_signature_name: typedSignatureName,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  if (error) {
    return { error: "Could not record your acceptance. Please try again." };
  }

  redirect("/accommodations");
}
