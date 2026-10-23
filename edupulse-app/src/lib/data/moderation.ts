import { createClient } from "@/lib/supabase/server";

// Moderator surfaces (STEP 6, group 5). Every query here is gated by RLS: the
// `*_select` policies expose cross-user rows only when `is_moderator()` is true.
// The page additionally short-circuits non-moderators.

export async function isCurrentUserModerator(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_moderator");
  if (error) return false;
  return data === true;
}

export interface PendingVerification {
  user_id: string;
  headline: string;
  expertise_summary: string;
  experience_years: number | null;
  verification_status: string;
  verification_submitted_at: string | null;
  display_name: string | null;
  has_cv: boolean;
}

export async function listPendingVerifications(): Promise<
  PendingVerification[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select(
      "user_id, headline, expertise_summary, experience_years, verification_status, verification_submitted_at",
    )
    .eq("verification_status", "pending")
    .order("verification_submitted_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as Omit<
    PendingVerification,
    "display_name" | "has_cv"
  >[];
  const ids = rows.map((r) => r.user_id);
  const nameMap = new Map<string, string | null>();
  const cvSet = new Set<string>();
  if (ids.length > 0) {
    const [profilesRes, docsRes] = await Promise.all([
      supabase.from("profiles").select("id, display_name").in("id", ids),
      // RLS on mentor_verification_documents exposes a row to moderators only,
      // so this read proves the CV is visible to the reviewing moderator.
      supabase.from("mentor_verification_documents").select("mentor_id").in("mentor_id", ids),
    ]);
    for (const p of (profilesRes.data ?? []) as {
      id: string;
      display_name: string | null;
    }[]) {
      nameMap.set(p.id, p.display_name);
    }
    if (!docsRes.error) {
      for (const d of (docsRes.data ?? []) as { mentor_id: string }[]) {
        cvSet.add(d.mentor_id);
      }
    }
  }

  return rows.map((r) => ({
    ...r,
    display_name: nameMap.get(r.user_id) ?? null,
    has_cv: cvSet.has(r.user_id),
  }));
}

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason_code: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter_name: string | null;
  reported_name: string | null;
}

export async function listReports(
  statuses: string[],
): Promise<ModerationReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_reports")
    .select(
      "id, reporter_id, reported_user_id, reason_code, details, status, created_at",
    )
    .in("status", statuses)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as Omit<
    ModerationReport,
    "reporter_name" | "reported_name"
  >[];
  const ids = Array.from(
    new Set(rows.flatMap((r) => [r.reporter_id, r.reported_user_id])),
  );
  const nameMap = new Map<string, string | null>();
  if (ids.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ids);
    for (const p of (profiles ?? []) as {
      id: string;
      display_name: string | null;
    }[]) {
      nameMap.set(p.id, p.display_name);
    }
  }

  return rows.map((r) => ({
    ...r,
    reporter_name: nameMap.get(r.reporter_id) ?? null,
    reported_name: nameMap.get(r.reported_user_id) ?? null,
  }));
}
