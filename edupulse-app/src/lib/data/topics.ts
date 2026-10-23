import { createClient } from "@/lib/supabase/server";

export type TopicRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export async function listActiveTopics(): Promise<TopicRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as TopicRow[];
}

export async function listUserTopicIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_topics")
    .select("topic_id")
    .eq("profile_id", userId);

  if (error) return [];
  return (data ?? []).map((row) => row.topic_id as string);
}
