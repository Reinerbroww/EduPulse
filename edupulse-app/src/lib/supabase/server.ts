import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

// Server client for Server Components, Server Actions, and Route Handlers.
//
// Always create a new client per request. Cookie writes are only possible from a
// Server Action or Route Handler; from a Server Component the write throws and is
// ignored because `proxy.ts` is responsible for refreshing the session cookie.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignored: called from a Server Component render, where cookies are
          // read-only. Session refresh happens in `proxy.ts`.
        }
      },
    },
  });
}
