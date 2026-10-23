import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
};

export type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  education_level: string | null;
  timezone: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type SafetySettingsRow = {
  user_id: string;
  age_band: string;
  profile_visibility: string;
  updated_at: string;
};

const PROFILE_COLUMNS =
  "id, display_name, avatar_url, bio, education_level, timezone, onboarding_completed, created_at, updated_at";

const SAFETY_COLUMNS = "user_id, age_band, profile_visibility, updated_at";

export async function getSessionUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

export type CurrentUserContext = {
  user: CurrentUser;
  profile: ProfileRow | null;
  safety: SafetySettingsRow | null;
};

export async function getCurrentUserContext(): Promise<CurrentUserContext | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const [profileResult, safetyResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", user.id)
      .maybeSingle<ProfileRow>(),
    supabase
      .from("user_safety_settings")
      .select(SAFETY_COLUMNS)
      .eq("user_id", user.id)
      .maybeSingle<SafetySettingsRow>(),
  ]);

  return {
    user,
    profile: profileResult.data ?? null,
    safety: safetyResult.data ?? null,
  };
}
