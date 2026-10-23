"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  blockSchema,
  reportSchema,
} from "@/lib/validation/partners";
import type { FormState } from "@/lib/forms/state";

export async function blockUser(formData: FormData): Promise<void> {
  const user = await requireUser("/discover");

  const parsed = blockSchema.safeParse({
    blockedUserId: formData.get("blockedUserId"),
  });
  if (!parsed.success) return;

  const { blockedUserId } = parsed.data;
  if (blockedUserId === user.id) return;

  const supabase = await createClient();
  await supabase
    .from("user_blocks")
    .upsert(
      { blocker_id: user.id, blocked_user_id: blockedUserId },
      { onConflict: "blocker_id,blocked_user_id", ignoreDuplicates: true },
    );

  revalidatePath("/discover");
  revalidatePath("/requests");
  revalidatePath(`/discover/partners/${blockedUserId}`);
}

export async function unblockUser(formData: FormData): Promise<void> {
  const user = await requireUser("/profile");

  const parsed = blockSchema.safeParse({
    blockedUserId: formData.get("blockedUserId"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_user_id", parsed.data.blockedUserId);

  revalidatePath("/profile");
  revalidatePath("/discover");
}

export async function submitReport(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/discover");

  const parsed = reportSchema.safeParse({
    reportedUserId: formData.get("reportedUserId"),
    reasonCode: formData.get("reasonCode"),
    details: formData.get("details") ?? "",
    studyGroupId: formData.get("studyGroupId") ?? "",
    studySessionId: formData.get("studySessionId") ?? "",
    mentorBookingId: formData.get("mentorBookingId") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali laporanmu.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  if (parsed.data.reportedUserId === user.id) {
    return { status: "error", message: "Kamu tidak dapat melaporkan diri sendiri." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_reports").insert({
    reporter_id: user.id,
    reported_user_id: parsed.data.reportedUserId,
    reason_code: parsed.data.reasonCode,
    details: parsed.data.details || null,
    study_group_id: parsed.data.studyGroupId || null,
    study_session_id: parsed.data.studySessionId || null,
    mentor_booking_id: parsed.data.mentorBookingId || null,
  });

  if (error) {
    return { status: "error", message: "Gagal mengirim laporan. Coba lagi." };
  }

  return {
    status: "success",
    message: "Laporan terkirim. Tim akan meninjau laporanmu.",
  };
}
