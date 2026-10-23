# EduPulse — Progress Report (Website + Migration 007 Correction)

Date: 2026-10-16
Author: AI assistant

## 0. Exploration fixes (2026-10-16)

Goal: make the site run error-free end to end for manual exploration.

1. Remote DB schema applied. The `public.profiles` (and all other) tables were
   missing, so every data query returned PostgREST `PGRST205`. Applied all 7
   migrations through the IPv4 Supabase pooler (region `ap-southeast-2`);
   `topics` is now seeded and REST queries return data.
2. Invisible text fixed. Theme token `--color-base` collided with Tailwind's
   font-size utility `text-base`, producing `.text-base { color: var(--color-base) }`
   (near-white headings). Renamed the token to `--color-canvas` in
   `src/app/globals.css` and updated `bg-base` → `bg-canvas` in the root/auth
   layouts and `auth/error`.
3. Edge protection fixed. Added `/groups` and `/sessions` to
   `PROTECTED_PREFIXES` in `src/lib/supabase/proxy.ts`.
4. Error boundaries added: `src/app/error.tsx` and `src/app/not-found.tsx`.
5. Cache Components write-up: authenticated pages tripped the static-shell
   prerender with `Date.now()` (`blocking-prerender-current-time`) because the
   Supabase session read is request-time. Fixed with the documented pattern:
   `await connection()` in `requireUser` (`src/lib/auth/guards.ts`) plus a
   per-route `loading.tsx` boundary (shared `src/components/app/route-loading.tsx`).
   Result: routes build as `◐ (Partial Prerender)` — static shell + streamed
   content — and dev shows no prerender errors.

## 1. CRITICAL FINDING — Migration 007 was corrupted (now fixed)

An actual byte-level inspection of the SQL artifacts (not substring-only checks)
revealed that migration 007 and every file that embedded it were **invalid SQL**:

- Literal escape sequences `\$\$` instead of `$$` dollar quoting.
- Literal `\n` text instead of real newlines (whole function body on one line).
- Invalid double schema qualification: `public.public.can_use_mentoring`,
  `public.public.mentor_availability_slots`, `public.public.mentor_bookings`,
  `public.public.booking_payments`, etc.

Previous reports (including `MIGRATION_FINAL_CONSISTENCY_CHECK.md`) reported the
RPC as "consistent/OK" because they used `String.contains(...)` substring checks
that still matched inside the corrupted text. That conclusion was wrong.

Affected files (all now corrected):
- `supabase/migrations/20261014160521_007_atomic_booking_rpc.sql`
- `supabase/rpc/create_booking_with_slot_reservation.sql`
- `supabase/migrations_bundle.sql` (007 section)
- `supabase/reference/007_atomic_booking_rpc.sql`
- `supabase/reference/007_atomic_booking_rpc_fixed.sql`

Files 001–006 were NOT corrupted (verified: no literal `\n`, no `public.public.`).

### Correction applied
Rewrote 007 as valid SQL, preserving the approved hardening:
- `SECURITY DEFINER` with `SET search_path = ''`.
- All objects schema-qualified (`public.*`, single qualification).
- `REVOKE EXECUTE ... FROM PUBLIC` and `FROM anon`; `GRANT EXECUTE ... TO authenticated`.
- `paid_booking_not_enabled` guard returns before any `UPDATE`/`INSERT` (no slot
  reservation, no booking, no payment row created on the rejected paid path).
- Auth check, age gate (`can_use_mentoring`, fail-closed), verified-mentor check,
  bidirectional block check, and double-booking prevention
  (`FOR UPDATE SKIP LOCKED` on `status = 'available'`).
- Removed the dead/unreachable paid `booking_payments` insert.

### Post-fix verification
- Dollar-quote markers: 2. `BEGIN`/`END;`: 1/1.
- No literal `\n`, no `public.public.` in any of the 5 files.
- All required security tokens present in all 5 files.

## 2. Website progress (STEP 6 implementation)

Build/lint/typecheck: PASS.

### Mentor discovery & booking (new)
- `src/app/(app)/discover/page.tsx` — lists verified mentors accepting bookings.
- `src/app/(app)/discover/mentors/[mentorId]/page.tsx` — mentor detail, services,
  verification status; non-verified mentors are blocked from active booking view.
- `src/app/(app)/discover/mentors/[mentorId]/book/page.tsx` — free-session booking
  form; paid services are blocked at the UI with an explicit message.
- `src/lib/data/mentors.ts` — typed mentor/service/slot queries (uses real
  `profiles.display_name`, not `full_name`).
