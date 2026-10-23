"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/forms/state";

const REVIEW_DECISIONS = new Set(["verified", "rejected", "suspended"]);
const REPORT_STATUSES = new Set(["in_review", "resolved", "dismissed"]);

// Approve/reject a mentor's verification request. The RPC re-checks that the
// caller is a moderator and (from migration 012) that a CV is on file before an
// approval can land, so this is safe even if called directly.
export async function reviewVerification(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser("/moderator");
  const mentorId = String(formData.get("mentorId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!mentorId || !REVIEW_DECISIONS.has(decision)) {
    return { status: "error", message: "Keputusan tidak dikenali." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("review_mentor_verification", {
    p_mentor_id: mentorId,
    p_decision: decision,
  });

  if (error) {
    return { status: "error", message: "Gagal memproses keputusan. Coba lagi." };
  }

  const result = data as { success?: boolean; error?: string } | null;
  if (!result?.success) {
    if (result?.error === "cv_missing") {
      return {
        status: "error",
        message:
          "Tidak bisa menyetujui: dokumen CV tidak ditemukan untuk pengajuan ini.",
      };
    }
    if (result?.error === "not_moderator") {
      return {
        status: "error",
        message: "Hanya moderator yang boleh memutuskan verifikasi.",
      };
    }
    if (result?.error === "mentor_not_found") {
      return { status: "error", message: "Mentor tidak ditemukan." };
    }
    return { status: "error", message: "Gagal memproses keputusan. Coba lagi." };
  }

  revalidatePath("/moderator");
  return {
    status: "success",
    message:
      decision === "verified"
        ? "Mentor disetujui dan berstatus terverifikasi."
        : decision === "rejected"
          ? "Pengajuan verifikasi ditolak."
          : "Mentor ditangguhkan.",
  };
}

// Update a report's handling status and record an internal resolution note.
// RLS restricts `user_reports` UPDATE to moderators.
export async function resolveReport(formData: FormData): Promise<void> {
  const user = await requireUser("/moderator");
  const reportId = String(formData.get("reportId") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!reportId || !REPORT_STATUSES.has(status)) return;

  const supabase = await createClient();
  await supabase
    .from("user_reports")
    .update({
      status,
      resolution_note: note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  revalidatePath("/moderator");
}
