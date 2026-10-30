import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { NavLinks } from "@/components/app/nav-links";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { isDemoModeEnabled } from "@/lib/demo/fixtures";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {isDemoModeEnabled() ? (
        <div
          role="status"
          className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-center text-xs font-medium text-ink"
        >
          Mode demo aktif — data contoh untuk mencoba alur, bukan data produksi.
        </div>
      ) : null}

      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo href="/dashboard" />
            <div className="hidden md:block">
              <NavLinks />
            </div>
          </div>
          <form action={signOut}>
            <Button variant="secondary" size="sm" type="submit">
              Keluar
            </Button>
          </form>
        </div>
        <div className="border-t border-border px-4 py-2 md:hidden">
          <NavLinks />
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8"
      >
        {children}
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted sm:px-6">
          EduPulse — ruang belajar bersama.
        </div>
      </footer>
    </div>
  );
}
