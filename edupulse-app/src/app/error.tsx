"use client";

import { useEffect } from "react";

import { buttonClasses, Button } from "@/components/ui/button";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div
        role="alert"
        className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center shadow-soft"
      >
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-danger-soft text-danger">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </span>
        <h1 className="mt-3 text-lg font-semibold">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-muted">
          Halaman ini gagal dimuat. Coba muat ulang, atau kembali ke dashboard.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset}>Coba lagi</Button>
          <a
            href="/dashboard"
            className={buttonClasses("secondary", "md", "no-underline")}
          >
            Ke dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

