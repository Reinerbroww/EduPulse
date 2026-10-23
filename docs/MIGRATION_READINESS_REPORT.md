# EduPulse — Final Migration Readiness Review

## 1) Migration files & workflow
- Files in supabase/migrations/: 001_extensions_and_schema.sql, 002_tables.sql (23 tables), 003_indexes.sql, 004_functions_and_triggers.sql, 005_rls_policies.sql, 006_seed_topics.sql, 007_atomic_booking_rpc.sql.
- Bundle migrations_bundle.sql contains all 7 in order. No duplicates.
- No supabase/config.toml. No local supabase CLI installed; can use npx or SQL Editor.
- No remote migration history visible (schema not applied). Assume clean apply.
- DO NOT run db reset. Prefer SQL Editor or npx supabase db push only after approval.

## 2) RPC 007 security
- SECURITY DEFINER + SET search_path=public.
- auth.uid() checked; denies unauthenticated.
- Age gate: can_use_mentoring requires age_band='18_or_over' (fail-closed).
- Mentor verified: is_verified_mentor.
- Bidirectional block check.
- FOR UPDATE SKIP LOCKED on available slot prevents double booking.
- Validates service active+owned by mentor.
- Reserves slot to 'reserved', creates booking pending with snapshots.
- Paid path only creates booking_payments if price_type='paid' (status awaiting_instructions). Paid booking remains disabled operationally until pilot approved.
- GRANT EXECUTE to authenticated only. Errors returned as sanitized jsonb.

## 3) Remote apply checklist
- [ ] Verify correct project ref (oogqboodhrvjfkfaumza.supabase.co).
- [ ] Apply supabase/migrations_bundle.sql via Supabase SQL Editor (recommended).
- [ ] Verify: 23 tables, RLS enabled on 23, topics 24, function exists, triggers present.
- [ ] Test RPC success + conflict with 2 users.

## 4) Recommendation
STOP before remote apply. Apply bundle via Supabase SQL Editor ONLY after explicit approval. No destructive ops, no deploy, no schema changes beyond approved migrations/RPC.

