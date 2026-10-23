import { createClient } from "@/lib/supabase/server";

export interface SessionListItem {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: string;
  created_by: string;
  group_id: string | null;
}

export async function listGroupSessions(
  groupId: string,
): Promise<SessionListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_sessions")
    .select("id, title, starts_at, ends_at, status, created_by, group_id")
    .eq("group_id", groupId)
    .order("starts_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as unknown as SessionListItem[];
}

export interface SessionMemberRow {
  user_id: string;
  role: string;
  status: string;
  profiles: { id: string; display_name: string | null } | null;
}

export interface ChecklistItemRow {
  id: string;
  title: string;
  position: number;
  is_completed: boolean;
  created_by: string;
}

export interface SessionNoteRow {
  id: string;
  author_id: string;
  content: string;
  is_shared: boolean;
  created_at: string;
  profiles: { id: string; display_name: string | null } | null;
}

export interface SessionDetail {
  session: {
    id: string;
    title: string;
    objectives: string | null;
    starts_at: string;
    ends_at: string;
    external_meeting_url: string | null;
    status: string;
    created_by: string;
    group_id: string | null;
  };
  members: SessionMemberRow[];
  checklist: ChecklistItemRow[];
  notes: SessionNoteRow[];
}

export async function getSessionDetail(
  sessionId: string,
): Promise<SessionDetail | null> {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("study_sessions")
    .select(
      "id, title, objectives, starts_at, ends_at, external_meeting_url, status, created_by, group_id",
    )
    .eq("id", sessionId)
    .single();

  if (error || !session) return null;

  const [{ data: members }, { data: checklist }, { data: notes }] =
    await Promise.all([
      supabase
        .from("study_session_members")
        .select("user_id, role, status, profiles(id, display_name)")
        .eq("session_id", sessionId),
      supabase
        .from("study_session_checklist_items")
        .select("id, title, position, is_completed, created_by")
        .eq("session_id", sessionId)
        .order("position"),
      supabase
        .from("study_session_notes")
        .select("id, author_id, content, is_shared, created_at, profiles(id, display_name)")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false }),
    ]);

  return {
    session,
    members: (members ?? []) as unknown as SessionMemberRow[],
    checklist: (checklist ?? []) as unknown as ChecklistItemRow[],
    notes: (notes ?? []) as unknown as SessionNoteRow[],
  };
}

export async function getMySessionMembership(
  sessionId: string,
  userId: string,
): Promise<{ role: string; status: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("study_session_members")
    .select("role, status")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  return (data as { role: string; status: string } | null) ?? null;
}
