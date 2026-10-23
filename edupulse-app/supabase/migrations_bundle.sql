-- ===== 20261014160515_001_extensions_and_schema.sql =====
-- Migration 001: Enable required extensions
-- EduPulse â€” STEP 4 Database Schema (APPROVED)
-- Run this in Supabase SQL Editor or via supabase CLI

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Extensions
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

-- UUID generation (already enabled in Supabase by default, but explicit is safe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigram index for fuzzy/partial text search on mentor profiles
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Auto-update updated_at timestamps via trigger function
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Helper: generic updated_at trigger
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;




-- ===== 20261014160516_002_tables.sql =====
-- Migration 002: Create all 23 EduPulse tables
-- Based on STEP 4 â€” Database Schema (APPROVED)
-- Uses text + CHECK constraints as decided in tech evaluation.
-- All timestamps use timestamptz for timezone safety.
-- DO NOT ALTER column names, types, or constraints without owner approval.

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 1. profiles
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 2. user_safety_settings
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE public.user_safety_settings (
  user_id            uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age_band           text NOT NULL CHECK (age_band IN ('under_18','18_or_over','not_set')) DEFAULT 'not_set',
  profile_visibility text NOT NULL CHECK (profile_visibility IN ('discoverable','private')) DEFAULT 'discoverable',
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER user_safety_settings_updated_at
  BEFORE UPDATE ON public.user_safety_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 3. topics
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE public.topics (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL UNIQUE,
  slug        text NOT NULL UNIQUE,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 4. profile_topics
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE public.profile_topics (
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id      uuid NOT NULL REFERENCES public.topics(id),
  interest_type text NOT NULL CHECK (interest_type IN ('learning','teaching','both')),
  skill_level   text NOT NULL CHECK (skill_level IN ('beginner','intermediate','advanced','not_sure')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, topic_id)
);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 5. user_availability
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 6. learning_goals
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 7. study_partner_requests
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 8. study_groups
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 9. study_group_members
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 10. study_sessions
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 11. study_session_members
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE public.study_session_members (
  session_id   uuid NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('organizer','participant')),
  status       text NOT NULL CHECK (status IN ('invited','confirmed','declined','attended','absent')) DEFAULT 'invited',
  responded_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 12. study_session_checklist_items
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 13. study_session_notes
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 14. mentor_profiles
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 15. mentor_services
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 16. mentor_availability_slots
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 17. mentor_bookings
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 18. booking_payments
-- Paid booking workflow is disabled until pilot procedure is approved (D9).
-- This table records manual payment references only â€” no gateway integration.
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 19. mentoring_session_summaries
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 20. mentor_feedback
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 21. learning_goal_updates
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 22. user_blocks
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE public.user_blocks (
  blocker_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_user_id),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_user_id)
);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 23. user_reports
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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




-- ===== 20261014160517_003_indexes.sql =====
-- Migration 003: Indexes
-- Based on STEP 4 recommendations. Adjust after reviewing actual query patterns.

-- profile_topics: discovery by topic + skill level
CREATE INDEX idx_profile_topics_topic ON public.profile_topics(topic_id, interest_type, skill_level);

-- user_availability: schedule lookup
CREATE INDEX idx_user_availability_user_day ON public.user_availability(user_id, day_of_week);

-- learning_goals: user goals list + topic matching
CREATE INDEX idx_learning_goals_user_status ON public.learning_goals(user_id, status);
CREATE INDEX idx_learning_goals_topic_match ON public.learning_goals(topic_id, status, visibility);

-- study_partner_requests: status pages
CREATE INDEX idx_partner_req_recipient ON public.study_partner_requests(recipient_id, status, created_at);
CREATE INDEX idx_partner_req_requester ON public.study_partner_requests(requester_id, status, created_at);

-- study_group_members: member lists and join requests
CREATE INDEX idx_group_members_group ON public.study_group_members(group_id, status);
CREATE INDEX idx_group_members_user ON public.study_group_members(user_id, status);

-- study_sessions: upcoming sessions
CREATE INDEX idx_study_sessions_starts ON public.study_sessions(starts_at, status);
CREATE INDEX idx_session_members_user ON public.study_session_members(user_id, status);

-- mentor_services: mentor directory filter
CREATE INDEX idx_mentor_services_topic ON public.mentor_services(topic_id, is_active, price_type);

-- mentor_availability_slots: slot search
CREATE INDEX idx_mentor_slots_available ON public.mentor_availability_slots(mentor_id, status, starts_at);

-- mentor_bookings: dashboard for both sides
CREATE INDEX idx_bookings_learner ON public.mentor_bookings(learner_id, status, starts_at);
CREATE INDEX idx_bookings_mentor ON public.mentor_bookings(mentor_id, status, starts_at);

-- user_reports: moderation queue
CREATE INDEX idx_reports_status ON public.user_reports(status, created_at);

-- mentor_profiles: text search via trigram on headline and expertise_summary
CREATE INDEX idx_mentor_profiles_headline_trgm ON public.mentor_profiles USING GIN (headline gin_trgm_ops);
CREATE INDEX idx_mentor_profiles_expertise_trgm ON public.mentor_profiles USING GIN (expertise_summary gin_trgm_ops);




-- ===== 20261014160518_004_functions_and_triggers.sql =====
-- Migration 004: Functions and triggers
-- EduPulse â€” STEP 4 Database Schema (APPROVED)
--
-- Contains:
--   1. Auto-provisioning of `profiles` + `user_safety_settings` on signup.
--   2. Authorization helper functions used by the RLS policies in migration 005.
--
-- Helper functions are SECURITY DEFINER so policy checks do not trigger RLS
-- recursion and can read tables the caller cannot otherwise read directly.
-- `auth.uid()` and `auth.jwt()` still reflect the calling request's JWT.

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 1. Auto-create profile + safety settings when a new auth user signs up
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 2. Authorization helpers
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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




-- ===== 20261014160519_005_rls_policies.sql =====
-- Migration 005: Row Level Security policies
-- EduPulse â€” STEP 4 Database Schema (APPROVED), section 6 "Aturan Akses dan Keamanan"
--
-- RLS is enabled on all 23 application tables. Privileged operations
-- (mentor verification, payment verification, report moderation) are expected to
-- run with the service role on the server, which bypasses RLS.
--
-- Column-level privileges protect internal data from regular users:
--   mentor_profiles: the verification_* columns are UPDATE-restricted so a mentor
--     can never change their own verification state. Reads are allowed so the
--     verified badge can be rendered; visible rows are already filtered by the
--     SELECT policy.
--   booking_payments: verified_by / verified_at / review_note are hidden from SELECT
--     for regular users (also UPDATE-restricted to payment_reference only).
--   user_reports: reviewed_by / reviewed_at / resolution_note are hidden from SELECT
--     for regular users.
-- Application queries must therefore select explicit columns on booking_payments and
-- user_reports (never `*`).

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 1. profiles
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_profile_discoverable(id)
    OR public.is_moderator()
  );

CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 2. user_safety_settings â€” owner + moderators only
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.user_safety_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_safety_settings_all ON public.user_safety_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_moderator())
  WITH CHECK (user_id = auth.uid() OR public.is_moderator());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 3. topics â€” public read of active topics, admin-managed
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY topics_select ON public.topics
  FOR SELECT TO anon, authenticated
  USING (is_active OR public.is_moderator());

CREATE POLICY topics_insert ON public.topics
  FOR INSERT TO authenticated
  WITH CHECK (public.is_moderator());

CREATE POLICY topics_update ON public.topics
  FOR UPDATE TO authenticated
  USING (public.is_moderator())
  WITH CHECK (public.is_moderator());

CREATE POLICY topics_delete ON public.topics
  FOR DELETE TO authenticated
  USING (public.is_moderator());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 4. profile_topics
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.profile_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_topics_select ON public.profile_topics
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.is_profile_discoverable(profile_id)
    OR public.is_moderator()
  );

CREATE POLICY profile_topics_all ON public.profile_topics
  FOR ALL TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 5. user_availability
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.user_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_availability_select ON public.user_availability
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_profile_discoverable(user_id)
    OR public.is_moderator()
  );

CREATE POLICY user_availability_all ON public.user_availability
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 6. learning_goals
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_goals_select ON public.learning_goals
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (visibility = 'matchable' AND public.is_profile_discoverable(user_id))
    OR public.is_moderator()
  );

CREATE POLICY learning_goals_all ON public.learning_goals
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 7. study_partner_requests
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.study_partner_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_partner_requests_select ON public.study_partner_requests
  FOR SELECT TO authenticated
  USING (
    requester_id = auth.uid()
    OR recipient_id = auth.uid()
    OR public.is_moderator()
  );

CREATE POLICY study_partner_requests_insert ON public.study_partner_requests
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY study_partner_requests_update ON public.study_partner_requests
  FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY study_partner_requests_delete ON public.study_partner_requests
  FOR DELETE TO authenticated
  USING (requester_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 8. study_groups
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_groups_select ON public.study_groups
  FOR SELECT TO authenticated
  USING (
    visibility = 'public'
    OR owner_id = auth.uid()
    OR public.is_group_member(id)
    OR public.is_moderator()
  );

CREATE POLICY study_groups_insert ON public.study_groups
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY study_groups_update ON public.study_groups
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY study_groups_delete ON public.study_groups
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 9. study_group_members
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_group_members_select ON public.study_group_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_group_member(group_id)
    OR public.is_group_owner(group_id)
    OR public.is_moderator()
  );

CREATE POLICY study_group_members_insert ON public.study_group_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_group_owner(group_id));

CREATE POLICY study_group_members_update ON public.study_group_members
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_group_owner(group_id)
    OR public.is_moderator()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_group_owner(group_id)
    OR public.is_moderator()
  );

