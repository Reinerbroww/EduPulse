import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EduPulse — Belajar bersama, tumbuh bersama",
    template: "%s · EduPulse",
  },
  description:
    "EduPulse membantu pelajar menemukan partner belajar, kelompok, dan mentor, lalu mencatat progres menuju tujuan belajar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col bg-canvas text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-[var(--radius-control)] focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-ink focus:shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          Langsung ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
