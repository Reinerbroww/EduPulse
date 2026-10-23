import { z } from "zod";

export const educationLevelSchema = z.enum([
  "school",
  "university",
  "independent",
  "other",
]);

export const ageBandSchema = z.enum(["not_set", "under_18", "18_or_over"]);

export const profileVisibilitySchema = z.enum(["discoverable", "private"]);

export const skillLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "not_sure",
]);

export const onboardingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Nama tampilan minimal 2 karakter.")
    .max(60, "Nama tampilan maksimal 60 karakter."),
  educationLevel: educationLevelSchema,
  ageBand: ageBandSchema,
  profileVisibility: profileVisibilitySchema,
  timezone: z.string().trim().min(1).max(64).default("UTC"),
  skillLevel: skillLevelSchema,
  topicIds: z.array(z.string().uuid()).max(20).default([]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
