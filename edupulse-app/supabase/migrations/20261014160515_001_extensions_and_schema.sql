-- Migration 001: Enable required extensions
-- EduPulse — STEP 4 Database Schema (APPROVED)
-- Run this in Supabase SQL Editor or via supabase CLI

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────────

-- UUID generation (already enabled in Supabase by default, but explicit is safe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigram index for fuzzy/partial text search on mentor profiles
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Auto-update updated_at timestamps via trigger function
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: generic updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
