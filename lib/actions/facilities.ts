"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";

export async function bookFacilitySlot(
  facilityId: string,
  bookingDate: string,
  slotIndex: number
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to book a slot." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("facility_bookings").insert({
    facility_id: facilityId,
    guest_id: user.id,
    booking_date: bookingDate,
    slot_index: slotIndex,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That slot was just booked by someone else." };
    }
    return { error: "Could not book that slot. Please try again." };
  }

  revalidatePath(`/activities/${facilityId}`);
  revalidatePath("/activities");
  return {};
}

export async function cancelFacilityBooking(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("facility_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) throw new Error(error.message);
  revalidatePath("/activities");
}
