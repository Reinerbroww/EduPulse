import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={buttonClasses("ghost", "sm", "no-underline")}
          >
            Masuk
          </Link>
          <Link
            href="/signup"
            className={buttonClasses("primary", "sm", "no-underline")}
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
