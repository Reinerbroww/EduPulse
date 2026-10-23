-- Migration 011: RLS hardening from end-to-end QA
--
-- The QA harness exercised the database directly (as `authenticated`, simulating
-- PostgREST calls that bypass the app's server actions and RPCs) and found six
-- at-the-database gaps:
--
--   1-3. `mentor_bookings` could be INSERTed directly to create a paid booking,
--        a booking on a reserved slot, or a booking referencing another mentor's
--        slot. The insert policy only checked learner/age/verified-mentor.
--        Fix: revoke client INSERT; every booking must be created through the
--        atomic RPC `create_booking_with_slot_reservation()` (SECURITY DEFINER).
--   4.   `booking_payments` could be INSERTed directly with status = 'verified',
--        letting a learner self-verify a payment. Paid flow is disabled and only
--        the service role ever writes payments.
--        Fix: revoke client INSERT.
--   5.   `study_sessions` could be created by any authenticated user for any
--        group (the insert policy only checked created_by). Fix: require that the
--        creator is an active member of the target group.
--   6.   `study_session_members` allowed any authenticated user to self-join any
--        session by id, bypassing group membership/invites. Fix: self-join now
--        requires active membership of the session's group.
--
-- No application flow is affected: bookings/payments already go through RPCs and
-- session creation/joining already happens for members of the group.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1-3. mentor_bookings — no direct client inserts (RPC only)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS mentor_bookings_insert ON public.mentor_bookings;
REVOKE INSERT ON public.mentor_bookings FROM authenticated;
REVOKE INSERT ON public.mentor_bookings FROM anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. booking_payments — no direct client inserts (service role only)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS booking_payments_insert ON public.booking_payments;
REVOKE INSERT ON public.booking_payments FROM authenticated;
REVOKE INSERT ON public.booking_payments FROM anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. study_sessions — only active members may create a session in a group
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS study_sessions_insert ON public.study_sessions;
CREATE POLICY study_sessions_insert ON public.study_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (group_id IS NULL OR public.is_group_member(group_id))
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. study_session_members — self-join requires membership of the session group
-- ─────────────────────────────────────────────────────────────────────────────
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