CREATE POLICY study_group_members_delete ON public.study_group_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_group_owner(group_id));

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 10. study_sessions
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_sessions_select ON public.study_sessions
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_session_participant(id)
    OR (group_id IS NOT NULL AND public.is_group_member(group_id))
    OR public.is_moderator()
  );

CREATE POLICY study_sessions_insert ON public.study_sessions
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY study_sessions_update ON public.study_sessions
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_moderator())
  WITH CHECK (created_by = auth.uid() OR public.is_moderator());

CREATE POLICY study_sessions_delete ON public.study_sessions
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 11. study_session_members
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.study_session_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_session_members_select ON public.study_session_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_session_participant(session_id)
    OR public.is_moderator()
  );

CREATE POLICY study_session_members_insert ON public.study_session_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_session_organizer(session_id));

CREATE POLICY study_session_members_update ON public.study_session_members
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_session_organizer(session_id)
    OR public.is_moderator()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_session_organizer(session_id)
    OR public.is_moderator()
  );

CREATE POLICY study_session_members_delete ON public.study_session_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_session_organizer(session_id));

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 12. study_session_checklist_items
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.study_session_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_session_checklist_items_select
  ON public.study_session_checklist_items
  FOR SELECT TO authenticated
  USING (public.is_session_participant(session_id) OR public.is_moderator());

CREATE POLICY study_session_checklist_items_insert
  ON public.study_session_checklist_items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_session_participant(session_id) AND created_by = auth.uid()
  );

CREATE POLICY study_session_checklist_items_update
  ON public.study_session_checklist_items
  FOR UPDATE TO authenticated
  USING (public.is_session_participant(session_id))
  WITH CHECK (public.is_session_participant(session_id));

CREATE POLICY study_session_checklist_items_delete
  ON public.study_session_checklist_items
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.is_session_organizer(session_id));

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 13. study_session_notes
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.study_session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_session_notes_select ON public.study_session_notes
  FOR SELECT TO authenticated
  USING (
    public.is_moderator()
    OR (
      public.is_session_participant(session_id)
      AND (is_shared OR author_id = auth.uid())
    )
  );

CREATE POLICY study_session_notes_insert ON public.study_session_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_session_participant(session_id) AND author_id = auth.uid()
  );

CREATE POLICY study_session_notes_update ON public.study_session_notes
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY study_session_notes_delete ON public.study_session_notes
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 14. mentor_profiles â€” verification fields reserved for service role
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY mentor_profiles_select ON public.mentor_profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR verification_status = 'verified'
    OR public.is_moderator()
  );

CREATE POLICY mentor_profiles_insert ON public.mentor_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY mentor_profiles_update ON public.mentor_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY mentor_profiles_delete ON public.mentor_profiles
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Mentors may edit their public-facing fields but never their own verification.
REVOKE UPDATE ON public.mentor_profiles FROM authenticated;
GRANT UPDATE (
  headline,
  expertise_summary,
  experience_years,
  is_accepting_bookings,
  updated_at
) ON public.mentor_profiles TO authenticated;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 15. mentor_services
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.mentor_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY mentor_services_select ON public.mentor_services
  FOR SELECT TO authenticated
  USING (
    mentor_id = auth.uid()
    OR (is_active AND public.is_verified_mentor(mentor_id))
    OR public.is_moderator()
  );

CREATE POLICY mentor_services_all ON public.mentor_services
  FOR ALL TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 16. mentor_availability_slots
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.mentor_availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY mentor_availability_slots_select ON public.mentor_availability_slots
  FOR SELECT TO authenticated
  USING (
    mentor_id = auth.uid()
    OR public.is_verified_mentor(mentor_id)
    OR public.is_moderator()
  );

CREATE POLICY mentor_availability_slots_all ON public.mentor_availability_slots
  FOR ALL TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 17. mentor_bookings â€” no mentoring for age_band = 'under_18'
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.mentor_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY mentor_bookings_select ON public.mentor_bookings
  FOR SELECT TO authenticated
  USING (
    learner_id = auth.uid()
    OR mentor_id = auth.uid()
    OR public.is_moderator()
  );

CREATE POLICY mentor_bookings_insert ON public.mentor_bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    learner_id = auth.uid()
    AND public.can_use_mentoring(auth.uid())
    AND public.is_verified_mentor(mentor_id)
  );

CREATE POLICY mentor_bookings_update ON public.mentor_bookings
  FOR UPDATE TO authenticated
  USING (learner_id = auth.uid() OR mentor_id = auth.uid())
  WITH CHECK (learner_id = auth.uid() OR mentor_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 18. booking_payments â€” learner submits reference; only service role verifies
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY booking_payments_select ON public.booking_payments
  FOR SELECT TO authenticated
  USING (public.is_booking_party(booking_id) OR public.is_moderator());

CREATE POLICY booking_payments_insert ON public.booking_payments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_booking_learner(booking_id));

CREATE POLICY booking_payments_update ON public.booking_payments
  FOR UPDATE TO authenticated
  USING (public.is_booking_learner(booking_id))
  WITH CHECK (public.is_booking_learner(booking_id));

