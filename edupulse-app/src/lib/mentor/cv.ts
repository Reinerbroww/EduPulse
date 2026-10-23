// Non-"use server" helpers for the mentor CV flow (Server Action modules may
// only export async functions, so constants live here).

export const CV_BUCKET = "mentor-cvs";

export const CV_UNAVAILABLE_MESSAGE =
  "Fitur CV belum aktif di database. Minta pemilik proyek menerapkan migration 012 (tabel mentor_verification_documents + bucket private mentor-cvs) terlebih dahulu.";

// PostgREST answers "unknown table" as PGRST205 (schema-cache miss); a direct
// SQL connection would answer 42P01. Both mean migration 012 has not been run.
export function isMissingCvSchema(
  error: { code?: string | null; message?: string | null } | null | undefined,
): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /mentor_verification_documents/i.test(error.message ?? "")
  );
}

// A missing bucket surfaces as a storage error rather than a PostgREST error.
export function isMissingCvBucket(error: {
  message?: string | null;
} | null): boolean {
  if (!error) return false;
  return /bucket/i.test(error.message ?? "");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
