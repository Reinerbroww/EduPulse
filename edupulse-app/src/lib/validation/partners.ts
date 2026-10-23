import { z } from "zod";

export const partnerRequestSchema = z.object({
  recipientId: z.string().uuid("Penerima tidak valid."),
  learningGoalId: z
    .string()
    .uuid("Tujuan belajar tidak valid.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(500, "Pesan maksimal 500 karakter.")
    .optional()
    .or(z.literal("")),
});

export const partnerResponseSchema = z.object({
  requestId: z.string().uuid("Permintaan tidak valid."),
  action: z.enum(["accept", "reject", "cancel"]),
});

export const reportReasonSchema = z.enum([
  "harassment",
  "misleading_profile",
  "unsafe_behavior",
  "spam",
  "payment_issue",
  "other",
]);

export const reportSchema = z.object({
  reportedUserId: z.string().uuid("Pengguna tidak valid."),
  reasonCode: reportReasonSchema,
  details: z
    .string()
    .trim()
    .max(1000, "Detail maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
  studyGroupId: z.string().uuid().optional().or(z.literal("")),
  studySessionId: z.string().uuid().optional().or(z.literal("")),
  mentorBookingId: z.string().uuid().optional().or(z.literal("")),
});

export const blockSchema = z.object({
  blockedUserId: z.string().uuid("Pengguna tidak valid."),
});