-- Hide internal verification columns from regular users.
REVOKE SELECT ON public.booking_payments FROM authenticated;
GRANT SELECT (
  id,
  booking_id,
  amount,
  currency,
  payment_instructions_snapshot,
  payment_reference,
  status,
  created_at,
  updated_at
) ON public.booking_payments TO authenticated;

-- Learners may only edit the payment reference.
REVOKE UPDATE ON public.booking_payments FROM authenticated;
GRANT UPDATE (payment_reference, updated_at)
  ON public.booking_payments TO authenticated;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 19. mentoring_session_summaries
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.mentoring_session_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY mentoring_session_summaries_select
  ON public.mentoring_session_summaries
  FOR SELECT TO authenticated
  USING (public.is_booking_party(booking_id) OR public.is_moderator());

CREATE POLICY mentoring_session_summaries_insert
  ON public.mentoring_session_summaries
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_booking_party(booking_id) AND author_id = auth.uid()
  );

CREATE POLICY mentoring_session_summaries_update
  ON public.mentoring_session_summaries
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 20. mentor_feedback â€” one feedback per completed booking by its learner
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY mentor_feedback_select ON public.mentor_feedback
  FOR SELECT TO authenticated
  USING (
    learner_id = auth.uid()
    OR mentor_id = auth.uid()
    OR public.is_moderator()
  );

CREATE POLICY mentor_feedback_insert ON public.mentor_feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    learner_id = auth.uid()
    AND public.is_completed_booking_for_learner(booking_id)
  );

CREATE POLICY mentor_feedback_update ON public.mentor_feedback
  FOR UPDATE TO authenticated
  USING (learner_id = auth.uid())
  WITH CHECK (learner_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 21. learning_goal_updates
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.learning_goal_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_goal_updates_select ON public.learning_goal_updates
  FOR SELECT TO authenticated
  USING (
    public.owns_goal(learning_goal_id)
    OR author_id = auth.uid()
    OR public.is_moderator()
  );

CREATE POLICY learning_goal_updates_insert ON public.learning_goal_updates
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND public.owns_goal(learning_goal_id)
  );

CREATE POLICY learning_goal_updates_update ON public.learning_goal_updates
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY learning_goal_updates_delete ON public.learning_goal_updates
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 22. user_blocks â€” owners manage their own block list only
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_blocks_select ON public.user_blocks
  FOR SELECT TO authenticated
  USING (blocker_id = auth.uid() OR public.is_moderator());

CREATE POLICY user_blocks_all ON public.user_blocks
  FOR ALL TO authenticated
  USING (blocker_id = auth.uid())
  WITH CHECK (blocker_id = auth.uid());

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 23. user_reports â€” reporter sees own; internal notes moderator-only
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_reports_select ON public.user_reports
  FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.is_moderator());

CREATE POLICY user_reports_insert ON public.user_reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY user_reports_update ON public.user_reports
  FOR UPDATE TO authenticated
  USING (public.is_moderator())
  WITH CHECK (public.is_moderator());

-- Hide internal moderation columns from regular users.
REVOKE SELECT ON public.user_reports FROM authenticated;
GRANT SELECT (
  id,
  reporter_id,
  reported_user_id,
  study_group_id,
  study_session_id,
  mentor_booking_id,
  reason_code,
  details,
  status,
  created_at
) ON public.user_reports TO authenticated;




-- ===== 20261014160520_006_seed_topics.sql =====
-- Migration 006: Seed the topic catalog
-- Idempotent: safe to re-run. Admins can manage the catalog afterwards.
INSERT INTO public.topics (name, slug, description) VALUES
  ('Matematika', 'matematika', 'Aljabar, kalkulus, geometri, dan pemecahan masalah matematika.'),
  ('Fisika', 'fisika', 'Mekanika, termodinamika, listrik, dan fisika modern.'),
  ('Kimia', 'kimia', 'Kimia dasar, organik, anorganik, dan perhitungan kimia.'),
  ('Biologi', 'biologi', 'Biologi sel, genetika, ekologi, dan fisiologi.'),
  ('Statistika', 'statistika', 'Probabilitas, inferensi, dan analisis data statistik.'),
  ('Bahasa Inggris', 'bahasa-inggris', 'Percakapan, tata bahasa, menulis, dan persiapan tes.'),
  ('Bahasa Indonesia', 'bahasa-indonesia', 'Penulisan, tata bahasa, dan keterampilan berbahasa.'),
  ('Bahasa Jepang', 'bahasa-jepang', 'Kosakata, tata bahasa, dan latihan percakapan Jepang.'),
  ('Bahasa Korea', 'bahasa-korea', 'Dasar bahasa Korea dan latihan percakapan.'),
  ('Bahasa Arab', 'bahasa-arab', 'Dasar bahasa Arab, nahwu, dan latihan percakapan.'),
  ('Pemrograman', 'pemrograman', 'Dasar pemrograman, struktur data, dan algoritma.'),
  ('Pengembangan Web', 'pengembangan-web', 'HTML, CSS, JavaScript, dan framework web.'),
  ('Data Science', 'data-science', 'Analisis data, machine learning, dan visualisasi data.'),
  ('Desain UI/UX', 'desain-ui-ux', 'Riset pengguna, wireframe, dan desain antarmuka.'),
  ('Ekonomi', 'ekonomi', 'Mikro, makro, dan kebijakan ekonomi.'),
  ('Akuntansi', 'akuntansi', 'Akuntansi keuangan, biaya, dan laporan keuangan.'),
  ('Sejarah', 'sejarah', 'Sejarah dunia, nasional, dan analisis peristiwa.'),
  ('Geografi', 'geografi', 'Geografi fisik, manusia, dan pemetaan.'),
  ('Sosiologi', 'sosiologi', 'Struktur sosial, perubahan sosial, dan teori sosiologi.'),
  ('Public Speaking', 'public-speaking', 'Latihan berbicara di depan umum dan presentasi.'),
  ('Kewirausahaan', 'kewirausahaan', 'Ide bisnis, model bisnis, dan pengembangan usaha.'),
  ('Fotografi', 'fotografi', 'Teknik fotografi, komposisi, dan pengeditan.'),
  ('Musik', 'musik', 'Teori musik, instrumen, dan latihan bermain.'),
  ('Bahasa Asing Lainnya', 'bahasa-asing-lainnya', 'Topik bahasa asing lain sesuai permintaan.')
