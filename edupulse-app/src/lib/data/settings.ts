import { createClient } from "@/lib/supabase/server";

export interface AvailabilityRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

// Availability windows feed the partner-matching overlap score, so editing them
// directly improves match quality. RLS also exposes discoverable users' rows on
// SELECT, so the query is explicitly scoped to the signed-in user.
export async function listMyAvailability(
  userId: string,
): Promise<AvailabilityRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_availability")
    .select("id, day_of_week, start_time, end_time, is_active")
    .eq("user_id", userId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AvailabilityRow[];
}
