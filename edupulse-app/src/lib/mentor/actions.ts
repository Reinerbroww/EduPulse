"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  CV_BUCKET,
  CV_UNAVAILABLE_MESSAGE,
  isMissingCvBucket,
  isMissingCvSchema,
} from "@/lib/mentor/cv";
import {
  cvUploadSchema,
  mentorProfileSchema,
  mentorServiceSchema,
  mentorSlotSchema,
} from "@/lib/validation/mentor";
import type { FormState } from "@/lib/forms/state";

export async function upsertMentorProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/mentor/profile");

  const parsed = mentorProfileSchema.safeParse({
    headline: formData.get("headline"),
    expertiseSummary: formData.get("expertiseSummary"),
    experienceYears: formData.get("experienceYears") ?? "",
    isAcceptingBookings: formData.get("isAcceptingBookings"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali profil mentor.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();

  const patch = {
    headline: parsed.data.headline,
    expertise_summary: parsed.data.expertiseSummary,
    experience_years: parsed.data.experienceYears ?? null,
    is_accepting_bookings: Boolean(parsed.data.isAcceptingBookings),
  };

  // Do NOT use upsert(..., { onConflict: "user_id" }). Migration 005 revokes
  // blanket UPDATE on mentor_profiles and only grants a column allow-list that
  // excludes user_id, so PostgREST renders an upsert as
  // `ON CONFLICT (user_id) DO UPDATE SET user_id = excluded.user_id, ...` and
  // every create fails with 42501 "permission denied for table mentor_profiles"
  // even for a brand-new row. Update first, insert only when no row exists, and
  // swallow a concurrent-insert conflict by retrying the update once.
  const { data: updated, error: updateError } = await supabase
    .from("mentor_profiles")
    .update(patch)
    .eq("user_id", user.id)
    .select("user_id");

  if (updateError) {
    return {
      status: "error",
      message: "Gagal menyimpan profil mentor. Coba lagi.",
    };
  }

  if (updated && updated.length > 0) {
    revalidatePath("/mentor");
    revalidatePath("/mentor/profile");
    redirect("/mentor");
  }

  const { error: insertError } = await supabase.from("mentor_profiles").insert({
    user_id: user.id,
    ...patch,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const { error: retryError } = await supabase
        .from("mentor_profiles")
        .update(patch)
        .eq("user_id", user.id);
      if (!retryError) {
        revalidatePath("/mentor");
        revalidatePath("/mentor/profile");
        redirect("/mentor");
      }
    }
    return {
      status: "error",
      message: "Gagal membuat profil mentor. Coba lagi.",
    };
  }

  revalidatePath("/mentor");
  revalidatePath("/mentor/profile");
  redirect("/mentor");
}

export async function submitMentorVerification(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/mentor");

  // The form is bound to the caller's own mentor row; a mismatched mentorId
  // means the request was replayed against somebody else's profile.
  const mentorId = String(formData.get("mentorId") ?? "");
  if (mentorId && mentorId !== user.id) {
    return { status: "error", message: "Permintaan tidak valid." };
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("mentor_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return { status: "error", message: "Buat profil mentor terlebih dahulu." };
  }
  if (profile.verification_status === "verified") {
    return { status: "error", message: "Profil kamu sudah terverifikasi." };
  }
  if (profile.verification_status === "pending") {
    return {
      status: "error",
      message: "Pengajuan verifikasi sedang ditinjau moderator.",
    };
  }
  if (profile.verification_status === "suspended") {
    return {
      status: "error",
      message: "Akun mentor kamu ditangguhkan. Hubungi tim EduPulse.",
    };
  }

  // CV gate (app level). Migration 012 adds the same guard inside the RPC, so
  // the backend refuses the transition even if this check is bypassed.
  const { data: cv, error: cvError } = await supabase
    .from("mentor_verification_documents")
    .select("mentor_id")
    .eq("mentor_id", user.id)
    .maybeSingle();

  if (cvError) {
    return {
      status: "error",
      message: isMissingCvSchema(cvError)
        ? CV_UNAVAILABLE_MESSAGE
        : "Gagal memeriksa CV. Coba lagi.",
    };
  }
  if (!cv) {
    return {
      status: "error",
      message: "Unggah CV (PDF, maksimal 5 MB) sebelum mengajukan verifikasi.",
    };
  }

  // Verification columns are reserved for a privileged transition; the RPC is
  // the only path that may set verification_status = 'pending'.
  const { data, error } = await supabase.rpc("submit_mentor_verification");

  if (error) {
    return { status: "error", message: "Pengajuan verifikasi gagal. Coba lagi." };
  }

  const result = data as { success?: boolean; error?: string } | null;
  if (!result?.success) {
    if (result?.error === "cv_missing") {
      return { status: "error", message: "Unggah CV terlebih dahulu." };
    }
    if (result?.error === "no_mentor_profile") {
      return { status: "error", message: "Buat profil mentor terlebih dahulu." };
    }
    if (result?.error === "already_pending") {
      return {
        status: "error",
        message: "Pengajuan verifikasi sedang ditinjau moderator.",
      };
    }
    if (result?.error === "already_verified") {
      return { status: "error", message: "Profil kamu sudah terverifikasi." };
    }
    if (result?.error === "suspended") {
      return {
        status: "error",
        message: "Akun mentor kamu ditangguhkan. Hubungi tim EduPulse.",
      };
    }
    return { status: "error", message: "Pengajuan verifikasi gagal. Coba lagi." };
  }

  revalidatePath("/mentor");
  return {
    status: "success",
    message: "Verifikasi diajukan. Moderator akan meninjau CV kamu.",
  };
}

export async function toggleAcceptingBookings(formData: FormData): Promise<void> {
  const user = await requireUser("/mentor");
  const next = formData.get("next") === "true";
  const supabase = await createClient();

  await supabase
    .from("mentor_profiles")
    .update({ is_accepting_bookings: next })
    .eq("user_id", user.id);

  revalidatePath("/mentor");
}

export async function createMentorService(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/mentor/services/new");

  const parsed = mentorServiceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    topicId: formData.get("topicId") ?? "",
    durationMinutes: formData.get("durationMinutes"),
    deliveryMode: formData.get("deliveryMode"),
    priceType: formData.get("priceType"),
    priceAmount: formData.get("priceAmount") ?? 0,
    cancellationPolicy: formData.get("cancellationPolicy"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali layanan.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const data = parsed.data;
  let priceAmount = data.priceAmount;
  if (data.priceType === "free") {
    priceAmount = 0;
  } else if (priceAmount <= 0) {
    return {
      status: "error",
      message: "Layanan berbayar harus memiliki harga lebih dari 0.",
      fieldErrors: { priceAmount: "Harga harus lebih dari 0." },
    };
  }

  const supabase = await createClient();

  const { data: mentorProfile } = await supabase
    .from("mentor_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mentorProfile) {
    return {
      status: "error",
      message: "Buat profil mentor terlebih dahulu sebelum menambah layanan.",
    };
  }

  const { error } = await supabase.from("mentor_services").insert({
    mentor_id: user.id,
    topic_id: data.topicId || null,
    title: data.title,
    description: data.description,
    duration_minutes: data.durationMinutes,
    delivery_mode: data.deliveryMode,
    price_type: data.priceType,
    price_amount: priceAmount,
    currency: "IDR",
    cancellation_policy: data.cancellationPolicy,
  });

  if (error) {
    return { status: "error", message: "Gagal menyimpan layanan. Coba lagi." };
  }

  revalidatePath("/mentor");
  redirect("/mentor");
}

export async function toggleMentorServiceActive(
  formData: FormData,
): Promise<void> {
  const user = await requireUser("/mentor");
  const serviceId = formData.get("serviceId") as string;
  if (!serviceId) return;

  const supabase = await createClient();
  const { data: service } = await supabase
    .from("mentor_services")
    .select("id, is_active")
    .eq("id", serviceId)
    .eq("mentor_id", user.id)
    .maybeSingle();

  if (!service) return;

  await supabase
    .from("mentor_services")
    .update({ is_active: !service.is_active })
    .eq("id", serviceId)
    .eq("mentor_id", user.id);

  revalidatePath("/mentor");
}

export async function deleteMentorService(formData: FormData): Promise<void> {
  const user = await requireUser("/mentor");
  const serviceId = formData.get("serviceId") as string;
  if (!serviceId) return;

  const supabase = await createClient();
  await supabase
    .from("mentor_services")
    .delete()
    .eq("id", serviceId)
    .eq("mentor_id", user.id);

  revalidatePath("/mentor");
}

export async function createMentorSlot(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/mentor/slots/new");

  const parsed = mentorSlotSchema.safeParse({
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali jadwal.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();

  const { data: mentorProfile } = await supabase
    .from("mentor_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mentorProfile) {
    return { status: "error", message: "Buat profil mentor terlebih dahulu." };
  }

  const { error } = await supabase.from("mentor_availability_slots").insert({
    mentor_id: user.id,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: new Date(parsed.data.endsAt).toISOString(),
    status: "available",
  });

  if (error) {
    return { status: "error", message: "Gagal menambah jadwal. Coba lagi." };
  }

  revalidatePath("/mentor");
  redirect("/mentor");
}

export async function deleteMentorSlot(formData: FormData): Promise<void> {
  const user = await requireUser("/mentor");
  const slotId = formData.get("slotId") as string;
  if (!slotId) return;

  const supabase = await createClient();
  await supabase
    .from("mentor_availability_slots")
    .delete()
    .eq("id", slotId)
    .eq("mentor_id", user.id)
    .eq("status", "available");

  revalidatePath("/mentor");
}

// ── CV (verification document) ───────────────────────────────────────────────
// Upload path is `<own uid>/cv-<epoch>.pdf` so the private bucket's storage
// policy (folder must equal auth.uid()) holds. The bytes live only in Storage;
// this table stores metadata and is readable by the owner and moderators only.

function asFile(value: unknown): File | null {
  if (value === null || typeof value !== "object") return null;
  const candidate = value as Partial<File> & { name?: string; size?: number };
  if (typeof candidate.name !== "string" || typeof candidate.size !== "number") {
    return null;
  }
  if (typeof candidate.arrayBuffer !== "function") return null;
  return value as File;
}

export async function uploadMentorCv(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/mentor");

  const file = asFile(formData.get("cv"));
  if (!file || file.size === 0) {
    return {
      status: "error",
      message: "Pilih file CV terlebih dahulu.",
      fieldErrors: { cv: "Pilih file CV terlebih dahulu." },
    };
  }

  const parsed = cvUploadSchema.safeParse({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      status: "error",
      message: issue?.message ?? "File CV tidak valid.",
      fieldErrors: { cv: issue?.message ?? "File CV tidak valid." },
    };
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("mentor_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      status: "error",
      message: "Buat profil mentor terlebih dahulu sebelum mengunggah CV.",
    };
  }

  // Reading the current document also proves migration 012 is present, so we
  // never upload an object we would then fail to describe.
  const { data: existing, error: existingError } = await supabase
    .from("mentor_verification_documents")
    .select("storage_path")
    .eq("mentor_id", user.id)
    .maybeSingle();

  if (existingError) {
    return {
      status: "error",
      message: isMissingCvSchema(existingError)
        ? CV_UNAVAILABLE_MESSAGE
        : "Gagal membaca data CV. Coba lagi.",
    };
  }

  const path = `${user.id}/cv-${Date.now()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(CV_BUCKET)
    .upload(path, file, {
      contentType: parsed.data.mimeType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    return {
      status: "error",
      message: isMissingCvBucket(uploadError)
        ? CV_UNAVAILABLE_MESSAGE
        : "Mengunggah CV gagal. Coba lagi.",
    };
  }

  const { error: saveError } = await supabase
    .from("mentor_verification_documents")
    .upsert(
      {
        mentor_id: user.id,
        bucket_id: CV_BUCKET,
        storage_path: path,
        file_name: parsed.data.fileName,
        mime_type: parsed.data.mimeType,
        file_size_bytes: parsed.data.sizeBytes,
        uploaded_at: new Date().toISOString(),
      },
      { onConflict: "mentor_id" },
    );

  if (saveError) {
    // Do not leave an orphan object behind if the metadata write fails.
    await supabase.storage.from(CV_BUCKET).remove([path]);
    return {
      status: "error",
      message: isMissingCvSchema(saveError)
        ? CV_UNAVAILABLE_MESSAGE
        : "Gagal menyimpan data CV. Coba lagi.",
    };
  }

  // Best effort: drop the previous object once the new one is on file.
  if (existing?.storage_path && existing.storage_path !== path) {
    await supabase.storage.from(CV_BUCKET).remove([existing.storage_path]);
  }

  revalidatePath("/mentor");
  return {
    status: "success",
    message: existing
      ? "CV berhasil diganti."
      : "CV berhasil diunggah. Kamu bisa mengajukan verifikasi.",
  };
}

export async function deleteMentorCv(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/mentor");

  const mentorId = String(formData.get("mentorId") ?? "");
  if (mentorId && mentorId !== user.id) {
    return { status: "error", message: "Permintaan tidak valid." };
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("mentor_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.verification_status === "pending") {
    return {
      status: "error",
      message:
        "CV tidak bisa dihapus selagi pengajuan verifikasi sedang ditinjau.",
    };
  }

  const { data: existing, error: existingError } = await supabase
    .from("mentor_verification_documents")
    .select("storage_path")
    .eq("mentor_id", user.id)
    .maybeSingle();

  if (existingError) {
    return {
      status: "error",
      message: isMissingCvSchema(existingError)
        ? CV_UNAVAILABLE_MESSAGE
        : "Gagal membaca data CV. Coba lagi.",
    };
  }
  if (!existing) {
    return { status: "error", message: "Belum ada CV yang diunggah." };
  }

  await supabase.storage.from(CV_BUCKET).remove([existing.storage_path]);

  const { error: deleteError } = await supabase
    .from("mentor_verification_documents")
    .delete()
    .eq("mentor_id", user.id);

  if (deleteError) {
    return {
      status: "error",
      message: isMissingCvSchema(deleteError)
        ? CV_UNAVAILABLE_MESSAGE
        : "Gagal menghapus CV. Coba lagi.",
    };
  }

  revalidatePath("/mentor");
  return { status: "success", message: "CV dihapus." };
}
