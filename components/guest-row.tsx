"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { approveGuest, revokeGuest, promoteToAdmin } from "@/lib/actions/admin";

type Guest = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: "pending" | "approved" | "revoked";
  created_at: string;
};

const STATUS_STYLES: Record<Guest["status"], string> = {
  pending: "bg-rust/10 text-rust",
  approved: "bg-sage/10 text-sage-dark",
  revoked: "bg-ink/10 text-ink/60",
};

export default function GuestRow({
  guest,
  waiverSignedAt,
}: {
  guest: Guest;
  waiverSignedAt?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border-2 border-wood/20 bg-white p-4">
      <div>
        <p className="font-semibold text-wood-dark">{guest.full_name}</p>
        <p className="text-sm text-ink/70">{guest.email}</p>
        {guest.phone && <p className="text-sm text-ink/60">{guest.phone}</p>}
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide">
          {waiverSignedAt ? (
            <span className="text-sage-dark">
              Waiver signed {new Date(waiverSignedAt).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-rust">Waiver not signed</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[guest.status]}`}
        >
          {guest.status}
        </span>

        {guest.status !== "approved" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await approveGuest(guest.id);
                router.refresh();
              })
            }
            className="rounded-full bg-sage px-4 py-2 text-sm font-semibold text-cream hover:bg-sage-dark disabled:opacity-60"
          >
            Approve
          </button>
        )}
        {guest.status === "approved" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (
                !window.confirm(
                  `Make ${guest.full_name} an admin? They will be able to approve/revoke guests, manage weekends, and grant admin to others.`
                )
              ) {
                return;
              }
              startTransition(async () => {
                await promoteToAdmin(guest.id);
                router.refresh();
              });
            }}
            className="rounded-full border-2 border-wood-dark px-4 py-2 text-sm font-semibold text-wood-dark hover:bg-wood-dark hover:text-cream disabled:opacity-60"
          >
            Make Admin
          </button>
        )}
        {guest.status !== "revoked" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await revokeGuest(guest.id);
                router.refresh();
              })
            }
            className="rounded-full bg-rust px-4 py-2 text-sm font-semibold text-cream hover:bg-leather disabled:opacity-60"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );
}
