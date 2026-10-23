// Central environment access.
//
// Public values are read from NEXT_PUBLIC_* variables so they can be inlined into
// the client bundle at build time. We accept both the legacy anon key and the
// newer publishable key name (Supabase v2). A syntactically valid placeholder is
// used when variables are missing so `next build` and static prerendering never
// crash on a fresh checkout. At runtime, `isSupabaseConfigured` is false and the
// app shows a clear setup message instead of making network calls to a
// placeholder host.

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_ANON_KEY = "placeholder-anon-key";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || PLACEHOLDER_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  PLACEHOLDER_ANON_KEY;

export const SUPABASE_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;

// Optional absolute site URL used to build email redirect links. Falls back to
// the request origin when unset.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";

export const isSupabaseConfigured =
  SUPABASE_URL !== PLACEHOLDER_URL &&
  SUPABASE_PUBLISHABLE_KEY !== PLACEHOLDER_ANON_KEY;

export const envSetupMessage =
  "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (atau NEXT_PUBLIC_SUPABASE_ANON_KEY) pada .env.local.";
