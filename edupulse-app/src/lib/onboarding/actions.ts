"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/onboarding";
import type { FormState } from "@/lib/forms/state";

export async function completeOnboarding(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/onboarding");

  const topicIds = formData
    .getAll("topicIds")
    .filter((value): value is string => typeof value === "string" && value !== "");

  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    educationLevel: formData.get("educationLevel"),
    ageBand: formData.get("ageBand"),
    profileVisibility: formData.get("profileVisibility"),
    timezone: formData.get("timezone") || "UTC",
    skillLevel: formData.get("skillLevel"),
    topicIds,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data profil kamu.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();

  // Upsert (not update): accounts created before the on_auth_user_created
  // trigger existed have no `profiles` row yet, and `user_safety_settings`
  // references it. Upserting also keeps the save idempotent.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        display_name: parsed.data.displayName,
        education_level: parsed.data.educationLevel,
        timezone: parsed.data.timezone,
        onboarding_completed: true,
      },
      { onConflict: "id" },
    );

  if (profileError) {
    return { status: "error", message: "Gagal menyimpan profil. Coba lagi." };
  }

  const { error: safetyError } = await supabase
    .from("user_safety_settings")
    .upsert(
      {
        user_id: user.id,
        age_band: parsed.data.ageBand,
        profile_visibility: parsed.data.profileVisibility,
      },
      { onConflict: "user_id" },
    );

  if (safetyError) {
    return {
      status: "error",
      message: "Gagal menyimpan preferensi keselamatan. Coba lagi.",
    };
  }

  await supabase.from("profile_topics").delete().eq("profile_id", user.id);

  if (parsed.data.topicIds.length > 0) {
    const rows = parsed.data.topicIds.map((topicId) => ({
      profile_id: user.id,
      topic_id: topicId,
      interest_type: "learning" as const,
      skill_level: parsed.data.skillLevel,
    }));

    const { error: topicsError } = await supabase
      .from("profile_topics")
      .insert(rows);

    if (topicsError) {
      return { status: "error", message: "Gagal menyimpan topik belajar." };
    }
  }

  redirect("/dashboard");
}
