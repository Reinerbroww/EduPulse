# EduPulse

Aplikasi web untuk membantu pelajar menemukan partner belajar, kelompok, dan
mentor, lalu mencatat progres menuju tujuan belajar.

Dokumen ini menjelaskan fondasi teknis (Milestone 1) dan cara menjalankan proyek.

## Stack

- **Next.js 16 (App Router, Turbopack)** dengan Cache Components & Partial
  Prefetching aktif.
- **TypeScript** (strict).
- **Tailwind CSS v4** melalui loader `@tailwindcss/turbopack`.
- **Supabase** (PostgreSQL + Auth + RLS) via `@supabase/ssr` dan
  `@supabase/supabase-js`.
- **Zod** untuk validasi input server action.

> Catatan Next.js 16: `middleware.ts` diganti `proxy.ts`; `cookies()`/`headers()`
> bersifat async; konfigurasi segmen `dynamic`/`revalidate` digantikan
> `use cache`/`cacheLife`. Baca `node_modules/next/dist/docs/` sebelum mengubah
> perilaku rendering/caching.

## Menjalankan proyek

Tooling: Node.js 20+ dan npm (proyek ini tidak memakai pnpm/yarn).

```bash
cd edupulse-app
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev                  # http://localhost:3000
```

Skrip lain:

| Skrip               | Fungsi                              |
| ------------------- | ----------------------------------- |
| `npm run lint`      | ESLint                              |
| `npm run typecheck` | Pemeriksaan tipe (`tsc --noEmit`)   |
| `npm run build`     | Build produksi                      |
| `npm run start`     | Menjalankan hasil build             |

Belum ada test runner. Jalankan `lint` + `typecheck` + `build` sebagai gate.

## Environment

Variabel dibaca terpusat di `src/lib/env.ts`. Build tidak gagal bila nilainya
kosong — aplikasi memakai placeholder valid dan menampilkan pesan setup, sehingga
halaman tidak pernah menembak network ke host placeholder.

Wajib (lihat `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (opsional di dev; dipakai untuk tautan email)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, belum dipakai di Milestone 1)

## Database (Supabase)

Migrasi ada di `supabase/migrations/` dan dijalankan berurutan:

| File                            | Isi                                                    |
| ------------------------------- | ------------------------------------------------------ |
| `001_extensions_and_schema.sql` | Ekstensi + fungsi `update_updated_at_column()`         |
| `002_tables.sql`                | 23 tabel (STEP 4)                                      |
| `003_indexes.sql`               | Index untuk pola query utama                           |
| `004_functions_and_triggers.sql`| Trigger `handle_new_user` + helper otorisasi RLS       |
| `005_rls_policies.sql`          | RLS untuk 23 tabel + proteksi kolom sensitif           |
| `006_seed_topics.sql`           | Seed katalog topik                                     |

Jalankan melalui Supabase SQL Editor atau `supabase db push`. Setelah signup,
trigger `on_auth_user_created` otomatis membuat baris `profiles` dan
`user_safety_settings`.

### RLS ringkas

- `user_safety_settings`: hanya pemilik + moderator.
- Profil/discovery bergantung pada `profile_visibility` (`discoverable`/`private`).
- Proteksi kolom sensitif:
  - `mentor_profiles.verification_*` dilindungi dari **UPDATE** oleh pemilik
    (mentor tidak bisa mengubah status verifikasinya sendiri); pembacaan tetap
    diizinkan agar badge verifikasi dapat ditampilkan.
  - `booking_payments.verified_by`/`verified_at`/`review_note` dan
    `user_reports.reviewed_by`/`reviewed_at`/`resolution_note` **disembunyikan dari
    SELECT** pengguna biasa. Moderasi/verifikasi dilakukan dengan **service role**
    di server.
- Booking mentor diblokir kecuali akun memiliki `age_band = '18_or_over'`
  (`under_18` dan `not_set` ditolak — fail closed).
- Query ke tabel berkolom terbatas (`booking_payments`, `user_reports`) harus
  memilih kolom eksplisit (bukan `*`).

## Autentikasi

- `src/proxy.ts` (pengganti middleware) menyegarkan sesi dan memproteksi
  `/dashboard`, `/onboarding`, `/goals`, `/discover`, `/profile`.
- Halaman auth: `/login`, `/signup`, `/reset-password`, `/update-password`.
- Route handler `/auth/confirm` menangani tautan email (flow `code` maupun
  `token_hash`+`type`) lalu mengarahkan ke `next`.
- Server actions ada di `src/lib/auth/actions.ts` dan
  `src/lib/onboarding/actions.ts`.

## Cara menguji

Belum ada test runner otomatis pada Milestone 1 (belum menjadi bagian scope).
Gate saat ini adalah `npm run lint` + `npm run typecheck` + `npm run build`.

Smoke test manual yang disarankan (butuh `.env.local` terisi dan migrasi
dijalankan):

1. `npm run dev`, buka `/` — landing page tampil tanpa error.
2. `/signup` → daftar akun baru. Cek email konfirmasi → tautan mengarah ke
   `/auth/confirm?next=/onboarding`.
3. Setelah masuk, `/onboarding` menyimpan profil; baris `profiles` dan
   `user_safety_settings` sudah otomatis dibuat oleh trigger.
4. `/dashboard` menampilkan nama, jenjang, zona waktu, dan visibilitas.
5. `/login` / tombol **Keluar** (logout) berfungsi; `/reset-password` mengirim
   tautan ke `/update-password`.
6. Uji RLS dengan dua akun: akun A tidak boleh membaca baris privat akun B.

## Struktur

```
src/
  app/
    (auth)/            halaman login/signup/reset/update-password
    (app)/             area terautentikasi (dashboard, onboarding, dst.)
    auth/confirm/      route handler konfirmasi email
    auth/error/        halaman tautan tidak valid
    layout.tsx         metadata + <html lang="id">
    globals.css        design token (STEP 5)
  components/
    app/               shell, nav, header, form onboarding
    auth/              kartu + form auth
    brand/             logo
    ui/                primitives (button, input, card, badge, alert, dst.)
  lib/
    auth/              actions + guard
    data/              akses data (profiles, topics)
    onboarding/        action onboarding
    supabase/          client, server, proxy
    utils/             cn()
    env.ts             akses environment
    status.ts          label/tone status
supabase/migrations/   SQL migrasi
```

## Desain (STEP 5)

Token di `src/app/globals.css` (`@theme`): primary `#246b60`, base `#f8faf8`,
accent `#f2b84b`, ink `#20302d`, muted `#5e6e68`, surface `#ffffff`, border
`#e1e8e4`, radius kartu 14px. Status selalu ditampilkan sebagai badge berlabel
teks (bukan warna saja).