- `src/lib/data/bookings.ts` — server action validating free service, then calling
  RPC `create_booking_with_slot_reservation`.
- `src/lib/data/bookings-list.ts` — learner's upcoming bookings.

### Learning goals (new)
- `src/lib/validation/goals.ts` — Zod schema.
- `src/lib/goals/actions.ts` — `createLearningGoal` (useActionState) + `updateGoalStatus`.
- `src/components/app/goal-form.tsx` — create form.
- `src/app/(app)/goals/page.tsx` — list + create.
- `src/lib/data/goals.ts` — typed list + active count.
- Booking server action lives at `src/lib/bookings/actions.ts` (`"use server"`).

### Dashboard (updated)
- Real stats: active goals, upcoming mentoring sessions.
- Booking success alert (`?booking=success`).
- Upcoming sessions list with status badges.

### Study groups (new)
- `src/lib/validation/groups.ts` — Zod schema (name, description, topic, goal,
  maxMembers 2–50, visibility).
- `src/lib/data/groups.ts` — `listVisibleGroups` (RLS-scoped: public + mine),
  `listMyMemberships`, `getGroupDetail`, `getMyMembership`.
- `src/lib/groups/actions.ts` — `createStudyGroup` (useActionState; inserts group
  + owner membership), `requestJoinGroup`, `respondJoinRequest` (owner
  approve/reject), `leaveGroup`. Capacity checks against `max_members`.
- `src/components/app/group-form.tsx` — create form.
- `src/app/(app)/groups/page.tsx` — my groups + public groups + create form.
- `src/app/(app)/groups/[groupId]/page.tsx` — members, owner join-request
  approvals, join/leave, session list + link to create session.
- Nav link "Kelompok" added to `src/components/app/nav-links.tsx`.

### Study sessions (new)
- `src/lib/validation/sessions.ts` — session/checklist/note schemas.
- `src/lib/data/sessions.ts` — `listGroupSessions`, `getSessionDetail`
  (members, checklist, notes), `getMySessionMembership`.
- `src/lib/sessions/actions.ts` — `createStudySession` (inserts session +
  organizer membership), `joinSession`, `leaveSession`, `addChecklistItem`,
  `toggleChecklistItem`, `addSessionNote`.
- `src/components/app/session-form.tsx` — create form (bound to groupId).
- `src/app/(app)/groups/[groupId]/sessions/new/page.tsx` — create session.
- `src/app/(app)/sessions/[sessionId]/page.tsx` — session detail; checklist and
  notes (private/shared) are gated behind session participation, matching RLS
  (`is_session_participant`).
- `src/lib/status.ts` — group/member/session label + tone maps added.

### Smart study matching & trust/safety (new)
- `src/lib/data/partners.ts` — `listMatchCandidates` (explainable rule-based
  matching over topics + open goals + availability; no percentage, only listed
  reasons), `getPartnerDetail`, `listMyPartnerRequests`, `getBlockedUserIds`,
  `listBlockedProfiles`. All reads are RLS-scoped (discoverable profiles only).
- `src/lib/validation/partners.ts` — Zod schemas for request, response, report,
  block.
- `src/lib/partners/actions.ts` — `sendPartnerRequest` (blocks self/duplicate/
  blocked-pair), `respondPartnerRequest` (accept/reject by recipient, cancel by
  requester).
- `src/lib/safety/actions.ts` — `blockUser`, `unblockUser`, `submitReport`.
- `src/components/app/partner-request-form.tsx` — send-request form
  (`useActionState`).
- `src/components/app/safety-panel.tsx` — reusable block/unblock + report panel.
- `src/app/(app)/discover/page.tsx` — reworked into Partner / Kelompok / Mentor
  tabs (`?tab=`), each tab loads its own RLS-scoped data.
- `src/app/(app)/discover/partners/[partnerId]/page.tsx` — partner detail
  (topics, open goals, availability, match reasons, request action, safety).
- `src/app/(app)/requests/page.tsx` — incoming + outgoing partner requests with
  accept/reject/cancel.
- `src/app/(app)/profile/page.tsx` — blocked-users list with unblock.
- Nav link "Permintaan" added; `/requests` added to `PROTECTED_PREFIXES`.
- Mentor detail page now includes the safety panel.
- `loading.tsx` boundaries added for `/discover/partners/[partnerId]` and
  `/requests`.

Known limitation: `user_blocks` RLS exposes only the caller's own block rows, so
the app can hide users the caller blocked but cannot detect a reverse block
(someone who blocked the caller). The reverse check ideally belongs in a DB
function/trigger (schema change — not made without approval).

