import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";

// Authenticated routes read the session cookie at request time (see
// `getCurrentUserContext`). This segment is intentionally allowed to render per
// request instead of being validated for an instant static shell. Adopt
// `use cache: private` + <Suspense> boundaries per route if instant navigation is
// needed later (see Next.js "Authentication with Cache Components").
export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
