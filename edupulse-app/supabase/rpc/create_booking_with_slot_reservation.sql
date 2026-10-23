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
