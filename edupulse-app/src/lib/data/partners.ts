import { createClient } from "@/lib/supabase/server";
import { listActiveTopics } from "@/lib/data/topics";

export interface ProfileSummary {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  education_level: string | null;
  bio: string | null;
}

export interface TaggedTopic {
  topic_id: string;
  name: string;
  interest_type: string;
  skill_level: string;
}

export interface MatchReason {
  kind: "topic" | "goal" | "availability";
  label: string;
}

export interface MatchCandidate {
  profile: ProfileSummary;
  score: number;
  reasons: MatchReason[];
}

export interface PartnerGoal {
  id: string;
  title: string;
  topic_id: string | null;
  topicName: string | null;
  support_mode: string;
  target_date: string | null;
}

export interface PartnerDetail {
  profile: ProfileSummary;
  topics: TaggedTopic[];
  goals: PartnerGoal[];
  availabilityDays: number[];
  blockedByMe: boolean;
  request: {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: string;
    message: string | null;
    created_at: string;
  } | null;
  reasons: MatchReason[];
}

export interface PartnerRequestListItem {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  message: string | null;
  learning_goal_id: string | null;
  created_at: string;
  updated_at: string;
  counterpart: ProfileSummary | null;
}

interface ViewerContext {
  userId: string;
  topicIds: Set<string>;
  goalTopicIds: Set<string>;
  days: Set<number>;
}

interface CandidateRaw {
  profile: ProfileSummary;
  topicIds: string[];
  goalTopicIds: string[];
  days: number[];
}

const PROFILE_COLUMNS =
  "id, display_name, avatar_url, education_level, bio";

async function getTopicNameMap(): Promise<Map<string, string>> {
  const topics = await listActiveTopics();
  return new Map(topics.map((t) => [t.id, t.name]));
}

export async function getBlockedUserIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_blocks")
    .select("blocked_user_id")
    .eq("blocker_id", userId);

  return new Set((data ?? []).map((r) => r.blocked_user_id as string));
}

export interface BlockedUser {
  blocked_user_id: string;
  display_name: string | null;
}

export async function listBlockedProfiles(
  userId: string,
): Promise<BlockedUser[]> {
  const supabase = await createClient();
  const { data: blocks } = await supabase
    .from("user_blocks")
    .select("blocked_user_id, created_at")
    .eq("blocker_id", userId)
    .order("created_at", { ascending: false });

  const blockedIds = (blocks ?? []).map((r) => r.blocked_user_id as string);
  if (blockedIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", blockedIds);

  const nameMap = new Map(
    ((profiles ?? []) as { id: string; display_name: string | null }[]).map(
      (p) => [p.id, p.display_name],
    ),
  );

  return blockedIds.map((id) => ({
    blocked_user_id: id,
    display_name: nameMap.get(id) ?? null,
  }));
}

function dayLabel(day: number): string {
  return (
    ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][day] ??
    "Hari"
  );
}

function buildReasons(
  viewer: ViewerContext,
  candidate: CandidateRaw,
  topicNames: Map<string, string>,
): MatchReason[] {
  const reasons: MatchReason[] = [];

  const sharedTopics = candidate.topicIds.filter((id) =>
    viewer.topicIds.has(id),
  );
  if (sharedTopics.length > 0) {
    const names = sharedTopics
      .map((id) => topicNames.get(id))
      .filter((n): n is string => Boolean(n));
    if (names.length > 0) {
      reasons.push({
        kind: "topic",
        label: `Minat topik sama: ${names.join(", ")}`,
      });
    }
  }

  const sharedGoals = candidate.goalTopicIds.filter((id) =>
    viewer.goalTopicIds.has(id),
  );
  if (sharedGoals.length > 0) {
    const names = sharedGoals
      .map((id) => topicNames.get(id))
      .filter((n): n is string => Boolean(n));
    if (names.length > 0) {
      reasons.push({
        kind: "goal",
        label: `Tujuan belajar searah: ${names.join(", ")}`,
      });
    }
  }

  const sharedDays = candidate.days.filter((d) => viewer.days.has(d));
  if (sharedDays.length > 0) {
    reasons.push({
      kind: "availability",
      label: `Waktu luang beririsan: ${sharedDays
        .map(dayLabel)
        .join(", ")}`,
    });
  }

  return reasons;
}

