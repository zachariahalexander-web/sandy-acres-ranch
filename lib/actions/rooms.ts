"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal";

export type ReserveRoomState = { error?: string } | undefined;

export async function reserveRoom(
  bedroomId: string,
  _prevState: ReserveRoomState,
  formData: FormData
): Promise<ReserveRoomState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to reserve a room." };
  }

  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");

  if (!startDate || !endDate) {
    return { error: "Choose a check-in and check-out date." };
  }
  if (endDate <= startDate) {
    return { error: "Check-out must be after check-in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("room_reservations").insert({
    bedroom_id: bedroomId,
    guest_id: user.id,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    if (error.code === "23P01") {
      return {
        error: "Those dates were just booked by someone else. Try different dates.",
      };
    }
    return { error: "Could not create the reservation. Please try again." };
  }

  revalidatePath("/accommodations");
  revalidatePath(`/accommodations/${bedroomId}`);
  return undefined;
}

export async function cancelRoomReservation(reservationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("room_reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId);

  if (error) throw new Error(error.message);
  revalidatePath("/accommodations");
}
