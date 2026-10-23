import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center shadow-soft">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-1 text-lg font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted">
          Tautan yang kamu buka tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link
            href="/dashboard"
            className={buttonClasses("primary", "md", "no-underline")}
          >
            Ke dashboard
          </Link>
          <Link
            href="/"
            className={buttonClasses("secondary", "md", "no-underline")}
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
