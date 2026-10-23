"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { isMissingCoverColumn } from "@/lib/groups/covers";
import { createClient } from "@/lib/supabase/server";
import { studyGroupSchema } from "@/lib/validation/groups";
import type { FormState } from "@/lib/forms/state";

export async function createStudyGroup(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/groups");

  const parsed = studyGroupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    topicId: formData.get("topicId") ?? "",
    learningGoalId: formData.get("learningGoalId") ?? "",
    maxMembers: formData.get("maxMembers"),
    visibility: formData.get("visibility"),
    coverImageKey: formData.get("coverImageKey") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data kelompok.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();

  const baseRow = {
    owner_id: user.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    topic_id: parsed.data.topicId || null,
    learning_goal_id: parsed.data.learningGoalId || null,
    max_members: parsed.data.maxMembers,
    visibility: parsed.data.visibility,
  };

  const withCover = await supabase
    .from("study_groups")
    .insert({ ...baseRow, cover_image_key: parsed.data.coverImageKey || null })
    .select("id")
    .single();

  let group = withCover.data;

  if (withCover.error) {
    // `study_groups.cover_image_key` arrives with migration 012. If the
    // migration has not been applied yet, create the group anyway (the record
    // simply falls back to the default cover) instead of blocking creation.
    if (!isMissingCoverColumn(withCover.error)) {
      return { status: "error", message: "Gagal membuat kelompok. Coba lagi." };
    }

    const legacy = await supabase
      .from("study_groups")
      .insert(baseRow)
      .select("id")
      .single();

    if (legacy.error || !legacy.data) {
      return { status: "error", message: "Gagal membuat kelompok. Coba lagi." };
    }
    group = legacy.data;
  }

  if (!group) {
    return { status: "error", message: "Gagal membuat kelompok. Coba lagi." };
  }

  const { error: memberError } = await supabase
    .from("study_group_members")
    .insert({
      group_id: group.id,
      user_id: user.id,
      role: "owner",
      status: "active",
      joined_at: new Date().toISOString(),
    });

  if (memberError) {
    return {
      status: "error",
      message: "Kelompok dibuat, tetapi gagal menambahkanmu sebagai pemilik.",
    };
  }

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

export async function requestJoinGroup(formData: FormData): Promise<void> {
  const user = await requireUser("/groups");
  const groupId = formData.get("groupId") as string;
  if (!groupId) return;

  const supabase = await createClient();

  const { data: group } = await supabase
    .from("study_groups")
    .select("id, visibility, status, max_members")
    .eq("id", groupId)
    .single();

  if (!group || group.status !== "active") return;

  const { data: existing } = await supabase
    .from("study_group_members")
    .select("status")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing && existing.status !== "rejected" && existing.status !== "left") {
    revalidatePath(`/groups/${groupId}`);
    return;
  }

  const { count } = await supabase
    .from("study_group_members")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId)
    .eq("status", "active");

  if ((count ?? 0) >= group.max_members) {
    revalidatePath(`/groups/${groupId}`);
    return;
  }

  if (existing) {
    await supabase
      .from("study_group_members")
      .update({ status: "pending", requested_at: new Date().toISOString() })
      .eq("group_id", groupId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("study_group_members").insert({
      group_id: groupId,
      user_id: user.id,
      role: "member",
      status: "pending",
    });
  }

  revalidatePath(`/groups/${groupId}`);
}

export async function respondJoinRequest(formData: FormData): Promise<void> {
  await requireUser("/groups");
  const groupId = formData.get("groupId") as string;
  const memberId = formData.get("memberId") as string;
  const decision = formData.get("decision") as string;

  if (!groupId || !memberId || !["approve", "reject"].includes(decision)) {
    return;
  }

  const supabase = await createClient();

  const { data: group } = await supabase
    .from("study_groups")
    .select("id, owner_id, max_members")
    .eq("id", groupId)
    .single();

  if (!group) return;

  if (decision === "approve") {
    const { count } = await supabase
      .from("study_group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("status", "active");

    if ((count ?? 0) >= group.max_members) {
      revalidatePath(`/groups/${groupId}`);
      return;
    }
  }

  await supabase
    .from("study_group_members")
    .update({
      status: decision === "approve" ? "active" : "rejected",
      responded_at: new Date().toISOString(),
      joined_at: decision === "approve" ? new Date().toISOString() : null,
    })
    .eq("group_id", groupId)
    .eq("user_id", memberId);

  revalidatePath(`/groups/${groupId}`);
}

export async function leaveGroup(formData: FormData): Promise<void> {
  const user = await requireUser("/groups");
  const groupId = formData.get("groupId") as string;
  if (!groupId) return;

  const supabase = await createClient();
  await supabase
    .from("study_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  revalidatePath("/groups");
  redirect("/groups");
}
