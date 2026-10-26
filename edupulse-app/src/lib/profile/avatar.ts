// Non-"use server" helpers for the profile avatar flow (Server Action modules
// may only export async functions, so constants live here).

export const AVATAR_BUCKET = "avatars";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AvatarMimeType = (typeof AVATAR_ALLOWED_MIME_TYPES)[number];

export const AVATAR_UNAVAILABLE_MESSAGE =
  "Fitur foto profil belum aktif di database. Minta pemilik proyek menerapkan migration 013 (bucket public avatars) terlebih dahulu.";

const EXTENSION_BY_MIME: Record<AvatarMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function avatarExtensionFor(mimeType: string): string {
  return EXTENSION_BY_MIME[mimeType as AvatarMimeType] ?? "jpg";
}

// A missing bucket surfaces as a storage error rather than a PostgREST error.
export function isMissingAvatarBucket(error: {
  message?: string | null;
} | null): boolean {
  if (!error) return false;
  return /bucket/i.test(error.message ?? "");
}