ON CONFLICT (slug) DO NOTHING;




-- ===== 20261014160521_007_atomic_booking_rpc.sql =====

-- Migration 007: Atomic booking RPC (create booking + reserve slot)
CREATE OR REPLACE FUNCTION public.create_booking_with_slot_reservation(
  p_mentor_id uuid,
  p_service_id uuid,
  p_availability_slot_id uuid,
  p_learning_goal_id uuid DEFAULT NULL,
  p_learner_objective text DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_learner_id uuid := auth.uid();
  v_slot record;
  v_service record;
  v_booking_id uuid;
  v_error text;
BEGIN
  IF v_learner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Ensure learner can use mentoring (age gate)
  IF NOT public.can_use_mentoring(v_learner_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'mentoring_not_allowed_for_age');
  END IF;

  -- Verify mentor verified
  IF NOT public.is_verified_mentor(p_mentor_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'mentor_not_verified');
  END IF;

  -- Check block (bidirectional)
  IF EXISTS (
    SELECT 1 FROM public.user_blocks b
    WHERE (b.blocker_id = v_learner_id AND b.blocked_user_id = p_mentor_id)
       OR (b.blocker_id = p_mentor_id AND b.blocked_user_id = v_learner_id)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'blocked');
  END IF;

  -- Lock slot (double-booking prevention)
  SELECT * INTO v_slot FROM public.mentor_availability_slots
    WHERE id = p_availability_slot_id AND mentor_id = p_mentor_id AND status = 'available'
    FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'slot_unavailable');
  END IF;

  -- Get service
  SELECT * INTO v_service FROM public.mentor_services
    WHERE id = p_service_id AND mentor_id = p_mentor_id AND is_active;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'service_not_valid');
  END IF;

  -- Explicitly reject paid bookings until pilot approved (D9).
  -- No slot reservation, booking, or payment row is created on this path.
  IF v_service.price_type = 'paid' THEN
    RETURN jsonb_build_object('success', false, 'error', 'paid_booking_not_enabled');
  END IF;

  -- Update slot to reserved
  UPDATE public.mentor_availability_slots
    SET status = 'reserved', updated_at = now()
    WHERE id = v_slot.id;

  -- Create booking
  INSERT INTO public.mentor_bookings (
    learner_id, mentor_id, service_id, availability_slot_id, learning_goal_id,
    service_title_snapshot, starts_at, ends_at,
    price_type_snapshot, price_amount_snapshot, currency_snapshot,
    learner_objective, status
  ) VALUES (
    v_learner_id, p_mentor_id, p_service_id, p_availability_slot_id, p_learning_goal_id,
    v_service.title, v_slot.starts_at, v_slot.ends_at,
    v_service.price_type, v_service.price_amount, v_service.currency,
    COALESCE(p_learner_objective, ''), 'pending'
  ) RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object('success', true, 'booking_id', v_booking_id);
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
  RETURN jsonb_build_object('success', false, 'error', 'unexpected', 'detail', v_error);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.create_booking_with_slot_reservation FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_booking_with_slot_reservation FROM anon;
GRANT EXECUTE ON FUNCTION public.create_booking_with_slot_reservation TO authenticated;


