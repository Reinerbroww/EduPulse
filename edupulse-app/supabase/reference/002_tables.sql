-- Migration 002: Create all 23 EduPulse tables
-- Based on STEP 4 — Database Schema (APPROVED)
-- Uses text + CHECK constraints as decided in tech evaluation.
-- All timestamps use timestamptz for timezone safety.
-- DO NOT ALTER column names, types, or constraints without owner approval.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. profiles
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name         text NOT NULL,
  avatar_url           text,
  bio                  text,
  education_level      text CHECK (education_level IN ('school','university','independent','other')),
  timezone             text NOT NULL DEFAULT 'UTC',
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. user_safety_settings
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.user_safety_settings (
  user_id            uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age_band           text NOT NULL CHECK (age_band IN ('under_18','18_or_over','not_set')) DEFAULT 'not_set',
  profile_visibility text NOT NULL CHECK (profile_visibility IN ('discoverable','private')) DEFAULT 'discoverable',
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER user_safety_settings_updated_at
  BEFORE UPDATE ON public.user_safety_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. topics
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.topics (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL UNIQUE,
  slug        text NOT NULL UNIQUE,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. profile_topics
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.profile_topics (
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id      uuid NOT NULL REFERENCES public.topics(id),
  interest_type text NOT NULL CHECK (interest_type IN ('learning','teaching','both')),
  skill_level   text NOT NULL CHECK (skill_level IN ('beginner','intermediate','advanced','not_sure')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, topic_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. user_availability
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.user_availability (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. learning_goals
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.learning_goals (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id     uuid REFERENCES public.topics(id),
  title        text NOT NULL,
  description  text,
  target_date  date,
  support_mode text NOT NULL CHECK (support_mode IN ('partner','group','mentor','any')),
  visibility   text NOT NULL CHECK (visibility IN ('private','matchable')) DEFAULT 'matchable',
  status       text NOT NULL CHECK (status IN ('active','completed','paused','archived')) DEFAULT 'active',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER learning_goals_updated_at
  BEFORE UPDATE ON public.learning_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. study_partner_requests
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.study_partner_requests (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learning_goal_id uuid REFERENCES public.learning_goals(id) ON DELETE SET NULL,
  message          text,
  status           text NOT NULL CHECK (status IN ('pending','accepted','rejected','cancelled')) DEFAULT 'pending',
  responded_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_request CHECK (requester_id <> recipient_id)
);

CREATE TRIGGER study_partner_requests_updated_at
  BEFORE UPDATE ON public.study_partner_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. study_groups
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.study_groups (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         uuid NOT NULL REFERENCES public.profiles(id),
  learning_goal_id uuid REFERENCES public.learning_goals(id) ON DELETE SET NULL,
  topic_id         uuid REFERENCES public.topics(id),
  name             text NOT NULL,
  description      text,
  max_members      integer NOT NULL DEFAULT 8,
  visibility       text NOT NULL CHECK (visibility IN ('public','invite_only')),
  status           text NOT NULL CHECK (status IN ('active','closed','archived')) DEFAULT 'active',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT min_members CHECK (max_members >= 2)
);

CREATE TRIGGER study_groups_updated_at
  BEFORE UPDATE ON public.study_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. study_group_members
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.study_group_members (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id     uuid NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('owner','moderator','member')) DEFAULT 'member',
  status       text NOT NULL CHECK (status IN ('pending','active','rejected','left')) DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  joined_at    timestamptz,
  UNIQUE (group_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. study_sessions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.study_sessions (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by           uuid NOT NULL REFERENCES public.profiles(id),
  group_id             uuid REFERENCES public.study_groups(id) ON DELETE SET NULL,
  learning_goal_id     uuid REFERENCES public.learning_goals(id) ON DELETE SET NULL,
  title                text NOT NULL,
  objectives           text,
  starts_at            timestamptz NOT NULL,
  ends_at              timestamptz NOT NULL,
  external_meeting_url text,
  status               text NOT NULL CHECK (status IN ('planned','in_progress','completed','cancelled')) DEFAULT 'planned',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT session_ends_after_starts CHECK (ends_at > starts_at)
);

CREATE TRIGGER study_sessions_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. study_session_members
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.study_session_members (
  session_id   uuid NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('organizer','participant')),
  status       text NOT NULL CHECK (status IN ('invited','confirmed','declined','attended','absent')) DEFAULT 'invited',
  responded_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. study_session_checklist_items
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.study_session_checklist_items (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   uuid NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  created_by   uuid NOT NULL REFERENCES public.profiles(id),
  title        text NOT NULL,
  position     integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. study_session_notes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.study_session_notes (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES public.profiles(id),
  content    text NOT NULL,
  is_shared  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER study_session_notes_updated_at
  BEFORE UPDATE ON public.study_session_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. mentor_profiles
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.mentor_profiles (
  user_id                    uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline                   text NOT NULL,
  expertise_summary          text NOT NULL,
  experience_years           smallint CHECK (experience_years >= 0),
  verification_status        text NOT NULL CHECK (verification_status IN ('not_submitted','pending','verified','rejected','suspended')) DEFAULT 'not_submitted',
  verification_submitted_at  timestamptz,
  verification_reviewed_at   timestamptz,
  is_accepting_bookings      boolean NOT NULL DEFAULT false,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. mentor_services
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.mentor_services (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id           uuid NOT NULL REFERENCES public.mentor_profiles(user_id) ON DELETE CASCADE,
  topic_id            uuid REFERENCES public.topics(id),
  title               text NOT NULL,
  description         text NOT NULL,
  duration_minutes    smallint NOT NULL CHECK (duration_minutes > 0),
  delivery_mode       text NOT NULL CHECK (delivery_mode IN ('online_external','in_person')),
  price_type          text NOT NULL CHECK (price_type IN ('free','paid')),
  price_amount        numeric(12,2) NOT NULL CHECK (price_amount >= 0),
  currency            char(3) NOT NULL DEFAULT 'IDR',
  cancellation_policy text NOT NULL,
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT price_matches_type CHECK (
    (price_type = 'free' AND price_amount = 0)
    OR (price_type = 'paid' AND price_amount > 0)
  )
);

CREATE TRIGGER mentor_services_updated_at
  BEFORE UPDATE ON public.mentor_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. mentor_availability_slots
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.mentor_availability_slots (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id  uuid NOT NULL REFERENCES public.mentor_profiles(user_id) ON DELETE CASCADE,
  starts_at  timestamptz NOT NULL,
  ends_at    timestamptz NOT NULL,
  status     text NOT NULL CHECK (status IN ('available','reserved','unavailable')) DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT slot_ends_after_starts CHECK (ends_at > starts_at)
);

CREATE TRIGGER mentor_availability_slots_updated_at
  BEFORE UPDATE ON public.mentor_availability_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. mentor_bookings
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.mentor_bookings (
  id                        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id                uuid NOT NULL REFERENCES public.profiles(id),
  mentor_id                 uuid NOT NULL REFERENCES public.mentor_profiles(user_id),
  service_id                uuid NOT NULL REFERENCES public.mentor_services(id),
  availability_slot_id      uuid NOT NULL REFERENCES public.mentor_availability_slots(id),
  learning_goal_id          uuid REFERENCES public.learning_goals(id) ON DELETE SET NULL,
  -- Snapshots: preserve booking details even if service is later edited
  service_title_snapshot    text NOT NULL,
  starts_at                 timestamptz NOT NULL,
  ends_at                   timestamptz NOT NULL,
  price_type_snapshot       text NOT NULL CHECK (price_type_snapshot IN ('free','paid')),
  price_amount_snapshot     numeric(12,2) NOT NULL CHECK (price_amount_snapshot >= 0),
  currency_snapshot         char(3) NOT NULL,
  learner_objective         text NOT NULL,
  status                    text NOT NULL CHECK (status IN (
    'pending','confirmed','declined',
    'cancelled_by_learner','cancelled_by_mentor',
    'completed','no_show'
  )) DEFAULT 'pending',
  cancellation_reason       text,
  cancelled_at              timestamptz,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_booking CHECK (learner_id <> mentor_id),
  CONSTRAINT booking_ends_after_starts CHECK (ends_at > starts_at),
  CONSTRAINT paid_snapshot_has_amount CHECK (
    (price_type_snapshot = 'free' AND price_amount_snapshot = 0)
    OR (price_type_snapshot = 'paid' AND price_amount_snapshot > 0)
  )
);

CREATE TRIGGER mentor_bookings_updated_at
  BEFORE UPDATE ON public.mentor_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. booking_payments
-- Paid booking workflow is disabled until pilot procedure is approved (D9).
-- This table records manual payment references only — no gateway integration.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.booking_payments (
  id                             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id                     uuid NOT NULL UNIQUE REFERENCES public.mentor_bookings(id),
  amount                         numeric(12,2) NOT NULL,
  currency                       char(3) NOT NULL,
  payment_instructions_snapshot  text,
  payment_reference              text,
  status                         text NOT NULL CHECK (status IN (
    'awaiting_instructions','awaiting_payment',
    'submitted_for_review','verified','rejected','cancelled'
  )),
  verified_by                    uuid REFERENCES public.profiles(id),
  verified_at                    timestamptz,
  review_note                    text,  -- internal only; never exposed to regular users
  created_at                     timestamptz NOT NULL DEFAULT now(),
  updated_at                     timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER booking_payments_updated_at
  BEFORE UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 19. mentoring_session_summaries
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.mentoring_session_summaries (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.mentor_bookings(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES public.profiles(id),
  summary    text NOT NULL,
  next_steps text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER mentoring_session_summaries_updated_at
  BEFORE UPDATE ON public.mentoring_session_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 20. mentor_feedback
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.mentor_feedback (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.mentor_bookings(id) ON DELETE CASCADE,
  learner_id uuid NOT NULL REFERENCES public.profiles(id),
  mentor_id  uuid NOT NULL REFERENCES public.mentor_profiles(user_id),
  rating     smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER mentor_feedback_updated_at
  BEFORE UPDATE ON public.mentor_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 21. learning_goal_updates
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.learning_goal_updates (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_goal_id        uuid NOT NULL REFERENCES public.learning_goals(id) ON DELETE CASCADE,
  author_id               uuid NOT NULL REFERENCES public.profiles(id),
  source_study_session_id uuid REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  source_mentor_booking_id uuid REFERENCES public.mentor_bookings(id) ON DELETE SET NULL,
  progress_percent        smallint NOT NULL CHECK (progress_percent BETWEEN 0 AND 100),
  update_text             text,
  next_step               text,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 22. user_blocks
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.user_blocks (
  blocker_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_user_id),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 23. user_reports
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.user_reports (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id      uuid NOT NULL REFERENCES public.profiles(id),
  reported_user_id uuid NOT NULL REFERENCES public.profiles(id),
  study_group_id   uuid REFERENCES public.study_groups(id) ON DELETE SET NULL,
  study_session_id uuid REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  mentor_booking_id uuid REFERENCES public.mentor_bookings(id) ON DELETE SET NULL,
  reason_code      text NOT NULL CHECK (reason_code IN (
    'harassment','misleading_profile','unsafe_behavior','spam','payment_issue','other'
  )),
  details          text,
  status           text NOT NULL CHECK (status IN ('open','in_review','resolved','dismissed')) DEFAULT 'open',
  reviewed_by      uuid REFERENCES public.profiles(id),
  reviewed_at      timestamptz,
  resolution_note  text,  -- internal only; never exposed to regular users
  created_at       timestamptz NOT NULL DEFAULT now()
);
