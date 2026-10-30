import { z } from "zod";

export const supportModeSchema = z.enum(["partner", "group", "mentor"]);

export const supportModesSchema = z
  .array(supportModeSchema)
  .min(1, "Pilih minimal satu dukungan belajar.")
  .max(3);

export const goalVisibilitySchema = z.enum(["private", "matchable"]);

export const learningGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul tujuan minimal 3 karakter.")
    .max(120, "Judul tujuan maksimal 120 karakter."),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
  topicId: z
    .string()
    .uuid("Pilih topik yang valid.")
    .optional()
    .or(z.literal("")),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
    .optional()
    .or(z.literal("")),
  supportModes: supportModesSchema,
  visibility: goalVisibilitySchema,
});

export type LearningGoalInput = z.infer<typeof learningGoalSchema>;