-- ===== 20261016120000_008_booking_status_transitions.sql =====
-- Migration 008: Booking status transitions with automatic slot release
--
-- The create RPC (007) reserves an availability slot (`status = 'reserved'`).
-- Until now there was no way to move a booking forward or release the slot,
-- because slot rows are only writable by their mentor under RLS. This
-- SECURITY DEFINER routine validates the caller is a booking party, enforces the
-- allowed status transitions, and returns the slot to 'available' whenever the
-- session will no longer happen.
CREATE OR REPLACE FUNCTION public.transition_booking_status(
  p_booking_id uuid,
  p_action     text,
  p_reason     text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_booking    record;
  v_new_status text;
  v_error      text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_booking
    FROM public.mentor_bookings
    WHERE id = p_booking_id
    FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'booking_not_found');
  END IF;

  IF v_uid <> v_booking.learner_id AND v_uid <> v_booking.mentor_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_a_party');
  END IF;

  IF p_action = 'confirm' THEN
    IF v_uid <> v_booking.mentor_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'mentor_only');
    END IF;
    IF v_booking.status <> 'pending' THEN
      RETURN jsonb_build_object('success', false, 'error', 'invalid_transition');
    END IF;
    v_new_status := 'confirmed';

  ELSIF p_action = 'decline' THEN
    IF v_uid <> v_booking.mentor_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'mentor_only');
    END IF;
    IF v_booking.status <> 'pending' THEN
      RETURN jsonb_build_object('success', false, 'error', 'invalid_transition');
    END IF;
    v_new_status := 'declined';

  ELSIF p_action = 'complete' THEN
    IF v_booking.status <> 'confirmed' THEN
      RETURN jsonb_build_object('success', false, 'error', 'invalid_transition');
    END IF;
    v_new_status := 'completed';

  ELSIF p_action = 'cancel_by_learner' THEN
    IF v_uid <> v_booking.learner_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'learner_only');
    END IF;
    IF v_booking.status NOT IN ('pending', 'confirmed') THEN
      RETURN jsonb_build_object('success', false, 'error', 'invalid_transition');
    END IF;
    v_new_status := 'cancelled_by_learner';

  ELSIF p_action = 'cancel_by_mentor' THEN
    IF v_uid <> v_booking.mentor_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'mentor_only');
    END IF;
    IF v_booking.status NOT IN ('pending', 'confirmed') THEN
      RETURN jsonb_build_object('success', false, 'error', 'invalid_transition');
    END IF;
    v_new_status := 'cancelled_by_mentor';

  ELSIF p_action = 'no_show' THEN
    IF v_uid <> v_booking.mentor_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'mentor_only');
    END IF;
    IF v_booking.status <> 'confirmed' THEN
      RETURN jsonb_build_object('success', false, 'error', 'invalid_transition');
    END IF;
    v_new_status := 'no_show';

  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'unknown_action');
  END IF;

  UPDATE public.mentor_bookings
    SET status = v_new_status,
        cancellation_reason = CASE
          WHEN v_new_status IN ('declined', 'cancelled_by_learner', 'cancelled_by_mentor')
            THEN NULLIF(p_reason, '')
          ELSE cancellation_reason
        END,
        cancelled_at = CASE
          WHEN v_new_status IN ('declined', 'cancelled_by_learner', 'cancelled_by_mentor')
            THEN now()
          ELSE cancelled_at
        END,
        updated_at = now()
    WHERE id = p_booking_id;

  -- The session will not happen: give the slot back to the mentor.
  IF v_new_status IN ('declined', 'cancelled_by_learner', 'cancelled_by_mentor') THEN
    UPDATE public.mentor_availability_slots
      SET status = 'available', updated_at = now()
      WHERE id = v_booking.availability_slot_id
        AND status = 'reserved';
  END IF;

  RETURN jsonb_build_object('success', true, 'status', v_new_status);
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
  RETURN jsonb_build_object('success', false, 'error', 'unexpected', 'detail', v_error);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.transition_booking_status(uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.transition_booking_status(uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.transition_booking_status(uuid, text, text) TO authenticated;


-- ===== 20261016130000_009_mentor_verification_rpc.sql =====
-- Migration 009: Mentor verification submission + moderator review RPCs
--
-- `mentor_profiles` restricts column-level UPDATE for the `authenticated` role
-- to the public-facing fields (see 005), so a mentor cannot set verification
-- columns directly and no moderator can either. These SECURITY DEFINER routines
-- provide the two privileged transitions:
--   * submit_mentor_verification()   — the mentor requests review (-> pending)
--   * review_mentor_verification()   — a moderator decides (verified/rejected/suspended)
CREATE OR REPLACE FUNCTION public.submit_mentor_verification()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_status text;
  v_error  text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT verification_status INTO v_status
    FROM public.mentor_profiles
    WHERE user_id = v_uid
    FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_mentor_profile');
  END IF;
  IF v_status = 'verified' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_verified', 'status', v_status);
  END IF;
  IF v_status = 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_pending', 'status', v_status);
  END IF;
  IF v_status = 'suspended' THEN
    RETURN jsonb_build_object('success', false, 'error', 'suspended', 'status', v_status);
  END IF;

  UPDATE public.mentor_profiles
    SET verification_status = 'pending',
        verification_submitted_at = now(),
        verification_reviewed_at = NULL,
        updated_at = now()
    WHERE user_id = v_uid;

  RETURN jsonb_build_object('success', true, 'status', 'pending');
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
  RETURN jsonb_build_object('success', false, 'error', 'unexpected', 'detail', v_error);
END;
$$;

CREATE OR REPLACE FUNCTION public.review_mentor_verification(
  p_mentor_id uuid,
  p_decision  text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_error text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  IF NOT public.is_moderator() THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_moderator');
  END IF;
  IF p_decision NOT IN ('verified', 'rejected', 'suspended') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_decision');
  END IF;

  UPDATE public.mentor_profiles
    SET verification_status = p_decision,
        verification_reviewed_at = now(),
        updated_at = now()
    WHERE user_id = p_mentor_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'mentor_not_found');
  END IF;

  RETURN jsonb_build_object('success', true, 'status', p_decision);
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
  RETURN jsonb_build_object('success', false, 'error', 'unexpected', 'detail', v_error);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_mentor_verification() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_mentor_verification() FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_mentor_verification() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.review_mentor_verification(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.review_mentor_verification(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.review_mentor_verification(uuid, text) TO authenticated;

-- ===== 20261019120000_010_backfill_missing_profiles.sql =====
-- Backfill profiles + safety settings for legacy auth users (see migration file).

INSERT INTO public.profiles (id, display_name, timezone)
SELECT
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'Pelajar'
  ),
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'timezone'), ''), 'UTC')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_safety_settings (user_id)
SELECT p.id
FROM public.profiles p
LEFT JOIN public.user_safety_settings s ON s.user_id = p.id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ===== 20261019130000_011_rls_hardening.sql =====
-- RLS hardening from end-to-end QA (see migration file for full rationale).
-- 1-3: no direct client inserts into mentor_bookings (RPC only).
DROP POLICY IF EXISTS mentor_bookings_insert ON public.mentor_bookings;
REVOKE INSERT ON public.mentor_bookings FROM authenticated;
REVOKE INSERT ON public.mentor_bookings FROM anon;