### Structured mentoring & learning progress (new)
- `src/lib/data/mentoring.ts` — `getBookingDetail` (booking + mentor/learner
  names + linked goal + summary + feedback, role-aware), `getGoalProgress`
  (goal + own updates with source-session/booking labels).
- `src/lib/validation/mentoring.ts` — Zod schemas for session summary, mentor
  feedback (rating 1–5), and goal progress update (0–100).
- `src/lib/mentoring/actions.ts` — `saveSessionSummary` (booking party; refuses
  overwrite by a non-author), `submitMentorFeedback` (learner-only, completed
  booking), `addGoalProgressUpdate` (goal owner only).
- `src/components/app/{session-summary-form,mentor-feedback-form,goal-progress-form}.tsx`
  — `useActionState` forms.
- `src/app/(app)/bookings/[bookingId]/page.tsx` — Page 14/15 "Session Summary &
  Feedback": session context, parties, summary (view/edit), learner feedback,
  safety panel, link to goal progress.
- `src/app/(app)/goals/[goalId]/page.tsx` — Page 16 "Learning Progress":
  progress bar from the user's own recorded updates, activity history, add-update
  form (owner-only), read-only view for non-owners. Progress is user-recorded,
  never an automatic mastery claim.
- Links wired: goal card → "Progres"; dashboard upcoming booking → "Lihat sesi".
- `/bookings` added to `PROTECTED_PREFIXES`; `loading.tsx` for both new routes.
- Mapping note: the wireframe's three summary fields map to the two existing
  columns (`summary`, `next_steps`); the "hal yang membingungkan" field has no
  column and was folded into the free-text summary rather than adding schema.

### Mentor service & availability management (new)
- `src/lib/data/mentor-self.ts` — `getMyMentorProfile`, `listMyMentorServices`,
  `listMyMentorSlots` (all scoped to the signed-in mentor).
- `src/lib/validation/mentor.ts` — Zod schemas for mentor profile, service
  (enforces free→0 / paid→>0 price rule), and availability slot (ends > starts).
- `src/lib/mentor/actions.ts` — `upsertMentorProfile`, `submitMentorVerification`
  (sets `pending` + `verification_submitted_at`; never self-sets `verified`),
  `toggleAcceptingBookings`, `createMentorService`,
  `toggleMentorServiceActive`, `deleteMentorService`, `createMentorSlot`,
  `deleteMentorSlot`.
- `src/components/app/{mentor-profile-form,mentor-service-form,mentor-slot-form}.tsx`
  — `useActionState` forms.
- `src/app/(app)/mentor/page.tsx` — Ruang Mentor: create/edit mentor profile,
  verification status + submit, accepting-bookings toggle, service CRUD, and
  availability-slot CRUD.
- Nav link "Mentor" added; `/mentor` added to `PROTECTED_PREFIXES`; `loading.tsx`
  added.
- Paid bookings remain disabled (UI + RPC); the service form allows recording
  paid services but shows an explicit MVP notice, and paid sessions stay
  unbookable. Verification is manual: a mentor can only submit `pending` via the
  RPC, never `verified` (moderator approval now lives in the Ruang Moderator; see
  the moderator section below).

### Booking lifecycle & status management (new)
- Migration `20261016120000_008_booking_status_transitions.sql` — new
  `SECURITY DEFINER` RPC `transition_booking_status(p_booking_id, p_action,
  p_reason)`. Validates the caller is a booking party, enforces the allowed
  status transitions, records `cancellation_reason`/`cancelled_at`, and returns
  the reserved availability slot to `available` whenever the session will not
  happen (decline / either cancel). Applied to remote via the pooler `--db-url`
  path. Bundle + `supabase/reference/008_*.sql` updated.
- `src/lib/bookings/actions.ts` — `transitionBooking` server action (RPC wrapper
  with friendly EN→ID error/success messages; revalidates booking, list, and
  dashboard).
- `src/lib/data/bookings-list.ts` — `listMyBookings` (learner + mentor rows with
  role and counterpart name).
- `src/components/app/booking-actions.tsx` — role/status-aware controls: mentor
  confirm/decline (pending), mentor complete/cancel (confirmed), learner cancel;
  destructive actions capture an optional reason. Self-hides on terminal status.
- `src/app/(app)/bookings/page.tsx` + `loading.tsx` — booking list split into
  "as learner" and "as mentor" (H12 Booking Review & Status).
- `src/app/(app)/bookings/[bookingId]/page.tsx` — now hosts the actions card and
  gates the session-summary card to confirmed/completed sessions.
