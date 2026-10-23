import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";

export interface GoalListItem {
  id: string;
  title: string;
  description: string | null;
  topic_id: string | null;
  target_date: string | null;
  support_mode: string;
  visibility: string;
  status: string;
  created_at: string;
  topics: { name: string } | null;
}

export async function getLearningGoals(): Promise<GoalListItem[]> {
  const user = await requireUser("/goals");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_goals")
    .select(
      "id, title, description, topic_id, target_date, support_mode, visibility, status, created_at, topics(name)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return (data ?? []) as unknown as GoalListItem[];
}

export async function getLearningGoal(
  goalId: string,
  userId: string,
): Promise<GoalListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_goals")
    .select(
      "id, title, description, topic_id, target_date, support_mode, visibility, status, created_at, topics(name)",
    )
    .eq("id", goalId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  return (data as unknown as GoalListItem | null) ?? null;
}

export async function getActiveGoalCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("learning_goals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) return 0;
  return count ?? 0;
}
