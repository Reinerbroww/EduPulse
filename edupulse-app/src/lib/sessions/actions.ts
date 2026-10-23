"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  checklistItemSchema,
  sessionNoteSchema,
  studySessionSchema,
} from "@/lib/validation/sessions";
import type { FormState } from "@/lib/forms/state";

export async function createStudySession(
  groupId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser(`/groups/${groupId}`);

  const parsed = studySessionSchema.safeParse({
    title: formData.get("title"),
    objectives: formData.get("objectives") ?? "",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    externalMeetingUrl: formData.get("externalMeetingUrl") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data sesi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("study_sessions")
    .insert({
      created_by: user.id,
      group_id: groupId,
      title: parsed.data.title,
      objectives: parsed.data.objectives || null,
      starts_at: parsed.data.startsAt.toISOString(),
      ends_at: parsed.data.endsAt.toISOString(),
      external_meeting_url: parsed.data.externalMeetingUrl || null,
    })
    .select("id")
    .single();

  if (error || !session) {
    return { status: "error", message: "Gagal membuat sesi. Coba lagi." };
  }

  await supabase.from("study_session_members").insert({
    session_id: session.id,
    user_id: user.id,
    role: "organizer",
    status: "confirmed",
  });

  revalidatePath(`/groups/${groupId}`);
  redirect(`/sessions/${session.id}`);
}

export async function joinSession(formData: FormData): Promise<void> {
  const user = await requireUser("/groups");
  const sessionId = formData.get("sessionId") as string;
  if (!sessionId) return;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("study_session_members")
    .select("status")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("study_session_members")
      .update({ status: "confirmed", responded_at: new Date().toISOString() })
      .eq("session_id", sessionId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("study_session_members").insert({
      session_id: sessionId,
      user_id: user.id,
      role: "participant",
      status: "confirmed",
    });
  }

  revalidatePath(`/sessions/${sessionId}`);
}

export async function leaveSession(formData: FormData): Promise<void> {
  const user = await requireUser("/groups");
  const sessionId = formData.get("sessionId") as string;
  if (!sessionId) return;

  const supabase = await createClient();
  await supabase
    .from("study_session_members")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", user.id);

  revalidatePath(`/sessions/${sessionId}`);
}

export async function addChecklistItem(formData: FormData): Promise<void> {
  const user = await requireUser("/groups");
  const sessionId = formData.get("sessionId") as string;
  if (!sessionId) return;

  const parsed = checklistItemSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return;

  const supabase = await createClient();

  const { count } = await supabase
    .from("study_session_checklist_items")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  await supabase.from("study_session_checklist_items").insert({
    session_id: sessionId,
    created_by: user.id,
    title: parsed.data.title,
    position: count ?? 0,
  });

  revalidatePath(`/sessions/${sessionId}`);
}

export async function toggleChecklistItem(formData: FormData): Promise<void> {
  const user = await requireUser("/groups");
  const sessionId = formData.get("sessionId") as string;
  const itemId = formData.get("itemId") as string;
  const completed = formData.get("completed") === "true";
  if (!sessionId || !itemId) return;

  const supabase = await createClient();
  await supabase
    .from("study_session_checklist_items")
    .update({
      is_completed: !completed,
      completed_by: !completed ? user.id : null,
      completed_at: !completed ? new Date().toISOString() : null,
    })
    .eq("id", itemId)
    .eq("session_id", sessionId);

  revalidatePath(`/sessions/${sessionId}`);
}

export async function addSessionNote(formData: FormData): Promise<void> {
  const user = await requireUser("/groups");
  const sessionId = formData.get("sessionId") as string;
  if (!sessionId) return;

  const parsed = sessionNoteSchema.safeParse({
    content: formData.get("content"),
    isShared: formData.get("isShared") === "on",
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("study_session_notes").insert({
    session_id: sessionId,
    author_id: user.id,
    content: parsed.data.content,
    is_shared: parsed.data.isShared,
  });

  revalidatePath(`/sessions/${sessionId}`);
}
