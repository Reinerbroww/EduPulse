import { z } from "zod";

export const studySessionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Judul sesi minimal 3 karakter.")
      .max(120, "Judul sesi maksimal 120 karakter."),
    objectives: z
      .string()
      .trim()
      .max(1000, "Tujuan maksimal 1000 karakter.")
      .optional()
      .or(z.literal("")),
    startsAt: z.coerce.date({ message: "Waktu mulai tidak valid." }),
    endsAt: z.coerce.date({ message: "Waktu selesai tidak valid." }),
    externalMeetingUrl: z
      .string()
      .trim()
      .url("Tautan harus berupa URL yang valid.")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "Waktu selesai harus setelah waktu mulai.",
    path: ["endsAt"],
  });

export const checklistItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul item wajib diisi.")
    .max(200, "Maksimal 200 karakter."),
});

export const sessionNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Catatan tidak boleh kosong.")
    .max(4000, "Maksimal 4000 karakter."),
  isShared: z.boolean(),
});
