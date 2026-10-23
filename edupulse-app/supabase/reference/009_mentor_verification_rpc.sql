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
