import Image from "next/image";
import Link from "next/link";

import { PublicHeader } from "@/components/app/public-header";
import {
  CalendarIcon,
  CompassIcon,
  ProgressIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@/components/brand/icons";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const benefits = [
  {
    icon: UsersIcon,
    title: "Partner & kelompok belajar",
    body: "Temukan pelajar dengan topik, tujuan, dan jadwal yang cocok — lengkap dengan alasan kecocokan, bukan pencarian acak.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Mentor yang transparan",
    body: "Lihat keahlian, status verifikasi, durasi, harga, dan ketentuan sesi sebelum mengajukan — semua terbaca jelas.",
  },
  {
    icon: ProgressIcon,
    title: "Progres yang tercatat",
    body: "Simpan hasil sesi, catatan, dan langkah belajar berikutnya agar kamu tetap konsisten dari waktu ke waktu.",
  },
];

const steps = [
  {
    title: "Buat profil belajar",
    body: "Ceritakan jenjang, topik, tingkat pemahaman, dan ketersediaanmu.",
  },
  {
    title: "Tetapkan tujuan",
    body: "Tentukan target konkret dan pilih dukungan: partner, kelompok, mentor, atau semuanya.",
  },
  {
    title: "Mulai sesi & catat progres",
    body: "Jalankan sesi, simpan ringkasan, dan lihat langkah belajar berikutnya.",
  },
];

const trustPoints = [
  {
    icon: CompassIcon,
    title: "Penemuan yang relevan",
    body: "Rekomendasi didasarkan pada topik, tujuan, dan jadwal — bukan popularitas.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Verifikasi yang jelas",
    body: "Status mentor ditinjau manual dan ditampilkan apa adanya, termasuk sebelum booking.",
  },
  {
    icon: CalendarIcon,
    title: "Jadwal yang transparan",
    body: "Ketersediaan, durasi, harga, dan kebijakan sesi mudah dibandingkan.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-xl">
            <p className="mb-3 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Warm, collaborative &amp; trustworthy
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Belajar lebih konsisten, bersama orang yang tepat.
            </h1>
            <p className="mt-4 text-lg text-muted">
              EduPulse menyatukan pencarian partner belajar, kelompok, dan mentor
              dalam satu pengalaman — mulai dari tujuan belajar, bukan sekadar
              mencari orang secara acak.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className={buttonClasses("primary", "lg", "no-underline")}
              >
                Mulai belajar
              </Link>
              <Link
                href="/login"
                className={buttonClasses("secondary", "lg", "no-underline")}
              >
                Saya sudah punya akun
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              Gratis untuk memulai. Tidak perlu kartu kredit.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <Image
              src="/images/hero-collaboration.svg"
              alt="Ilustrasi pelajar berkolaborasi dalam kelompok belajar"
              width={640}
              height={480}
              priority
              unoptimized
              className="h-auto w-full rounded-[var(--radius-card)]"
            />
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Yang bisa kamu lakukan
            </h2>
            <p className="mt-2 max-w-2xl text-muted">
              Satu ruang untuk menemukan orang, memahami sesi, dan mencatat
              kemajuan — tanpa feed yang ramai.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <Card key={benefit.title}>
                  <CardHeader>
                    <span className="mb-2 grid size-10 place-items-center rounded-[var(--radius-control)] bg-primary/10 text-primary">
                      <benefit.icon className="size-5" />
                    </span>
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted">{benefit.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-semibold sm:text-3xl">Cara kerjanya</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft"
              >
                <span className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Dapat dipercaya sejak awal
            </h2>
            <p className="mt-2 max-w-2xl text-muted">
              Kami menampilkan informasi yang membantumu memutuskan dengan tenang —
              sebelum kamu berkomitmen pada sebuah sesi.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {trustPoints.map((point) => (
                <div key={point.title} className="flex gap-3">
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-primary/10 text-primary">
                    <point.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{point.title}</h3>
                    <p className="mt-1 text-sm text-muted">{point.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="rounded-[var(--radius-card)] border border-border bg-primary px-6 py-10 text-center text-primary-foreground sm:px-10">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Siap mulai belajar bersama?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm opacity-90">
              Buat profil belajarmu, tetapkan satu tujuan, dan temukan partner,
              kelompok, atau mentor yang cocok.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className={buttonClasses(
                  "secondary",
                  "lg",
                  "border-transparent bg-surface text-ink no-underline hover:border-transparent",
                )}
              >
                Mulai belajar
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-control)] px-6 text-base font-medium text-primary-foreground no-underline transition-colors hover:bg-white/10"
              >
                Masuk
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>EduPulse — ruang belajar bersama.</span>
        </div>
      </footer>
    </div>
  );
}
