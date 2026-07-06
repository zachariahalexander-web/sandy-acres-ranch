import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getActiveWaiverAcceptance } from "@/lib/dal";
import WaiverAcceptForm from "@/components/waiver-accept-form";

export const metadata: Metadata = {
  title: "Ranch Waiver | Sandy Acres Ranch",
};

export default async function WaiverPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const existingAcceptance = await getActiveWaiverAcceptance();
  if (existingAcceptance) {
    redirect("/portal");
  }

  const supabase = await createClient();
  const { data: waiver } = await supabase
    .from("waiver_versions")
    .select("id, version_label, body_markdown")
    .eq("is_active", true)
    .single();

  if (!waiver) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p>No waiver is currently configured. Please contact the ranch.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-head text-3xl font-bold text-wood-dark">
        Release, Waiver &amp; Assumption of Risk
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Version {waiver.version_label}
      </p>

      <div className="waiver-body mt-6 max-h-[28rem] overflow-y-auto rounded-lg border-2 border-wood/20 bg-white p-6 text-sm leading-relaxed">
        <ReactMarkdown>{waiver.body_markdown}</ReactMarkdown>
      </div>

      <WaiverAcceptForm />
    </div>
  );
}
