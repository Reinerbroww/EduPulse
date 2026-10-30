-- Migration 014: Multiple support modes per learning goal
--
-- A goal may now be supported by more than one source at once (partner, group,
-- and/or mentor). The old single-value `support_mode` column is replaced by a
-- `support_modes text[]` column.
--
-- `any` from the old column is expanded to all three modes, so no information
-- is lost and existing goals keep the same meaning.

ALTER TABLE public.learning_goals
  ADD COLUMN IF NOT EXISTS support_modes text[] NOT NULL
  DEFAULT ARRAY['partner','group','mentor']::text[];

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'learning_goals'
      AND column_name = 'support_mode'
  ) THEN
    EXECUTE $sql$
      UPDATE public.learning_goals
      SET support_modes = CASE
        WHEN support_mode = 'any' THEN ARRAY['partner','group','mentor']::text[]
        ELSE ARRAY[support_mode]::text[]
      END
    $sql$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'learning_goals_support_modes_check'
      AND conrelid = 'public.learning_goals'::regclass
  ) THEN
    ALTER TABLE public.learning_goals
      ADD CONSTRAINT learning_goals_support_modes_check
      CHECK (
        cardinality(support_modes) >= 1
        AND support_modes <@ ARRAY['partner','group','mentor']::text[]
      );
  END IF;
END
$$;

ALTER TABLE public.learning_goals
  DROP COLUMN IF EXISTS support_mode;