- Nav link "Booking" added; `/bookings` already in `PROTECTED_PREFIXES`.
- Verified on the live DB inside a rolled-back transaction: mentor-only guard,
  confirm, invalid-transition guard, `cancel_by_mentor` (reason persisted + slot
  released), complete, `cancel_by_learner` (slot released), and `not_a_party`.

### Moderator review queue & mentor-verification RPCs (new)
- Bug found & fixed: `mentor_profiles` restricts column-level UPDATE for the
  `authenticated` role (005), so the previous `submitMentorVerification` silently
  failed ("permission denied") and no mentor could reach `pending`/`verified`.
  (An earlier report note claiming mentors could self-set `verification_status`
  was incorrect; a direct self-update is in fact blocked.)
- Migration `20261016130000_009_mentor_verification_rpc.sql` — two additive
  `SECURITY DEFINER` RPCs: `submit_mentor_verification()` (mentor → `pending`,
  guarded against already pending/verified/suspended) and
  `review_mentor_verification(p_mentor_id, p_decision)` (moderator-only →
  `verified`/`rejected`/`suspended`, sets `verification_reviewed_at`). Applied to
  remote via the pooler; bundle + `supabase/reference/009_*.sql` updated.
- `src/lib/mentor/actions.ts` — `submitMentorVerification` now calls the RPC.
- `src/lib/data/moderation.ts` — `isCurrentUserModerator`, `listPendingVerifications`,
  `listReports`.
- `src/lib/moderation/actions.ts` — `reviewVerification` (RPC) and `resolveReport`
  (sets `status` + `resolution_note` + `reviewed_by`/`reviewed_at`; RLS already
  allows moderator updates on `user_reports`).
- `src/app/(app)/moderator/page.tsx` + `loading.tsx` — Ruang Moderator: a mentor
  verification queue (approve/reject) and a reports queue
  (in_review/resolved/dismissed + internal note). Non-moderators see an
  access-restricted empty state.
- Entry point: a "Moderasi" card on `/profile` (rendered only for moderators), so
  the shared layout stays free of cookie reads and the top-level (app) routes keep
  `◐ Partial Prerender`. `/moderator` added to `PROTECTED_PREFIXES`.
- Verified on the live DB inside a rolled-back transaction (as the `authenticated`
  role so RLS/column grants apply): mentor submit → `pending`; re-submit →
  `already_pending`; non-moderator review → `not_moderator`; moderator review →
  `verified` (+ timestamps); direct self-update blocked.

### Profile & settings — availability windows (new)
- Closed the last STEP 6 group-5 surface: availability windows were readable by
  matching (`listMatchCandidates`) but had no write path in the app.
- No schema change required — `user_availability_all` (005) already grants the
  owner full CRUD (`user_id = auth.uid()`), so this is pure app code.
