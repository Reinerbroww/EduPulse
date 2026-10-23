import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <Link href="/" className="text-sm text-muted no-underline">
            Kembali ke beranda
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center sm:py-14"
      >
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
