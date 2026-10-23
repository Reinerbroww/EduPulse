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
