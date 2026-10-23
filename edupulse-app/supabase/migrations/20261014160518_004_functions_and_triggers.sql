-- Migration 004: Functions and triggers
-- EduPulse — STEP 4 Database Schema (APPROVED)
--
-- Contains:
--   1. Auto-provisioning of `profiles` + `user_safety_settings` on signup.
--   2. Authorization helper functions used by the RLS policies in migration 005.
--
-- Helper functions are SECURITY DEFINER so policy checks do not trigger RLS
-- recursion and can read tables the caller cannot otherwise read directly.
-- `auth.uid()` and `auth.jwt()` still reflect the calling request's JWT.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Auto-create profile + safety settings when a new auth user signs up
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
  v_timezone     text;
BEGIN
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Pelajar'
  );
  v_timezone := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'timezone'), ''),
    'UTC'
  );

  INSERT INTO public.profiles (id, display_name, timezone)
  VALUES (new.id, v_display_name, v_timezone)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_safety_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Authorization helpers
-- ─────────────────────────────────────────────────────────────────────────────

-- True when the caller's JWT carries an admin/moderator role in app_metadata.
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'moderator'),
    false
  );
$$;

-- Profile is visible to other users (discovery safety gate).
CREATE OR REPLACE FUNCTION public.is_profile_discoverable(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_safety_settings s
    WHERE s.user_id = p_profile_id
      AND s.profile_visibility = 'discoverable'
  );
$$;

-- Only users who explicitly declared themselves 18 or older may use mentoring.
-- `under_18` and `not_set` are both blocked (fail closed until age is declared).
CREATE OR REPLACE FUNCTION public.can_use_mentoring(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (
      SELECT s.age_band = '18_or_over'
      FROM public.user_safety_settings s
      WHERE s.user_id = p_user_id
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.study_group_members m
    WHERE m.group_id = p_group_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_owner(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.study_groups g
    WHERE g.id = p_group_id
      AND g.owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_session_participant(p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.study_session_members sm
    WHERE sm.session_id = p_session_id
      AND sm.user_id = auth.uid()
      AND sm.status IN ('invited', 'confirmed', 'attended')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_session_organizer(p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.study_sessions s
    WHERE s.id = p_session_id
      AND s.created_by = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_verified_mentor(p_mentor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentor_profiles mp
    WHERE mp.user_id = p_mentor_id
      AND mp.verification_status = 'verified'
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_goal(p_goal_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.learning_goals g
    WHERE g.id = p_goal_id
      AND g.user_id = auth.uid()
  );
$$;

-- Caller is the learner or the mentor on the booking.
CREATE OR REPLACE FUNCTION public.is_booking_party(p_booking_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentor_bookings b
    WHERE b.id = p_booking_id
      AND (b.learner_id = auth.uid() OR b.mentor_id = auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_booking_learner(p_booking_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentor_bookings b
    WHERE b.id = p_booking_id
      AND b.learner_id = auth.uid()
  );
$$;

-- Learner may leave feedback only for their own completed booking.
CREATE OR REPLACE FUNCTION public.is_completed_booking_for_learner(p_booking_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentor_bookings b
    WHERE b.id = p_booking_id
      AND b.learner_id = auth.uid()
      AND b.status = 'completed'
  );
$$;
