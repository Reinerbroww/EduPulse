import { z } from "zod";

import { GROUP_COVER_KEYS } from "@/lib/groups/covers";

export const groupVisibilitySchema = z.enum(["public", "invite_only"]);

export const studyGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama kelompok minimal 3 karakter.")
    .max(80, "Nama kelompok maksimal 80 karakter."),
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
  learningGoalId: z
    .string()
    .uuid("Pilih tujuan yang valid.")
    .optional()
    .or(z.literal("")),
  maxMembers: z.coerce
    .number()
    .int("Jumlah anggota harus bilangan bulat.")
    .min(2, "Minimal 2 anggota.")
    .max(50, "Maksimal 50 anggota."),
  visibility: groupVisibilitySchema,
  // Only identifiers from the curated allow-list are accepted — never an
  // arbitrary path or an external URL. An empty value means "use the fallback".
  coverImageKey: z
    .enum(GROUP_COVER_KEYS, "Pilih sampul yang tersedia.")
    .optional()
    .or(z.literal("")),
});

export type StudyGroupInput = z.infer<typeof studyGroupSchema>;
