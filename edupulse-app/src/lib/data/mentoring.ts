import { createClient } from "@/lib/supabase/server";

export interface BookingDetail {
  booking: {
    id: string;
    learner_id: string;
    mentor_id: string;
    service_title_snapshot: string;
    starts_at: string;
    ends_at: string;
    status: string;
    learner_objective: string;
    learning_goal_id: string | null;
    price_type_snapshot: string;
  };
  mentorName: string | null;
  learnerName: string | null;
  goalTitle: string | null;
  summary: {
    id: string;
    author_id: string;
    summary: string;
    next_steps: string | null;
    created_at: string;
  } | null;
  feedback: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  } | null;
  isLearner: boolean;
  isMentor: boolean;
}

async function namesFor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[],
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  if (ids.length === 0) return map;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", ids);
  for (const row of (data ?? []) as { id: string; display_name: string | null }[]) {
    map.set(row.id, row.display_name);
  }
  return map;
}

export async function getBookingDetail(
  bookingId: string,
  userId: string,
): Promise<BookingDetail | null> {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("mentor_bookings")
    .select(
      "id, learner_id, mentor_id, service_title_snapshot, starts_at, ends_at, status, learner_objective, learning_goal_id, price_type_snapshot",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) return null;

  const [nameMap, summaryRes, feedbackRes, goalRes] = await Promise.all([
    namesFor(supabase, [booking.learner_id, booking.mentor_id]),
    supabase
      .from("mentoring_session_summaries")
      .select("id, author_id, summary, next_steps, created_at")
      .eq("booking_id", bookingId)
      .maybeSingle(),
    supabase
      .from("mentor_feedback")
      .select("id, rating, comment, created_at")
      .eq("booking_id", bookingId)
      .maybeSingle(),
    booking.learning_goal_id
      ? supabase
          .from("learning_goals")
          .select("id, title")
          .eq("id", booking.learning_goal_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    booking,
    mentorName: nameMap.get(booking.mentor_id) ?? null,
    learnerName: nameMap.get(booking.learner_id) ?? null,
    goalTitle: goalRes.data?.title ?? null,
    summary: summaryRes.data ?? null,
    feedback: feedbackRes.data ?? null,
    isLearner: booking.learner_id === userId,
    isMentor: booking.mentor_id === userId,
  };
}

export interface GoalProgressUpdate {
  id: string;
  progress_percent: number;
  update_text: string | null;
  next_step: string | null;
  created_at: string;
  author_id: string;
  source_label: string | null;
}

export interface GoalProgress {
  goal: {
    id: string;
    title: string;
    description: string | null;
    target_date: string | null;
    support_mode: string;
    status: string;
  };
  updates: GoalProgressUpdate[];
  latestPercent: number;
  isOwner: boolean;
}

export async function getGoalProgress(
  goalId: string,
  userId: string,
): Promise<GoalProgress | null> {
  const supabase = await createClient();

  const { data: goal, error } = await supabase
    .from("learning_goals")
    .select("id, title, description, target_date, support_mode, status, user_id")
    .eq("id", goalId)
    .maybeSingle();

  if (error || !goal) return null;

  const isOwner = goal.user_id === userId;

  const { data: updates } = await supabase
    .from("learning_goal_updates")
    .select(
      "id, progress_percent, update_text, next_step, created_at, author_id, source_study_session_id, source_mentor_booking_id",
    )
    .eq("learning_goal_id", goalId)
    .order("created_at", { ascending: false });

  const rows = (updates ?? []) as {
    id: string;
    progress_percent: number;
    update_text: string | null;
    next_step: string | null;
    created_at: string;
    author_id: string;
    source_study_session_id: string | null;
    source_mentor_booking_id: string | null;
  }[];

  const sessionIds = rows
    .map((r) => r.source_study_session_id)
    .filter((id): id is string => Boolean(id));
  const bookingIds = rows
    .map((r) => r.source_mentor_booking_id)
    .filter((id): id is string => Boolean(id));

  const labelMap = new Map<string, string>();
  if (sessionIds.length > 0) {
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("id, title")
      .in("id", sessionIds);
    for (const s of (sessions ?? []) as { id: string; title: string }[]) {
      labelMap.set(`session:${s.id}`, `Sesi kelompok: ${s.title}`);
    }
  }
  if (bookingIds.length > 0) {
    const { data: bookings } = await supabase
      .from("mentor_bookings")
      .select("id, service_title_snapshot")
      .in("id", bookingIds);
    for (const b of (bookings ?? []) as {
      id: string;
      service_title_snapshot: string;
    }[]) {
      labelMap.set(`booking:${b.id}`, `Mentoring: ${b.service_title_snapshot}`);
    }
  }

  const mapped: GoalProgressUpdate[] = rows.map((row) => ({
    id: row.id,
    progress_percent: row.progress_percent,
    update_text: row.update_text,
    next_step: row.next_step,
    created_at: row.created_at,
    author_id: row.author_id,
    source_label: row.source_study_session_id
      ? labelMap.get(`session:${row.source_study_session_id}`) ?? null
      : row.source_mentor_booking_id
        ? labelMap.get(`booking:${row.source_mentor_booking_id}`) ?? null
        : null,
  }));

  return {
    goal: {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      target_date: goal.target_date,
      support_mode: goal.support_mode,
      status: goal.status,
    },
    updates: mapped,
    latestPercent: mapped[0]?.progress_percent ?? 0,
    isOwner,
  };
}
