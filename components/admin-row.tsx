"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { demoteAdmin } from "@/lib/actions/admin";

type Admin = {
  id: string;
  full_name: string;
  email: string | null;
};

export default function AdminRow({
  admin,
  isSelf,
}: {
  admin: Admin;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border-2 border-wood/20 bg-white p-4">
      <div>
        <p className="font-semibold text-wood-dark">
          {admin.full_name} {isSelf && <span className="text-ink/40">(you)</span>}
        </p>
        <p className="text-sm text-ink/70">{admin.email}</p>
      </div>

      {!isSelf && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (
              !window.confirm(
                `Remove admin access from ${admin.full_name}? They'll go back to being a regular approved guest.`
              )
            ) {
              return;
            }
            startTransition(async () => {
              await demoteAdmin(admin.id);
              router.refresh();
            });
          }}
          className="rounded-full border-2 border-rust px-4 py-2 text-sm font-semibold text-rust hover:bg-rust hover:text-cream disabled:opacity-60"
        >
          Remove Admin
        </button>
      )}
    </div>
  );
}
