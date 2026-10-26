import { z } from "zod";

export const mentorProfileSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(3, "Judul singkat minimal 3 karakter.")
    .max(120, "Judul singkat maksimal 120 karakter."),
  expertiseSummary: z
    .string()
    .trim()
    .min(10, "Ringkasan keahlian minimal 10 karakter.")
    .max(2000, "Ringkasan keahlian maksimal 2000 karakter."),
  // The empty-string branch MUST come first: `z.coerce.number()` would coerce
  // "" to 0 and win the union, silently storing "0 tahun pengalaman" for a
  // field the user left blank.
  experienceYears: z
    .union([
      z.literal("").transform(() => null),
      z.coerce.number().int().min(0).max(60),
    ])
    .optional(),
  isAcceptingBookings: z.coerce.boolean().optional(),
});

export const mentorServiceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul layanan minimal 3 karakter.")
    .max(120, "Judul layanan maksimal 120 karakter."),
  description: z
    .string()
    .trim()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(2000, "Deskripsi maksimal 2000 karakter."),
  topicId: z.string().uuid().optional().or(z.literal("")),
  durationMinutes: z.coerce
    .number()
    .int("Durasi harus bilangan bulat.")
    .min(15, "Durasi minimal 15 menit.")
    .max(480, "Durasi maksimal 480 menit."),
  deliveryMode: z.enum(["online_external", "in_person"]),
  priceType: z.enum(["free", "paid"]),
  priceAmount: z.coerce.number().min(0, "Harga tidak boleh negatif."),
  cancellationPolicy: z
    .string()
    .trim()
    .min(3, "Ketentuan pembatalan minimal 3 karakter.")
    .max(1000, "Ketentuan pembatalan maksimal 1000 karakter."),
});

export const mentorSlotSchema = z
  .object({
    startsAt: z.string().min(1, "Waktu mulai wajib diisi."),
    endsAt: z.string().min(1, "Waktu selesai wajib diisi."),
  })
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    message: "Waktu selesai harus setelah waktu mulai.",
    path: ["endsAt"],
  })
  // A slot that starts in the past can never be booked: the booking page only
  // lists slots with `starts_at > now`, so it would silently vanish and the
  // learner would see "tidak ada slot tersedia". Reject it at creation instead.
  .refine((value) => new Date(value.startsAt).getTime() > Date.now(), {
    message: "Waktu mulai harus di masa depan.",
    path: ["startsAt"],
  });

export type MentorProfileInput = z.infer<typeof mentorProfileSchema>;
export type MentorServiceInput = z.infer<typeof mentorServiceSchema>;
export type MentorSlotInput = z.infer<typeof mentorSlotSchema>;

// ── Mentor CV (verification document) ────────────────────────────────────────
// First version accepts PDF only, 5 MB maximum. The same limits are enforced
// on the client (for instant feedback) and again in the server action, and a
// third time by the bucket's file_size_limit/allowed_mime_types in migration 012.
export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const CV_ALLOWED_MIME_TYPE = "application/pdf";
export const CV_ALLOWED_EXTENSION = ".pdf";
export const CV_BUCKET = "mentor-cvs";

export const cvUploadSchema = z
  .object({
    fileName: z
      .string()
      .trim()
      .min(1, "Pilih file CV terlebih dahulu.")
      .max(255, "Nama file CV terlalu panjang."),
    mimeType: z
      .string()
      .trim()
      .refine((value) => value === CV_ALLOWED_MIME_TYPE, "File CV harus berformat PDF."),
    sizeBytes: z.coerce
      .number()
      .int("Ukuran file tidak valid.")
      .min(1, "File CV tidak boleh kosong.")
      .max(CV_MAX_BYTES, "File CV maksimal 5 MB."),
  })
  .refine(
    (value) => value.fileName.toLowerCase().endsWith(CV_ALLOWED_EXTENSION),
    { message: "Nama file CV harus berakhiran .pdf.", path: ["fileName"] },
  );

export type CvUploadInput = z.infer<typeof cvUploadSchema>;