function scoreReasons(reasons: MatchReason[]): number {
  return reasons.reduce((total, reason) => {
    if (reason.kind === "topic") return total + 3;
    if (reason.kind === "goal") return total + 2;
    return total + 1;
  }, 0);
}

export async function listMatchCandidates(): Promise<MatchCandidate[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [profilesRes, topicsRes, goalsRes, availRes, blocksRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("onboarding_completed", true),
      supabase
        .from("profile_topics")
        .select("profile_id, topic_id, interest_type, skill_level"),
      supabase
        .from("learning_goals")
        .select(
          "user_id, topic_id, title, support_mode, status, visibility",
        ),
      supabase
        .from("user_availability")
        .select("user_id, day_of_week, is_active"),
      supabase
        .from("user_blocks")
        .select("blocked_user_id")
        .eq("blocker_id", user.id),
    ]);

  const profiles = (profilesRes.data ?? []) as unknown as ProfileSummary[];
  const allTopics = (topicsRes.data ?? []) as {
    profile_id: string;
    topic_id: string;
  }[];
  const allGoals = (goalsRes.data ?? []) as {
    user_id: string;
    topic_id: string | null;
    status: string;
    visibility: string;
  }[];
  const allAvail = (availRes.data ?? []) as {
    user_id: string;
    day_of_week: number;
    is_active: boolean;
  }[];
  const blockedIds = new Set(
    (blocksRes.data ?? []).map((r) => r.blocked_user_id as string),
  );

  const viewer: ViewerContext = {
    userId: user.id,
    topicIds: new Set(
      allTopics.filter((r) => r.profile_id === user.id).map((r) => r.topic_id),
    ),
    goalTopicIds: new Set(
      allGoals
        .filter(
          (r) =>
            r.user_id === user.id &&
            r.status === "active" &&
            r.topic_id != null,
        )
        .map((r) => r.topic_id as string),
    ),
    days: new Set(
      allAvail
        .filter((r) => r.user_id === user.id && r.is_active)
        .map((r) => r.day_of_week),
    ),
  };

  const topicNames = await getTopicNameMap();

  const candidates: MatchCandidate[] = [];

  for (const profile of profiles) {
    if (profile.id === user.id) continue;
    if (blockedIds.has(profile.id)) continue;

    const candidate: CandidateRaw = {
      profile,
      topicIds: allTopics
        .filter((r) => r.profile_id === profile.id)
        .map((r) => r.topic_id),
      goalTopicIds: allGoals
        .filter(
          (r) =>
            r.user_id === profile.id &&
            r.status === "active" &&
            r.visibility === "matchable" &&
            r.topic_id != null,
        )
        .map((r) => r.topic_id as string),
      days: allAvail
        .filter((r) => r.user_id === profile.id && r.is_active)
        .map((r) => r.day_of_week),
    };

    const reasons = buildReasons(viewer, candidate, topicNames);
    if (reasons.length === 0) continue;

    candidates.push({
      profile,
      reasons,
      score: scoreReasons(reasons),
    });
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.profile.display_name ?? "").localeCompare(
      b.profile.display_name ?? "",
    );
  });

  return candidates.slice(0, 24);
}

