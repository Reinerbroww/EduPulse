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
