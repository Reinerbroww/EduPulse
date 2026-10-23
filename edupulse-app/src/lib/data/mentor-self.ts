import { createClient } from "@/lib/supabase/server";
import { isMissingCvSchema } from "@/lib/mentor/cv";

export interface MentorProfileSelf {
  user_id: string;
  headline: string;
  expertise_summary: string;
  experience_years: number | null;
  verification_status: string;
  verification_submitted_at: string | null;
  is_accepting_bookings: boolean;
}

export async function getMyMentorProfile(
  userId: string,
): Promise<MentorProfileSelf | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mentor_profiles")
    .select(
      "user_id, headline, expertise_summary, experience_years, verification_status, verification_submitted_at, is_accepting_bookings",
    )
    .eq("user_id", userId)
    .maybeSingle();

  return (data as MentorProfileSelf | null) ?? null;
}

export interface MentorServiceSelf {
  id: string;
  topic_id: string | null;
  title: string;
  description: string;
  duration_minutes: number;
  delivery_mode: string;
  price_type: string;
  price_amount: number;
  currency: string;
  cancellation_policy: string;
  is_active: boolean;
}

export async function listMyMentorServices(
  userId: string,
): Promise<MentorServiceSelf[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mentor_services")
    .select(
      "id, topic_id, title, description, duration_minutes, delivery_mode, price_type, price_amount, currency, cancellation_policy, is_active",
    )
    .eq("mentor_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as unknown as MentorServiceSelf[];
}

export interface MentorSlotSelf {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
}

export async function listMyMentorSlots(
  userId: string,
): Promise<MentorSlotSelf[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mentor_availability_slots")
    .select("id, starts_at, ends_at, status")
    .eq("mentor_id", userId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");

  if (error) return [];
  return (data ?? []) as unknown as MentorSlotSelf[];
}

// ── CV document metadata (migration 012) ─────────────────────────────────────
// Only the CV's *metadata* is read here and only for the caller's own mentor
// row — RLS restricts this table to owner + moderator. The file bytes are never
// read through the table; they are served from the private bucket by a
// short-lived signed URL (see `/moderator/cv/[mentorId]/route.ts`).

export interface MentorCvDocument {
  mentor_id: string;
  bucket_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_at: string;
}

export interface CvLookup {
  cv: MentorCvDocument | null;
  /** True when migration 012 has not been applied, so the feature is off. */
  unavailable: boolean;
}

const CV_COLUMNS =
  "mentor_id, bucket_id, storage_path, file_name, mime_type, file_size_bytes, uploaded_at";

export async function getMyMentorCv(mentorId: string): Promise<CvLookup> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mentor_verification_documents")
    .select(CV_COLUMNS)
    .eq("mentor_id", mentorId)
    .maybeSingle();

  if (error) {
    return { cv: null, unavailable: isMissingCvSchema(error) };
  }
  return { cv: (data as MentorCvDocument | null) ?? null, unavailable: false };
}

export async function getMentorCv(mentorId: string): Promise<CvLookup> {
  return getMyMentorCv(mentorId);
}
