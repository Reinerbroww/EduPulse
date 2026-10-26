import { z } from "zod";

import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
} from "@/lib/profile/avatar";

// Accepted types: JPG, PNG, WebP. The same limits are enforced in the server
// action and again by the bucket's file_size_limit/allowed_mime_types in
// migration 013.
export const avatarUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "Pilih foto terlebih dahulu.")
    .max(255, "Nama file foto terlalu panjang."),
  mimeType: z
    .string()
    .trim()
    .refine(
      (value) =>
        (AVATAR_ALLOWED_MIME_TYPES as readonly string[]).includes(value),
      "Foto harus berformat JPG, PNG, atau WebP.",
    ),
  sizeBytes: z.coerce
    .number()
    .int("Ukuran file tidak valid.")
    .min(1, "File foto tidak boleh kosong.")
    .max(AVATAR_MAX_BYTES, "Foto maksimal 2 MB."),
});

export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
