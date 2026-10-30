import { createClient } from "@/lib/supabase/server";

export type UpcomingSessionKind = "mentoring" | "group" | "partner";

export interface UpcomingSessionItem {
  id: string;
  kind: UpcomingSessionKind;
  title: string;
  context: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  href: string;
}

interface BookingRow {
  id: string;
  learner_id: string;
  mentor_id: string;
  service_title_snapshot: string;
  starts_at: string;
  ends_at: string;
  status: string;
}

interface SessionRow {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: string;
  group_id: string | null;
  created_by: string;
}

export async function getMyUpcomingSessions(
  userId: string,
): Promise<UpcomingSessionItem[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [bookingsRes, sessionsRes] = await Promise.all([
    supabase
      .from("mentor_bookings")
      .select(
        "id, learner_id, mentor_id, service_title_snapshot, starts_at, ends_at, status",
      )
      .or(`learner_id.eq.${userId},mentor_id.eq.${userId}`)
      .gte("starts_at", now)
      .in("status", ["pending", "confirmed"])
      .order("starts_at"),
    supabase
      .from("study_sessions")
      .select("id, title, starts_at, ends_at, status, group_id, created_by")
      .gte("starts_at", now)
      .in("status", ["planned", "in_progress"])
      .order("starts_at"),
  ]);

  if (bookingsRes.error) throw bookingsRes.error;
  if (sessionsRes.error) throw sessionsRes.error;

  const bookings = (bookingsRes.data ?? []) as unknown as BookingRow[];
  const sessions = (sessionsRes.data ?? []) as unknown as SessionRow[];

  const counterpartIds = Array.from(
    new Set(
      bookings.map((booking) =>
        booking.mentor_id === userId ? booking.learner_id : booking.mentor_id,
      ),
    ),
  );

  const nameMap = new Map<string, string | null>();
  if (counterpartIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", counterpartIds);
    for (const profile of (profiles ?? []) as {
      id: string;
      display_name: string | null;
    }[]) {
      nameMap.set(profile.id, profile.display_name);
    }
  }

  const groupIds = Array.from(
    new Set(
      sessions
        .map((session) => session.group_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const groupNameMap = new Map<string, string>();
  if (groupIds.length > 0) {
    const { data: groups } = await supabase
      .from("study_groups")
      .select("id, name")
      .in("id", groupIds);
    for (const group of (groups ?? []) as { id: string; name: string }[]) {
      groupNameMap.set(group.id, group.name);
    }
  }

  const bookingItems: UpcomingSessionItem[] = bookings.map((booking) => {
    const isMentor = booking.mentor_id === userId;
    const counterpartId = isMentor ? booking.learner_id : booking.mentor_id;
    const counterpartName = nameMap.get(counterpartId) ?? "Pengguna";
    return {
      id: `booking:${booking.id}`,
      kind: "mentoring",
      title: booking.service_title_snapshot,
      context: isMentor
        ? `Pembelajar: ${counterpartName}`
        : `Dengan ${counterpartName}`,
      starts_at: booking.starts_at,
      ends_at: booking.ends_at,
      status: booking.status,
      href: `/bookings/${booking.id}`,
    };
  });

  const sessionItems: UpcomingSessionItem[] = sessions.map((session) => ({
    id: `session:${session.id}`,
    kind: session.group_id ? "group" : "partner",
    title: session.title,
    context: session.group_id
      ? groupNameMap.get(session.group_id) ?? "Kelompok belajar"
      : "Sesi belajar partner",
    starts_at: session.starts_at,
    ends_at: session.ends_at,
    status: session.status,
    href: `/sessions/${session.id}`,
  }));

  return [...bookingItems, ...sessionItems].sort(
    (a, b) =>
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
}
