import { z } from "zod";

export const sessionSummarySchema = z.object({
  bookingId: z.string().uuid("Sesi tidak valid."),
  summary: z
    .string()
    .trim()
    .min(1, "Tuliskan apa yang kamu pelajari.")
    .max(4000, "Ringkasan maksimal 4000 karakter."),
  nextSteps: z
    .string()
    .trim()
    .max(2000, "Langkah berikutnya maksimal 2000 karakter.")
    .optional()
    .or(z.literal("")),
});

export const mentorFeedbackSchema = z.object({
  bookingId: z.string().uuid("Sesi tidak valid."),
  rating: z.coerce
    .number()
    .int("Penilaian harus bilangan bulat.")
    .min(1, "Pilih penilaian 1 sampai 5.")
    .max(5, "Penilaian maksimal 5."),
  comment: z
    .string()
    .trim()
    .max(1000, "Komentar maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
});

export const goalProgressUpdateSchema = z.object({
  learningGoalId: z.string().uuid("Tujuan tidak valid."),
  progressPercent: z.coerce
    .number()
    .int("Progres harus bilangan bulat.")
    .min(0, "Progres minimal 0%.")
    .max(100, "Progres maksimal 100%."),
  updateText: z
    .string()
    .trim()
    .max(2000, "Catatan maksimal 2000 karakter.")
    .optional()
    .or(z.literal("")),
  nextStep: z
    .string()
    .trim()
    .max(1000, "Langkah berikutnya maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
  sourceStudySessionId: z.string().uuid().optional().or(z.literal("")),
  sourceMentorBookingId: z.string().uuid().optional().or(z.literal("")),
});

export type SessionSummaryInput = z.infer<typeof sessionSummarySchema>;
export type MentorFeedbackInput = z.infer<typeof mentorFeedbackSchema>;
export type GoalProgressUpdateInput = z.infer<typeof goalProgressUpdateSchema>;