- `src/lib/data/settings.ts` — `listMyAvailability(userId)` (scoped by `user_id`
  because the SELECT policy also exposes discoverable users' rows).
- `src/lib/validation/settings.ts` — `availabilitySchema` (day 0–6, `HH:MM`
  time, end > start).
- `src/lib/settings/actions.ts` — `addAvailability` (useActionState form),
  `deleteAvailability`, `toggleAvailability` (all scoped to the owner).
- `src/components/app/availability-manager.tsx` — client component: per-day list
  with activate/deactivate + delete, plus an add form (`<input type="time">`).
- `src/app/(app)/profile/page.tsx` — new "Jadwal belajar" card hosting the
  manager; `/profile` remains `◐ Partial Prerender` (no new route, no layout
  cookie read).

### Bug fix — onboarding save failed with "Gagal menyimpan preferensi keselamatan"
- Symptom: editing the learning profile on `/onboarding` returned
  "Gagal menyimpan preferensi keselamatan. Coba lagi." and never redirected.
- Root cause (reproduced on the live DB as the `authenticated` role): the
  signed-in account was created **before** the `on_auth_user_created` trigger
  (004) existed, so it had **no `profiles` row** (auth.users = 1, profiles = 0,
  user_safety_settings = 0). `completeOnboarding` ran `profiles.update(...)`
  which silently matched **0 rows**, then the `user_safety_settings` upsert hit
  a foreign-key violation `23503` (`user_safety_settings_user_id_fkey`, "Key is
  not present in table profiles").
- Fix 1 (app): `src/lib/onboarding/actions.ts` now **upserts** the profile
  (`onConflict: "id"`) instead of updating, so a missing row is created and
  saves stay idempotent. The `profiles_insert` policy (005) already permits it.
- Fix 2 (data): migration `20261019120000_010_backfill_missing_profiles.sql`
  inserts the missing auto-provision `profiles` + `user_safety_settings` rows
  for legacy auth users (idempotent, `ON CONFLICT DO NOTHING`; no schema/RLS
  change). Applied to remote via the pooler; bundle + `reference/010_*.sql`
  updated. Post-apply counts: profiles 1, safety 1.
- Verified under the `authenticated` role in a rolled-back transaction: profile
  upsert OK, safety upsert OK, topic delete OK.

### RLS hardening — six security gaps closed (migration 011)
- Method: a repeatable DB integration harness exercised every server action's SQL
  path under simulated JWTs (`SET LOCAL ROLE authenticated` +
  `request.jwt.claims`, inside a `SAVEPOINT`-protected, rolled-back
  transaction) using 7 throwaway users. **72/72 checks PASS** after the fixes;
  no remote data was modified.
- Six gaps found & fixed by `supabase/migrations/20261019130000_011_rls_hardening.sql`
  (applied to remote via the pooler `--db-url` path; mirrored to
  `supabase/reference/011_rls_hardening.sql` + `supabase/migrations_bundle.sql`):
  1. Paid/any booking could be created by directly inserting into
     `mentor_bookings` (bypassing `create_booking`).
  2. A booking could target an already-occupied slot.
  3. A booking could target **another mentor's** slot.
  4. A learner could self-verify a payment by inserting into `booking_payments`.
  5. A non-member could create a study session attached to someone else's group.
  6. Any user could self-insert into `study_session_members` for any session.
- Fixes (additive; no approved schema/table changes): revoked client `INSERT` on
  `mentor_bookings` and `booking_payments` (now RPC/service-role only), recreated
  `study_sessions_insert` to require an **active group member**, added
  `can_join_session(...)` (`SECURITY DEFINER`), and recreated
  `study_session_members_insert` to require organizer-or-valid-participant.
  Attacker attempts now fail `permission denied` (`42501`) or RLS; legitimate
  flows still pass.
- Not fixed (needs owner approval): reverse block detection is impossible under
  `user_blocks` RLS (exposes only one's own rows) and would require a
  `SECURITY DEFINER` function or trigger.

## 3. Constraints respected
- Paid booking remains disabled (UI + server action + RPC guard).
- Under-18 mentoring remains blocked (age gate; dashboard warning).
- No approved schema (tables/columns/RLS) changed. Four additive migrations
  were added (008 booking status transitions, 009 mentor verification — both
  `SECURITY DEFINER` RPCs; 010 is a data-only backfill of auto-provision rows;
  011 is additive RLS hardening — revoked client `INSERT` + tightened two
  `WITH CHECK` clauses + one helper function)
  with owner approval and applied to remote via the pooler `--db-url` path.
- No destructive operation performed.

## 4. Still blocked / next
- Supabase CLI not authenticated (`supabase login` absent); remote changes are
  applied through the pooler `--db-url` path instead.
- Live RLS/RPC tests still require 2+ authenticated users. Public signup is
  currently rate-limited (HTTP 429) by Supabase's shared SMTP, so a fresh test
  account could not be created on 2026-10-16.

## 5. Recommendation
- Use an existing account (or raise the auth rate limit) to exercise the
  authenticated flows end to end.
- Study groups + study sessions are implemented and build clean; live exercise
  requires ≥2 authenticated users.
- Smart partner matching + trust/safety are implemented and build clean as
  `◐ (Partial Prerender)` routes; live exercise (matching quality, block/report)
  requires ≥2 authenticated users with topics/goals/availability filled in.
- Structured mentoring (session summary + feedback) and learning progress are
  implemented and build clean; live exercise needs a mentor account, a completed
  booking, and a goal owner.
- Mentor service/availability management is implemented and builds clean; live
  exercise needs a mentor account.
- Booking lifecycle (confirm/decline/complete/cancel) is implemented and the RPC
  is verified against the live DB; in-browser exercise needs a learner + mentor
  account with a pending booking.
- Moderator review queue (mentor verification + reports) is implemented and the
  RPCs are verified against the live DB; in-browser exercise needs a moderator
  account (JWT `app_metadata.role` = `moderator` or `admin`).
- Profile & settings: availability-window management is now on `/profile`
  ("Jadwal belajar") and builds clean; live exercise just needs any signed-in
  account (it feeds the partner-matching availability overlap).
- Remaining STEP 6 group-5 surfaces: the reverse-block hardening below.
- Consider adding a DB-level bidirectional block check (function/trigger) to
  enforce blocked pairs server-side; this is a schema change and needs approval.
- Clarified: mentors cannot self-set `verification_status` (column grant, 005);
  the only write path is the moderator RPC, so no hardening is needed for that.
