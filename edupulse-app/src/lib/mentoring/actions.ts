"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  goalProgressUpdateSchema,
  mentorFeedbackSchema,
  sessionSummarySchema,
} from "@/lib/validation/mentoring";
import type { FormState } from "@/lib/forms/state";

export async function saveSessionSummary(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = sessionSummarySchema.safeParse({
    bookingId: formData.get("bookingId"),
    summary: formData.get("summary"),
    nextSteps: formData.get("nextSteps") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali ringkasan sesi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const { bookingId, summary, nextSteps } = parsed.data;
  const user = await requireUser(`/bookings/${bookingId}`);

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("mentoring_session_summaries")
    .select("id, author_id")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (existing && existing.author_id !== user.id) {
    return {
      status: "error",
      message: "Ringkasan sesi ini sudah dibuat oleh pihak lain.",
    };
  }

  const payload = {
    booking_id: bookingId,
    author_id: user.id,
    summary,
    next_steps: nextSteps || null,
  };

  const { error } = existing
    ? await supabase
        .from("mentoring_session_summaries")
        .update({ summary, next_steps: nextSteps || null })
        .eq("id", existing.id)
    : await supabase.from("mentoring_session_summaries").insert(payload);

  if (error) {
    return { status: "error", message: "Gagal menyimpan ringkasan. Coba lagi." };
  }

  revalidatePath(`/bookings/${bookingId}`);
  return { status: "success", message: "Ringkasan sesi tersimpan." };
}

export async function submitMentorFeedback(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = mentorFeedbackSchema.safeParse({
    bookingId: formData.get("bookingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali feedback yang kamu isi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const { bookingId, rating, comment } = parsed.data;
  const user = await requireUser(`/bookings/${bookingId}`);

  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("mentor_bookings")
    .select("id, learner_id, mentor_id, status")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking || booking.learner_id !== user.id) {
    return { status: "error", message: "Kamu bukan pembelajar pada sesi ini." };
  }

  if (booking.status !== "completed") {
    return {
      status: "error",
      message: "Feedback hanya dapat diberikan setelah sesi selesai.",
    };
  }

  const { error } = await supabase.from("mentor_feedback").upsert(
    {
      booking_id: bookingId,
      learner_id: user.id,
      mentor_id: booking.mentor_id,
      rating,
      comment: comment || null,
    },
    { onConflict: "booking_id" },
  );

  if (error) {
    return { status: "error", message: "Gagal mengirim feedback. Coba lagi." };
  }

  revalidatePath(`/bookings/${bookingId}`);
  return { status: "success", message: "Terima kasih, feedback terkirim." };
}

export async function addGoalProgressUpdate(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = goalProgressUpdateSchema.safeParse({
    learningGoalId: formData.get("learningGoalId"),
    progressPercent: formData.get("progressPercent"),
    updateText: formData.get("updateText") ?? "",
    nextStep: formData.get("nextStep") ?? "",
    sourceStudySessionId: formData.get("sourceStudySessionId") ?? "",
    sourceMentorBookingId: formData.get("sourceMentorBookingId") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali pembaruan progres.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const data = parsed.data;
  const user = await requireUser(`/goals/${data.learningGoalId}`);

  const supabase = await createClient();
  const { error } = await supabase.from("learning_goal_updates").insert({
    learning_goal_id: data.learningGoalId,
    author_id: user.id,
    progress_percent: data.progressPercent,
    update_text: data.updateText || null,
    next_step: data.nextStep || null,
    source_study_session_id: data.sourceStudySessionId || null,
    source_mentor_booking_id: data.sourceMentorBookingId || null,
  });

  if (error) {
    return { status: "error", message: "Gagal menyimpan progres. Coba lagi." };
  }

  revalidatePath(`/goals/${data.learningGoalId}`);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { status: "success", message: "Progres belajar diperbarui." };
}
