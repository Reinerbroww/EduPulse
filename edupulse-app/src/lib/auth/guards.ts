import { connection } from "next/server";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { getSessionUser, type CurrentUser } from "@/lib/data/profile";

// Server-side guard for authenticated routes. The proxy performs the same check
// at the edge of the request; this is the authoritative check close to the data.
export async function requireUser(redirectTo: string): Promise<CurrentUser> {
  // Reading the session is request-time (Supabase compares token expiry against
  // the clock). Mark the segment dynamic so page shells stream the real UI in
  // behind their <Suspense>/loading boundary instead of prerendering it.
  await connection();

  if (!isSupabaseConfigured) redirect("/login");

  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}
