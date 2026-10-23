"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import type { FormState } from "@/lib/forms/state";

interface BookingRpcResult {
  success: boolean;
  booking_id?: string;
  error?: string;
  error_code?: string;
  detail?: string;
}

const TRANSITION_ACTIONS = new Set([
  "confirm",
  "decline",
  "complete",
  "cancel_by_learner",
  "cancel_by_mentor",
  "no_show",
]);

const TRANSITION_ERRORS: Record<string, string> = {
  not_authenticated: "Sesi kamu berakhir. Silakan masuk kembali.",
  booking_not_found: "Sesi tidak ditemukan.",
  not_a_party: "Kamu bukan peserta sesi ini.",
  mentor_only: "Hanya mentor yang dapat melakukan aksi ini.",
  learner_only: "Hanya pembelajar yang dapat melakukan aksi ini.",
  invalid_transition: "Aksi ini tidak sesuai dengan status sesi saat ini.",
  unknown_action: "Aksi tidak dikenal.",
  unexpected: "Terjadi kesalahan tak terduga. Coba lagi.",
};

const TRANSITION_SUCCESS: Record<string, string> = {
  confirm: "Sesi dikonfirmasi.",
  decline: "Permintaan sesi ditolak.",
  complete: "Sesi ditandai selesai.",
  cancel_by_learner: "Permintaan sesi dibatalkan.",
  cancel_by_mentor: "Sesi dibatalkan.",
  no_show: "Sesi ditandai tidak hadir.",
};

export async function transitionBooking(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const bookingId = String(formData.get("bookingId") ?? "");
  const action = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!bookingId || !TRANSITION_ACTIONS.has(action)) {
    return { status: "error", message: "Aksi tidak valid." };
  }

  await requireUser(`/bookings/${bookingId}`);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("transition_booking_status", {
    p_booking_id: bookingId,
    p_action: action,
    p_reason: reason || null,
  });

  if (error) {
    return { status: "error", message: "Gagal memperbarui status. Coba lagi." };
  }

  const result = data as { success?: boolean; error?: string } | null;
  if (!result || result.success !== true) {
    return {
      status: "error",
      message:
        TRANSITION_ERRORS[result?.error ?? ""] ??
        "Gagal memperbarui status sesi.",
    };
  }

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  return {
    status: "success",
    message: TRANSITION_SUCCESS[action] ?? "Status sesi diperbarui.",
  };
}

export async function createBookingAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  await requireUser("/discover");

  const mentorId = formData.get("mentorId") as string;
  const serviceId = formData.get("serviceId") as string;
  const availabilitySlotId = formData.get("availabilitySlotId") as string;
  const learningGoalId = (formData.get("learningGoalId") as string) || null;
  const learnerObjective = formData.get("learnerObjective") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!mentorId || !serviceId || !availabilitySlotId || !learnerObjective) {
    redirect(`/discover/mentors/${mentorId}?error=missing_fields`);
  }

  // Validate free service before calling RPC (defense in depth; RPC also rejects paid)
  const { data: service, error: serviceError } = await supabase
    .from("mentor_services")
    .select("price_type, price_amount, is_active")
    .eq("id", serviceId)
    .eq("mentor_id", mentorId)
    .single();

  if (serviceError || !service || !service.is_active) {
    redirect(`/discover/mentors/${mentorId}?error=invalid_service`);
  }
  if (service.price_type !== "free" || Number(service.price_amount) !== 0) {
    redirect(`/discover/mentors/${mentorId}?error=paid_not_enabled`);
  }

  const { data, error } = await supabase.rpc(
    "create_booking_with_slot_reservation",
    {
      p_mentor_id: mentorId,
      p_service_id: serviceId,
      p_availability_slot_id: availabilitySlotId,
      p_learning_goal_id: learningGoalId,
      p_learner_objective: learnerObjective,
      p_notes: notes,
    },
  );

  if (error) {
    redirect(`/discover/mentors/${mentorId}?error=booking_failed`);
  }

  const result = data as BookingRpcResult | null;
  if (!result || result.success !== true) {
    const code = result?.error ?? result?.error_code ?? "booking_failed";
    redirect(`/discover/mentors/${mentorId}?error=${code}`);
  }

  redirect(`/dashboard?booking=success`);
}
