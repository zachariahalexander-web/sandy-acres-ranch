import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";
import GuestRow from "@/components/guest-row";
import AdminRow from "@/components/admin-row";

export const metadata: Metadata = {
  title: "Admin | Sandy Acres Ranch",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();
  const { data: guests } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, status, role, created_at, approved_at, revoked_at"
    )
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  const { data: admins } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "admin")
    .order("full_name");

  const { data: activeVersion } = await supabase
    .from("waiver_versions")
    .select("id")
    .eq("is_active", true)
    .single();

  const { data: acceptances } = activeVersion
    ? await supabase
        .from("waiver_acceptances")
        .select("profile_id, accepted_at")
        .eq("waiver_version_id", activeVersion.id)
    : { data: [] };

  const waiverSignedAtByProfile = new Map(
    (acceptances ?? []).map((a) => [a.profile_id, a.accepted_at])
  );

  const pending = (guests ?? []).filter((g) => g.status === "pending");
  const approved = (guests ?? []).filter((g) => g.status === "approved");
  const revoked = (guests ?? []).filter((g) => g.status === "revoked");

  const today = new Date().toISOString().slice(0, 10);

  const [{ count: roomCount }, { count: facilityCount }, { count: weekendCount }] =
    await Promise.all([
      supabase
        .from("room_reservations")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed")
        .gte("end_date", today),
      supabase
        .from("facility_bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed")
        .gte("booking_date", today),
      supabase.from("weekends").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Pending Approvals", value: pending.length },
    { label: "Approved Guests", value: approved.length },
    { label: "Upcoming Room Stays", value: roomCount ?? 0 },
    { label: "Upcoming Facility Bookings", value: facilityCount ?? 0 },
    { label: "Weekends Configured", value: weekendCount ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-head text-3xl font-bold text-wood-dark">
          Admin Dashboard
        </h1>
        <div className="flex gap-3">
          <Link
            href="/admin/reservations"
            className="rounded-full border-2 border-wood-dark px-4 py-2 text-sm font-semibold text-wood-dark hover:bg-wood-dark hover:text-cream"
          >
            All Reservations
          </Link>
          <Link
            href="/admin/weekends"
            className="rounded-full border-2 border-wood-dark px-4 py-2 text-sm font-semibold text-wood-dark hover:bg-wood-dark hover:text-cream"
          >
            Manage Weekends
          </Link>
        </div>
      </div>
      <p className="mt-2 text-ink/80">
        Approve new guest profiles or revoke access for existing ones.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border-2 border-wood/20 bg-white p-4 text-center"
          >
            <p className="font-head text-2xl font-bold text-rust">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-head text-xl font-bold text-wood-dark">
          Pending Approval ({pending.length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {pending.length === 0 && (
            <p className="text-sm text-ink/60">No pending guests.</p>
          )}
          {pending.map((guest) => (
            <GuestRow
              key={guest.id}
              guest={guest}
              waiverSignedAt={waiverSignedAtByProfile.get(guest.id) ?? null}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-head text-xl font-bold text-wood-dark">
          Approved ({approved.length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {approved.length === 0 && (
            <p className="text-sm text-ink/60">No approved guests yet.</p>
          )}
          {approved.map((guest) => (
            <GuestRow
              key={guest.id}
              guest={guest}
              waiverSignedAt={waiverSignedAtByProfile.get(guest.id) ?? null}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-head text-xl font-bold text-wood-dark">
          Revoked ({revoked.length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {revoked.length === 0 && (
            <p className="text-sm text-ink/60">No revoked guests.</p>
          )}
          {revoked.map((guest) => (
            <GuestRow
              key={guest.id}
              guest={guest}
              waiverSignedAt={waiverSignedAtByProfile.get(guest.id) ?? null}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-head text-xl font-bold text-wood-dark">
          Admins ({(admins ?? []).length})
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Admins can approve/revoke guests, manage weekends, and grant admin
          access to others. Promote a guest to admin from the Approved list
          above.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {(admins ?? []).map((admin) => (
            <AdminRow
              key={admin.id}
              admin={admin}
              isSelf={admin.id === currentUser?.id}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
