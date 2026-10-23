import { createClient } from "@/lib/supabase/server";
import { isMissingCoverColumn } from "@/lib/groups/covers";

const GROUP_LIST_COLUMNS =
  "id, name, description, topic_id, max_members, visibility, status, owner_id, created_at, topics(name), study_group_members(count)";

export interface GroupListItem {
  id: string;
  name: string;
  description: string | null;
  topic_id: string | null;
  max_members: number;
  visibility: string;
  status: string;
  owner_id: string;
  cover_image_key: string | null;
  created_at: string;
  topics: { name: string } | null;
  study_group_members: { count: number }[] | null;
}

export async function listVisibleGroups(): Promise<GroupListItem[]> {
  const supabase = await createClient();

  const withCover = await supabase
    .from("study_groups")
    .select(
      `id, name, description, topic_id, max_members, visibility, status, owner_id, cover_image_key, created_at, topics(name), study_group_members(count)`,
    )
    .order("created_at", { ascending: false });

  if (!withCover.error) {
    return (withCover.data ?? []) as unknown as GroupListItem[];
  }

  if (!isMissingCoverColumn(withCover.error)) return [];

  const legacy = await supabase
    .from("study_groups")
    .select(GROUP_LIST_COLUMNS)
    .order("created_at", { ascending: false });

  if (legacy.error) return [];

  return (legacy.data ?? []).map((group) => ({
    ...(group as unknown as Omit<GroupListItem, "cover_image_key">),
    cover_image_key: null,
  }));
}

export interface MembershipRow {
  group_id: string;
  user_id: string;
  role: string;
  status: string;
}

export async function listMyMemberships(
  userId: string,
): Promise<MembershipRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_group_members")
    .select("group_id, user_id, role, status")
    .eq("user_id", userId);

  if (error) return [];
  return (data ?? []) as unknown as MembershipRow[];
}

export interface GroupMemberRow {
  user_id: string;
  role: string;
  status: string;
  joined_at: string | null;
  requested_at: string;
  profiles: { id: string; display_name: string | null } | null;
}

export interface GroupDetail {
  group: {
    id: string;
    name: string;
    description: string | null;
    topic_id: string | null;
    learning_goal_id: string | null;
    max_members: number;
    visibility: string;
    status: string;
    owner_id: string;
    cover_image_key: string | null;
    created_at: string;
  };
  members: GroupMemberRow[];
}

export async function getGroupDetail(
  groupId: string,
): Promise<GroupDetail | null> {
  const supabase = await createClient();
  const withCover = await supabase
    .from("study_groups")
    .select(
      "id, name, description, topic_id, learning_goal_id, max_members, visibility, status, owner_id, cover_image_key, created_at",
    )
    .eq("id", groupId)
    .single();

  let group = withCover.data;

  if (withCover.error) {
    if (!isMissingCoverColumn(withCover.error)) return null;

    const legacy = await supabase
      .from("study_groups")
      .select(
        "id, name, description, topic_id, learning_goal_id, max_members, visibility, status, owner_id, created_at",
      )
      .eq("id", groupId)
      .single();

    if (legacy.error || !legacy.data) return null;
    group = { ...legacy.data, cover_image_key: null };
  }

  if (!group) return null;

  const { data: members } = await supabase
    .from("study_group_members")
    .select(
      "user_id, role, status, joined_at, requested_at, profiles(id, display_name)",
    )
    .eq("group_id", groupId)
    .order("requested_at");

  return {
    group,
    members: (members ?? []) as unknown as GroupMemberRow[],
  };
}

export async function getMyMembership(
  groupId: string,
  userId: string,
): Promise<MembershipRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("study_group_members")
    .select("group_id, user_id, role, status")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  return (data as MembershipRow | null) ?? null;
}