-- 4: no direct client inserts into booking_payments (service role only).
DROP POLICY IF EXISTS booking_payments_insert ON public.booking_payments;
REVOKE INSERT ON public.booking_payments FROM authenticated;
REVOKE INSERT ON public.booking_payments FROM anon;

-- 5: only active group members may create a session in a group.
DROP POLICY IF EXISTS study_sessions_insert ON public.study_sessions;
CREATE POLICY study_sessions_insert ON public.study_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (group_id IS NULL OR public.is_group_member(group_id))
  );

-- 6: self-join requires active membership of the session's group.
CREATE OR REPLACE FUNCTION public.can_join_session(p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.study_sessions s
    JOIN public.study_group_members m ON m.group_id = s.group_id
    WHERE s.id = p_session_id
      AND s.group_id IS NOT NULL
      AND m.user_id = auth.uid()
      AND m.status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_join_session(uuid) TO authenticated;

DROP POLICY IF EXISTS study_session_members_insert ON public.study_session_members;
CREATE POLICY study_session_members_insert ON public.study_session_members
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_session_organizer(session_id)
    OR (user_id = auth.uid() AND public.can_join_session(session_id))
  );

-- ===== 20261019160000_012_cv_documents_and_group_covers.sql =====
-- Migration 012: Mentor CV documents (private storage) + group cover keys
--
-- ADDITIVE ONLY. Nothing in 001-011 is dropped or altered, except that the two
-- verification RPCs from migration 009 are redefined in place (same signature,
-- same behaviour plus a missing-CV guard) so the backend refuses a submission
-- whose CV is absent. Migration 012 must be reviewed before it is applied to
-- any remote database.
--
-- Contents:
--   1. public.mentor_verification_documents — one row per mentor describing the
--      CV currently on file. Document metadata lives here (never in the public
--      mentor_profiles row) and is readable only by the mentor and moderators.
--   2. storage bucket `mentor-cvs` (PRIVATE, PDF only, 5 MB ceiling) plus the
--      storage.objects policies that make it private in practice: the only path
--      a mentor may write/read is `<their own uid>/...`; moderators may read.
--   3. submit_mentor_verification() / review_mentor_verification() gain a CV
--      guard (cv_missing).
--   4. study_groups.cover_image_key — an allow-listed illustration key for the
--      group cover art in public/images/group-covers/ (NULL = fallback).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Mentor CV document metadata (RLS: owner + moderator only)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.mentor_verification_documents (
  mentor_id       uuid PRIMARY KEY REFERENCES public.mentor_profiles(user_id) ON DELETE CASCADE,
  bucket_id       text NOT NULL DEFAULT 'mentor-cvs',
  storage_path    text NOT NULL,
  file_name       text NOT NULL,
  mime_type       text NOT NULL DEFAULT 'application/pdf',
  file_size_bytes bigint NOT NULL
    CHECK (file_size_bytes > 0 AND file_size_bytes <= 5 * 1024 * 1024),
  uploaded_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mentor_verification_documents_pdf_only
    CHECK (mime_type = 'application/pdf'),
  CONSTRAINT mentor_verification_documents_bucket_ck
    CHECK (bucket_id = 'mentor-cvs'),
  -- Defence in depth: the object must live inside the owning mentor's folder,
  -- so a forged storage_path cannot point at somebody else's document.
  CONSTRAINT mentor_verification_documents_owned_path_ck
    CHECK (storage_path LIKE (mentor_id::text || '/%'))
);

