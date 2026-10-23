import { createClient } from "@/lib/supabase/server";

export interface MentorListItem {
  user_id: string;
  headline: string;
  expertise_summary: string;
  experience_years: number | null;
  verification_status: string;
  is_accepting_bookings: boolean;
  profiles: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    education_level: string | null;
  } | null;
}

export async function getVerifiedMentors(): Promise<MentorListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select(`
      user_id,
      headline,
      expertise_summary,
      experience_years,
      verification_status,
      is_accepting_bookings,
      profiles (
        id,
        display_name,
        avatar_url,
        education_level
      )
    `)
    .eq("verification_status", "verified")
    .eq("is_accepting_bookings", true)
    .order("user_id");

  if (error) {
    throw error;
  }
  return (data ?? []) as unknown as MentorListItem[];
}

export async function getMentorWithServices(mentorId: string) {
  const supabase = await createClient();
  const { data: mentor, error: mentorError } = await supabase
    .from("mentor_profiles")
    .select(`
      user_id,
      headline,
      expertise_summary,
      experience_years,
      verification_status,
      is_accepting_bookings
    `)
    .eq("user_id", mentorId)
    .single();

  if (mentorError || !mentor) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", mentorId)
    .single();

  if (profileError || !profile) {
    return null;
  }

  const { data: services, error: servicesError } = await supabase
    .from("mentor_services")
    .select("*")
    .eq("mentor_id", mentorId)
    .eq("is_active", true)
    .order("created_at");

  if (servicesError) {
    throw servicesError;
  }

  return {
    mentor,
    profile,
    services: services ?? [],
  };
}

export async function getAvailableSlotsForMentor(mentorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mentor_availability_slots")
    .select("*")
    .eq("mentor_id", mentorId)
    .eq("status", "available")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at");

  if (error) {
    throw error;
  }
  return data ?? [];
}
