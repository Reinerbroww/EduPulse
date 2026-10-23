"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { learningGoalSchema } from "@/lib/validation/goals";
import type { FormState } from "@/lib/forms/state";

function parseGoalForm(formData: FormData) {
  return learningGoalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    topicId: formData.get("topicId") ?? "",
    targetDate: formData.get("targetDate") ?? "",
    supportMode: formData.get("supportMode"),
    visibility: formData.get("visibility"),
  });
}

export async function createLearningGoal(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/goals/new");

  const parsed = parseGoalForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data tujuan belajar.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("learning_goals").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    topic_id: parsed.data.topicId || null,
    target_date: parsed.data.targetDate || null,
    support_mode: parsed.data.supportMode,
    visibility: parsed.data.visibility,
  });

  if (error) {
    return { status: "error", message: "Gagal menyimpan tujuan. Coba lagi." };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  // Redirect on success so the dedicated form route does not linger after save.
  redirect("/goals");
}

export async function updateLearningGoal(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/goals");

  const goalId = String(formData.get("goalId") ?? "");
  if (!goalId) {
    return { status: "error", message: "Tujuan tidak ditemukan." };
  }

  const parsed = parseGoalForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data tujuan belajar.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("learning_goals")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      topic_id: parsed.data.topicId || null,
      target_date: parsed.data.targetDate || null,
      support_mode: parsed.data.supportMode,
      visibility: parsed.data.visibility,
    })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: "Gagal memperbarui tujuan. Coba lagi." };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath(`/goals/${goalId}`);
  redirect(`/goals/${goalId}`);
}

export async function updateGoalStatus(formData: FormData): Promise<void> {
  const user = await requireUser("/goals");
  const goalId = formData.get("goalId") as string;
  const status = formData.get("status") as string;

  const allowed = ["active", "completed", "paused", "archived"];
  if (!goalId || !allowed.includes(status)) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("learning_goals")
    .update({ status })
    .eq("id", goalId)
    .eq("user_id", user.id);

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}
