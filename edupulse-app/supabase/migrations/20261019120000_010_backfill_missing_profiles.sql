-- Migration 010: Backfill profiles + safety settings for legacy auth users
--
-- Accounts created before the `on_auth_user_created` trigger (004) existed have
-- no `profiles` row. Saving onboarding then fails: the profile UPDATE matches 0
-- rows, and the following `user_safety_settings` insert violates
-- `user_safety_settings_user_id_fkey` (23503).
--
-- This migration only INSERTs auto-provision rows into existing tables (same
-- logic as `handle_new_user`); it is idempotent and changes no schema/RLS.

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
