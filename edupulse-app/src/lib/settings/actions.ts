"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { availabilitySchema } from "@/lib/validation/settings";
import type { FormState } from "@/lib/forms/state";

export async function addAvailability(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/profile");

  const parsed = availabilitySchema.safeParse({
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali jadwal yang kamu isi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_availability").insert({
    user_id: user.id,
    day_of_week: parsed.data.dayOfWeek,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    is_active: true,
  });

  if (error) {
    return { status: "error", message: "Gagal menambah jadwal. Coba lagi." };
  }

  revalidatePath("/profile");
  return { status: "success", message: "Jadwal belajar ditambahkan." };
}

export async function deleteAvailability(formData: FormData): Promise<void> {
  const user = await requireUser("/profile");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("user_availability")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/profile");
}

export async function toggleAvailability(formData: FormData): Promise<void> {
  const user = await requireUser("/profile");
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("user_availability")
    .update({ is_active: next })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/profile");
}