CREATE TRIGGER mentor_verification_documents_updated_at
  BEFORE UPDATE ON public.mentor_verification_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.mentor_verification_documents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_verification_documents
  TO authenticated;
REVOKE ALL ON public.mentor_verification_documents FROM anon;

-- Owner and moderator only. Other mentors must never see the row.
CREATE POLICY mentor_verification_documents_select
  ON public.mentor_verification_documents
  FOR SELECT TO authenticated
  USING (mentor_id = auth.uid() OR public.is_moderator());

CREATE POLICY mentor_verification_documents_insert
  ON public.mentor_verification_documents
  FOR INSERT TO authenticated
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY mentor_verification_documents_update
  ON public.mentor_verification_documents
  FOR UPDATE TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY mentor_verification_documents_delete
  ON public.mentor_verification_documents
  FOR DELETE TO authenticated
  USING (mentor_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Private CV bucket + storage.objects policies
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mentor-cvs', 'mentor-cvs', false, 5 * 1024 * 1024,
        ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS mentor_cvs_insert ON storage.objects;
DROP POLICY IF EXISTS mentor_cvs_select ON storage.objects;
DROP POLICY IF EXISTS mentor_cvs_delete ON storage.objects;

-- Write only into your own folder.
CREATE POLICY mentor_cvs_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'mentor-cvs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: own folder, or any file in the bucket for a moderator. `anon` has no
-- policy at all, so unauthenticated requests can never resolve a CV.
CREATE POLICY mentor_cvs_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'mentor-cvs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_moderator()
    )
  );

CREATE POLICY mentor_cvs_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'mentor-cvs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- No UPDATE policy: a replace is a new upload + delete of the old object, so
-- no client can rewrite an object already in place.

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Verification RPCs refuse to proceed without a CV
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_mentor_verification()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_status text;
  v_error  text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT verification_status INTO v_status
    FROM public.mentor_profiles
    WHERE user_id = v_uid
    FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_mentor_profile');
  END IF;
  IF v_status = 'verified' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_verified', 'status', v_status);
  END IF;
  IF v_status = 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_pending', 'status', v_status);
  END IF;
  IF v_status = 'suspended' THEN
    RETURN jsonb_build_object('success', false, 'error', 'suspended', 'status', v_status);
  END IF;

  -- Migration 012: a verification request without a CV on file is rejected
  -- before any status change happens.
  IF NOT EXISTS (
    SELECT 1 FROM public.mentor_verification_documents d
    WHERE d.mentor_id = v_uid
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'cv_missing');
  END IF;

  UPDATE public.mentor_profiles
    SET verification_status = 'pending',
        verification_submitted_at = now(),
        verification_reviewed_at = NULL,
        updated_at = now()
    WHERE user_id = v_uid;

  RETURN jsonb_build_object('success', true, 'status', 'pending');
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
  RETURN jsonb_build_object('success', false, 'error', 'unexpected', 'detail', v_error);
END;
$$;

CREATE OR REPLACE FUNCTION public.review_mentor_verification(
  p_mentor_id uuid,
  p_decision  text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_error text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  IF NOT public.is_moderator() THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_moderator');
  END IF;
  IF p_decision NOT IN ('verified', 'rejected', 'suspended') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_decision');
  END IF;

  -- Migration 012: approving requires a readable CV on file; a moderator may
  -- still reject/suspend a submission that has no document.
  IF p_decision = 'verified' AND NOT EXISTS (
    SELECT 1 FROM public.mentor_verification_documents d
    WHERE d.mentor_id = p_mentor_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'cv_missing');
  END IF;

  UPDATE public.mentor_profiles
    SET verification_status = p_decision,
        verification_reviewed_at = now(),
        updated_at = now()
    WHERE user_id = p_mentor_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'mentor_not_found');
  END IF;

  RETURN jsonb_build_object('success', true, 'status', p_decision);
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
  RETURN jsonb_build_object('success', false, 'error', 'unexpected', 'detail', v_error);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_mentor_verification() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_mentor_verification() FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_mentor_verification() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.review_mentor_verification(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.review_mentor_verification(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.review_mentor_verification(uuid, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Group cover illustration key (allow-listed, NULL = fallback art)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.study_groups
  ADD COLUMN cover_image_key text;

ALTER TABLE public.study_groups
  ADD CONSTRAINT study_groups_cover_image_key_check
  CHECK (
    cover_image_key IS NULL
    OR cover_image_key IN ('programming','mathematics','language','science','design')
  );