export async function getPartnerDetail(
  partnerId: string,
): Promise<PartnerDetail | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", partnerId)
    .maybeSingle();

  if (!profile) return null;
  const partner = profile as unknown as ProfileSummary;

  const topicNames = await getTopicNameMap();

  const [topicsRes, goalsRes, availRes, blockRes, requestRes, viewerRes] =
    await Promise.all([
      supabase
        .from("profile_topics")
        .select("profile_id, topic_id, interest_type, skill_level")
        .eq("profile_id", partnerId),
      supabase
        .from("learning_goals")
        .select("id, title, topic_id, support_mode, target_date, status, visibility")
        .eq("user_id", partnerId)
        .eq("status", "active")
        .eq("visibility", "matchable")
        .order("created_at", { ascending: false }),
      supabase
        .from("user_availability")
        .select("user_id, day_of_week, is_active")
        .eq("user_id", partnerId)
        .eq("is_active", true),
      supabase
        .from("user_blocks")
        .select("blocked_user_id")
        .eq("blocker_id", user.id)
        .eq("blocked_user_id", partnerId)
        .maybeSingle(),
      supabase
        .from("study_partner_requests")
        .select("id, requester_id, recipient_id, status, message, created_at")
        .or(
          `and(requester_id.eq.${user.id},recipient_id.eq.${partnerId}),and(requester_id.eq.${partnerId},recipient_id.eq.${user.id})`,
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("profile_topics")
        .select("topic_id")
        .eq("profile_id", user.id),
    ]);

  const topics = (topicsRes.data ?? []) as {
    topic_id: string;
    interest_type: string;
    skill_level: string;
  }[];

  const goals = (goalsRes.data ?? []) as {
    id: string;
    title: string;
    topic_id: string | null;
    support_mode: string;
    target_date: string | null;
  }[];

  const availabilityDays = (availRes.data ?? []).map(
    (r) => r.day_of_week as number,
  );

  const viewerTopics = new Set(
    (viewerRes.data ?? []).map((r) => r.topic_id as string),
  );

  const candidate: CandidateRaw = {
    profile: partner,
    topicIds: topics.map((t) => t.topic_id),
    goalTopicIds: goals
      .filter((g) => g.topic_id != null)
      .map((g) => g.topic_id as string),
    days: availabilityDays,
  };

  const reasons = buildReasons(
    {
      userId: user.id,
      topicIds: viewerTopics,
      goalTopicIds: new Set(),
      days: new Set(),
    },
    candidate,
    topicNames,
  );

  return {
    profile: partner,
    topics: topics.map((t) => ({
      topic_id: t.topic_id,
      name: topicNames.get(t.topic_id) ?? "Topik",
      interest_type: t.interest_type,
      skill_level: t.skill_level,
    })),
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      topic_id: g.topic_id,
      topicName: g.topic_id ? topicNames.get(g.topic_id) ?? null : null,
      support_mode: g.support_mode,
      target_date: g.target_date,
    })),
    availabilityDays,
    blockedByMe: Boolean(blockRes.data),
    request: requestRes.data ?? null,
    reasons,
  };
}

export async function listMyPartnerRequests(): Promise<{
  incoming: PartnerRequestListItem[];
  outgoing: PartnerRequestListItem[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { incoming: [], outgoing: [] };

  const [incomingRes, outgoingRes] = await Promise.all([
    supabase
      .from("study_partner_requests")
      .select(
        "id, requester_id, recipient_id, status, message, learning_goal_id, created_at, updated_at",
      )
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("study_partner_requests")
      .select(
        "id, requester_id, recipient_id, status, message, learning_goal_id, created_at, updated_at",
      )
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const rows = [
    ...(incomingRes.data ?? []),
    ...(outgoingRes.data ?? []),
  ] as unknown as PartnerRequestListItem[];

  const counterpartIds = new Set<string>();
  for (const row of rows) {
    counterpartIds.add(
      row.requester_id === user.id ? row.recipient_id : row.requester_id,
    );
  }

  const profileMap = new Map<string, ProfileSummary>();
  if (counterpartIds.size > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .in("id", Array.from(counterpartIds));
    for (const p of (profiles ?? []) as unknown as ProfileSummary[]) {
      profileMap.set(p.id, p);
    }
  }

  const attach = (list: PartnerRequestListItem[]) =>
    list.map((row) => ({
      ...row,
      counterpart:
        profileMap.get(
          row.requester_id === user.id ? row.recipient_id : row.requester_id,
        ) ?? null,
    }));

  return {
    incoming: attach(incomingRes.data as unknown as PartnerRequestListItem[] ?? []),
    outgoing: attach(outgoingRes.data as unknown as PartnerRequestListItem[] ?? []),
  };
}
