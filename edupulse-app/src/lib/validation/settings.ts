import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const availabilitySchema = z
  .object({
    dayOfWeek: z.coerce
      .number()
      .int("Hari tidak valid.")
      .min(0)
      .max(6, "Hari tidak valid."),
    startTime: z.string().regex(timeRegex, "Format jam tidak valid."),
    endTime: z.string().regex(timeRegex, "Format jam tidak valid."),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Jam selesai harus setelah jam mulai.",
    path: ["endTime"],
  });

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
