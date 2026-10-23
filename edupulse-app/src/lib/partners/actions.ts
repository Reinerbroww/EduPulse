"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  partnerRequestSchema,
  partnerResponseSchema,
} from "@/lib/validation/partners";
import type { FormState } from "@/lib/forms/state";

export async function sendPartnerRequest(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/discover");

  const parsed = partnerRequestSchema.safeParse({
    recipientId: formData.get("recipientId"),
    learningGoalId: formData.get("learningGoalId") ?? "",
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali permintaanmu.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const { recipientId, learningGoalId, message } = parsed.data;

  if (recipientId === user.id) {
    return { status: "error", message: "Kamu tidak dapat mengirim permintaan ke diri sendiri." };
  }

  const supabase = await createClient();

  const { data: block } = await supabase
    .from("user_blocks")
    .select("blocked_user_id")
    .eq("blocker_id", user.id)
    .eq("blocked_user_id", recipientId)
    .maybeSingle();

  if (block) {
    return {
      status: "error",
      message: "Kamu telah memblokir pengguna ini. Buka blokir untuk mengirim permintaan.",
    };
  }

  const { data: existing } = await supabase
    .from("study_partner_requests")
    .select("id")
    .eq("status", "pending")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`,
    )
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "Sudah ada permintaan yang menunggu jawaban dengan pengguna ini.",
    };
  }

  const { error } = await supabase.from("study_partner_requests").insert({
    requester_id: user.id,
    recipient_id: recipientId,
    learning_goal_id: learningGoalId || null,
    message: message || null,
  });

  if (error) {
    return { status: "error", message: "Gagal mengirim permintaan. Coba lagi." };
  }

  revalidatePath("/requests");
  revalidatePath(`/discover/partners/${recipientId}`);
  return { status: "success", message: "Permintaan belajar terkirim." };
}

export async function respondPartnerRequest(formData: FormData): Promise<void> {
  const user = await requireUser("/requests");

  const parsed = partnerResponseSchema.safeParse({
    requestId: formData.get("requestId"),
    action: formData.get("action"),
  });

  if (!parsed.success) return;

  const { requestId, action } = parsed.data;

  const supabase = await createClient();
  const { data: request } = await supabase
    .from("study_partner_requests")
    .select("id, requester_id, recipient_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (!request || request.status !== "pending") return;

  let nextStatus: string;
  if (action === "cancel") {
    if (request.requester_id !== user.id) return;
    nextStatus = "cancelled";
  } else {
    if (request.recipient_id !== user.id) return;
    nextStatus = action === "accept" ? "accepted" : "rejected";
  }

  const { error } = await supabase
    .from("study_partner_requests")
    .update({ status: nextStatus, responded_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) return;

  const counterpartId =
    request.requester_id === user.id
      ? request.recipient_id
      : request.requester_id;

  revalidatePath("/requests");
  revalidatePath(`/discover/partners/${counterpartId}`);
}
