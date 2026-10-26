"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  AVATAR_BUCKET,
  AVATAR_UNAVAILABLE_MESSAGE,
  avatarExtensionFor,
  isMissingAvatarBucket,
} from "@/lib/profile/avatar";
import { avatarUploadSchema } from "@/lib/validation/avatar";
import type { FormState } from "@/lib/forms/state";

function asFile(value: unknown): File | null {
  if (value === null || typeof value !== "object") return null;
  const candidate = value as Partial<File> & { name?: string; size?: number };
  if (typeof candidate.name !== "string" || typeof candidate.size !== "number") {
    return null;
  }
  if (typeof candidate.arrayBuffer !== "function") return null;
  return value as File;
}

// Files are stored under `<own uid>/avatar-<epoch>.<ext>` so the bucket's
// storage policy (folder must equal auth.uid()) holds. The bytes live only in
// Storage; `profiles.avatar_url` stores the public URL.
export async function uploadAvatar(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/profile");

  const file = asFile(formData.get("avatar"));
  if (!file || file.size === 0) {
    return {
      status: "error",
      message: "Pilih foto terlebih dahulu.",
      fieldErrors: { avatar: "Pilih foto terlebih dahulu." },
    };
  }

  const parsed = avatarUploadSchema.safeParse({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      status: "error",
      message: issue?.message ?? "File foto tidak valid.",
      fieldErrors: { avatar: issue?.message ?? "File foto tidak valid." },
    };
  }

  const supabase = await createClient();

  // Capture the current objects so the old photo can be removed once the new
  // one is safely on file.
  const { data: existingObjects } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(user.id);
  const oldPaths = (existingObjects ?? [])
    .filter((object) => object.name !== ".emptyFolderPlaceholder")
    .map((object) => `${user.id}/${object.name}`);

  const path = `${user.id}/avatar-${Date.now()}.${avatarExtensionFor(
    parsed.data.mimeType,
  )}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      contentType: parsed.data.mimeType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    return {
      status: "error",
      message: isMissingAvatarBucket(uploadError)
        ? AVATAR_UNAVAILABLE_MESSAGE
        : "Mengunggah foto gagal. Coba lagi.",
    };
  }

  const { data: publicUrlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(path);

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    // Do not leave an orphan object behind if the profile write fails.
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
    return {
      status: "error",
      message: updateError
        ? "Gagal menyimpan foto profil. Coba lagi."
        : "Profil belum lengkap. Selesaikan onboarding lalu coba lagi.",
    };
  }

  const stalePaths = oldPaths.filter((oldPath) => oldPath !== path);
  if (stalePaths.length > 0) {
    await supabase.storage.from(AVATAR_BUCKET).remove(stalePaths);
  }

  revalidatePath("/profile");
  revalidatePath("/mentor");
  revalidatePath("/discover");
  return { status: "success", message: "Foto profil berhasil diperbarui." };
}

export async function removeAvatar(): Promise<void> {
  const user = await requireUser("/profile");

  const supabase = await createClient();

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    return;
  }

  const { data: existingObjects } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(user.id);
  const paths = (existingObjects ?? [])
    .filter((object) => object.name !== ".emptyFolderPlaceholder")
    .map((object) => `${user.id}/${object.name}`);

  if (paths.length > 0) {
    await supabase.storage.from(AVATAR_BUCKET).remove(paths);
  }

  revalidatePath("/profile");
  revalidatePath("/mentor");
  revalidatePath("/discover");
}
