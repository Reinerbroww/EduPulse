import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Tautan tidak valid" };

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-3 sm:px-6">
          <Logo />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tautan tidak valid</CardTitle>
              <CardDescription>
                Tautan konfirmasi atau reset sudah kedaluwarsa atau pernah
                digunakan. Ajukan tautan baru untuk melanjutkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link
                href="/reset-password"
                className={buttonClasses("primary", "md", "w-full no-underline")}
              >
                Ajukan tautan baru
              </Link>
              <Link
                href="/login"
                className={buttonClasses(
                  "secondary",
                  "md",
                  "w-full no-underline",
                )}
              >
                Kembali ke halaman masuk
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
