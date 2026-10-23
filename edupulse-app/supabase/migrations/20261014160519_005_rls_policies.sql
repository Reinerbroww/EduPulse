-- Migration 005: Row Level Security policies
-- EduPulse — STEP 4 Database Schema (APPROVED), section 6 "Aturan Akses dan Keamanan"
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. profiles
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. user_safety_settings — owner + moderators only
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.user_safety_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_safety_settings_all ON public.user_safety_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_moderator())
  WITH CHECK (user_id = auth.uid() OR public.is_moderator());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. topics — public read of active topics, admin-managed
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. profile_topics
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. user_availability
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. learning_goals
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. study_partner_requests
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. study_groups
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. study_group_members
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. study_sessions
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. study_session_members
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. study_session_checklist_items
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. study_session_notes
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. mentor_profiles — verification fields reserved for service role
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. mentor_services
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. mentor_availability_slots
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. mentor_bookings — no mentoring for age_band = 'under_18'
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. booking_payments — learner submits reference; only service role verifies
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 19. mentoring_session_summaries
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 20. mentor_feedback — one feedback per completed booking by its learner
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 21. learning_goal_updates
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 22. user_blocks — owners manage their own block list only
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_blocks_select ON public.user_blocks
  FOR SELECT TO authenticated
  USING (blocker_id = auth.uid() OR public.is_moderator());

CREATE POLICY user_blocks_all ON public.user_blocks
  FOR ALL TO authenticated
  USING (blocker_id = auth.uid())
  WITH CHECK (blocker_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 23. user_reports — reporter sees own; internal notes moderator-only
-- ─────────────────────────────────────────────────────────────────────────────
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
