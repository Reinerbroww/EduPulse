-- Migration 013: Profile photo (avatar) storage
--
-- ADDITIVE ONLY. Nothing in 001-012 is dropped or altered.
--
-- Contents:
--   1. A PUBLIC storage bucket `avatars` (image only, 2 MB ceiling). Avatar
--      bytes live only in Storage; `profiles.avatar_url` stores the public URL.
--   2. storage.objects policies: a user may only write/replace/delete objects
--      inside their own `<uid>/...` folder. Reads are open because the bucket is
--      public (profile photos are shown on discover/mentor cards).
--
-- `profiles.avatar_url` already exists (migration 002) and the owner UPDATE
-- policy already lets a user change it (migration 005), so no table change is
-- required here.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Public avatar bucket
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2 * 1024 * 1024,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS avatars_insert ON storage.objects;
DROP POLICY IF EXISTS avatars_select ON storage.objects;
DROP POLICY IF EXISTS avatars_update ON storage.objects;
DROP POLICY IF EXISTS avatars_delete ON storage.objects;

-- Write only into your own folder.
CREATE POLICY avatars_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public bucket: anyone (including anon) may read an avatar object. The row is
-- only referenced by URL on public profile surfaces, so this is intentional.
CREATE POLICY avatars_select ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Replacing a photo is an in-place overwrite of `<uid>/avatar-<epoch>.<ext>`;
-- allow the owner to update objects in their own folder only.
CREATE POLICY avatars_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY avatars_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
