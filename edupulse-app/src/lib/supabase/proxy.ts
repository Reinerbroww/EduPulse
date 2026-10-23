import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

// Route prefixes that require an authenticated session. Keep in sync with the
// protected route group under `src/app/(app)`.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/goals",
  "/discover",
  "/requests",
  "/groups",
  "/sessions",
  "/bookings",
  "/mentor",
  "/moderator",
  "/profile",
];

// Pages a signed-in user should be redirected away from.
const AUTH_PAGES = ["/login", "/signup", "/reset-password"];

function isMatch(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Refreshes the Supabase auth session on every matched request and enforces
 * coarse-grained route access. Fine-grained authorization still lives in RLS and
 * in each Server Action.
 */
export async function updateSession(request: NextRequest) {
  // Without Supabase configuration we cannot validate a session; skip network
  // calls to the placeholder host and let pages render their own setup notice.
  if (!isSupabaseConfigured) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // IMPORTANT: call before generating any response so a token refresh can be
  // written back to the response cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && isMatch(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
