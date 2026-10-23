# Laporan Milestone — Mentor Onboarding, Verifikasi CV, Sampul Kelompok, Mode Demo

Status: **SELESAI (milestone ini) — berhenti untuk review pemilik.**
Tanggal: 2026-10-20
Lingkup: §1–§8 sesuai arahan Mentor Onboarding / Moderator / Demo.

> Catatan pembatas: migrasi **012 TIDAK diterapkan ke database remote** (sesuai
> larangan). Migrasi diverifikasi di lingkungan lokal Supabase (Docker) yang
> bersih, lalu stack lokal dimatikan. Fitur CV + persetujuan mentor baru aktif
> setelah pemilik menerapkan 012. Kode + migrasi harus dirilis bersamaan.

---

## 1. Ringkasan perubahan aktual

| # | Area | Berkas utama | What changed |
|---|------|--------------|--------------|
| §1 | Bug buat profil mentor | `src/lib/mentor/actions.ts`, `src/lib/validation/mentor.ts` | `upsertMentorProfile` ditulis ulang: update-first lalu insert, retry sekali pada `23505`, pesan sukses dibuat/diperbarui. Perbaikan bug validasi `experience_years`. |
| §2 | CV + verifikasi | `supabase/migrations/20261019160000_012_*.sql`, `src/lib/mentor/{cv.ts,actions.ts}`, `src/lib/validation/mentor.ts`, `src/lib/data/{mentor-self.ts,moderation.ts}`, `src/lib/moderation/actions.ts`, `src/components/app/{mentor-cv-card,mentor-verification-submit,moderator-verification-actions}.tsx`, `src/app/(app)/cv/[mentorId]/route.ts`, `src/app/(app)/{mentor,moderator}/page.tsx` | Unggah CV PDF (klien + server), bucket privat, RPC berguard `cv_missing`, akses signed URL 60 detik untuk owner/moderator. |
| §3 | Setup moderator | `scripts/set-moderator.mjs`, `docs/moderator-setup.md`, `package.json` | Skrip server-side pakai Supabase Admin API + `SUPABASE_SERVICE_ROLE_KEY`; tanpa tombol publik; validasi peran; JWT refresh. |
| §4 | Sampul kelompok | `public/images/group-covers/*.svg` (6), `src/lib/groups/covers.ts`, `src/lib/validation/groups.ts`, `src/lib/groups/actions.ts`, `src/lib/data/groups.ts`, `src/components/app/group-form.tsx`, `src/app/(app)/groups/{page.tsx,[groupId]/page.tsx}` | 5 ilustrasi + fallback; pilihan sampul tervalidasi (allow-list); kolom `cover_image_key`; fallback otomatis. |
| §5 | Mode demo | `src/lib/demo/fixtures.ts`, `src/components/app/{demo-groups,demo-mentors}.tsx`, `src/app/(app)/{groups,discover}/page.tsx`, `.env.example`, `docs/demo-mode.md` | Fixture statis berlabel `Contoh Demo`, digerbangi `NEXT_PUBLIC_DEMO_MODE`, tidak menulis DB. |
| §6 | Migrasi | `supabase/migrations/20261019160000_012_*.sql`, `supabase/reference/012_*.sql`, `supabase/migrations_bundle.sql` | Migrasi additive berikutnya, format timestamp CLI, mirror diperbarui. |

Tidak ada penghapusan/perubahan data lama. Tidak ada operasi destruktif.

---

## 2. Bug buat profil mentor + akar masalah

**Gejala:** pengguna tidak bisa membuat profil mentor meski memenuhi syarat;
form tampak gagal / status tidak konsisten.

**Akar masalah (dua hal):**

1. `upsertMentorProfile` memakai `upsert(... onConflict: "user_id")`. Migrasi
   `005_rls_policies.sql` hanya memberi `GRANT UPDATE` pada kolom
   `headline, expertise_summary, experience_years, is_accepting_bookings,
   updated_at` — **`user_id` tidak diberikan**. Postgres `ON CONFLICT DO UPDATE`
   mencoba menyentuh `user_id`, sehingga ditolak oleh hak kolom.
2. Bug validasi: `z.coerce.number()` mengubah `""` menjadi `0` dan memenangkan
   union, sehingga tahun pengalaman kosong tersimpan sebagai `0`.

**Perbaikan:**

- `update-first` lalu `insert` terpisah; retry update sekali saat
  `error.code === "23505"` (balapan). Tidak pernah memakai `onConflict`.
- `experienceYears` diubah menjadi
  `z.union([z.literal("").transform(() => null), z.coerce.number().int().min(0).max(60)]).optional()`.

**Alur status (konsisten dengan model data):**
buat profil → lengkapi info → unggah CV → ajukan verifikasi → menunggu keputusan.
Status: `not_submitted` (draft) → `pending` → `verified` / `rejected` /
`suspended`. Pengguna **tidak pernah** bisa menyetel `verified` sendiri (lihat §5
laporan test: update langsung → 403).

Bukti: `test-mentor-create.mjs` **11/11 PASS** (HTTP + DB).

---

## 3. Cara menyiapkan akun moderator

Tidak ada tombol "jadikan saya moderator" di UI. Promosi hanya lewat skrip ops
server-side:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY='<service-role-key>'
npm run set-moderator -- moderator.uji@example.com --role moderator
Remove-Item Env:\SUPABASE_SERVICE_ROLE_KEY
```

- Membaca `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
  dari env/`.env.local`; **tidak pernah mencetak rahasia**.
- Validasi peran: hanya `moderator` dan `admin`; `--remove` untuk mencabut;
  `--dry-run` untuk pratinjau; mempertahankan key `app_metadata` lain.
- Tidak bisa dipanggil dari browser; tidak dijalankan otomatis.
- Moderator **harus login ulang / refresh sesi** agar klaim `role` masuk ke JWT.
- Detail: `docs/moderator-setup.md`.

Uji CLI: help exit 0; peran invalid ditolak; target non-UUID/email ditolak;
tanpa secret berhenti dengan pesan; kunci salah → 401/403 jelas. **(Diuji tanpa
kunci service-role nyata — sesuai larangan.)**

---

## 4. Lokasi & kebijakan keamanan CV

- **Bucket:** `mentor-cvs`, **privat** (`public=false`), limit 5 MiB,
  `allowed_mime_types=['application/pdf']`.
- **Metadata:** tabel `public.mentor_verification_documents` (PK `mentor_id`) —
  terpisah dari profil publik mentor, jadi tidak pernah terekspos lewat API
  profil mentor publik.
- **RLS metadata:** SELECT = pemilik **atau** `is_moderator()`; INSERT/UPDATE/
  DELETE hanya pemilik. `REVOKE ALL FROM anon`.
- **Kebijakan Storage:** `mentor_cvs_insert` (folder = `auth.uid()`),
  `mentor_cvs_select` (folder sendiri **atau** moderator), `mentor_cvs_delete`
  (folder sendiri), **tanpa** policy UPDATE.
- **Akses bukti:** hanya via signed URL berumur **60 detik**
  (`src/app/(app)/cv/[mentorId]/route.ts`, dicek ulang RLS owner/moderator).
  Tidak pernah ada URL CV publik.
- **Guard backend:** RPC `submit_mentor_verification()` menolak `cv_missing`;
  `review_mentor_verification()` menolak `verified` bila CV tidak ada.
- **Constraint path:** `storage_path LIKE mentor_id || '/%'` → metadata tidak
  bisa menunjuk berkas milik orang lain. Format PDF (MIME + ekstensi) 5 MB
  divalidasi **klien dan server**.
- Age gate tetap: `under_18` dan `not_set` tetap dilarang mentoring.

---

## 5. Migrasi baru

**`20261019160000_012_cv_documents_and_group_covers.sql`** (additive):

- Tabel `mentor_verification_documents` + trigger `updated_at`.
- Bucket privat `mentor-cvs` + 3 kebijakan Storage (insert/select/delete).
- `CREATE OR REPLACE` `submit_mentor_verification()` (guard `cv_missing`) dan
  `review_mentor_verification(uuid,text)` (guard `cv_missing` untuk `verified`).
- Kolom `study_groups.cover_image_key` + CHECK allow-list
  (`programming, mathematics, language, science, design`; NULL = fallback).

Mirror: `supabase/reference/012_cv_documents_and_group_covers.sql` dan
`supabase/migrations_bundle.sql` (keduanya diperbarui; urutan dipertahankan).

**Variabel lingkungan baru:**

| Variabel | Dipakai oleh | Wajib |
|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | Mode demo (§5) | Tidak (default nonaktif) |
| `SUPABASE_SERVICE_ROLE_KEY` | Skrip `set-moderator` (§3) | Hanya untuk skrip ops |

`.env.example` diperbarui. **Pemilik perlu:**
1. Menerapkan migrasi 012 ke remote (`supabase db push` atau jalankan file).
2. Merilis kode bersamaan.
3. (Opsional) mengisi `SUPABASE_SERVICE_ROLE_KEY` di lingkungan ops — bukan di klien.

---

## 6. Mode demo

- Diaktifkan dengan `NEXT_PUBLIC_DEMO_MODE=true`; nilai selain `"true"`
  dianggap nonaktif (default). Dokumentasi: `docs/demo-mode.md`.
- Muncul di `/groups`, `/discover?tab=kelompok`, `/discover?tab=mentor`, dengan
  label tebal `Contoh Demo`.
- Kelompok contoh: nama, deskripsi, topik, sampul, jumlah anggota, agenda.
  Kartu mentor contoh: keahlian, deskripsi singkat, topik, info layanan.
- **Keamanan:** fixture statis (tidak ditulis ke DB), tidak menimpa data nyata,
  mentor demo **tidak menerima booking nyata** dan **tidak mengklaim
  terverifikasi**. Bila tidak ada data nyata, kartu demo tetap tampil + CTA
  membuat konten nyata. Pengguna tetap bisa membuat kelompok/profil mentor asli.

---

## 7. Hasil test wajib (§7)

Metode: **DB-nyata** (RPC/RLS via role `authenticated` + klaim JWT lokal),
**HTTP-nyata** (request ke dev server), atau **BROWSER** (interaksi visual).

| # | Test wajib | Metode | Hasil | Bukti ringkas |
|---|-----------|--------|-------|---------------|
| 1 | Pengguna bisa membuat + menyimpan profil mentor | HTTP/DB | **PASS** | `test-mentor-create.mjs` 11/11 |
| 2 | Tidak bisa submit verifikasi sebelum unggah CV | DB/HTTP | **PASS** | RPC `submit` → `cv_missing`; `MentorVerificationSubmit` disabled tanpa CV |
| 3 | Pengguna lain tidak bisa membaca CV | DB | **PASS** | metadata+objek `n=0` untuk outsider; `n=1` untuk owner/moderator; path spoof ditolak |
| 4 | Moderator sah dapat meninjau CV & memutuskan status | DB | **PASS** | approve tanpa CV → `cv_missing`; dengan CV → `verified`; status tersimpan |
| 5 | Pengguna biasa tidak bisa self-promote / self-verify | HTTP/DB | **PASS** | PATCH `verification_status` → 403; RPC review → `not_moderator`; `is_moderator` hanya true dengan klaim role |
| 6 | Kelompok baru dengan sampul valid | HTTP/DB | **PASS** | `test-groups-cover.mjs`; DB menyimpan `science`; sampul invalid → CHECK gagal |
| 7 | Kelompok tanpa sampul → gambar fallback | HTTP/DB | **PASS** | `cover_image_key=NULL` → `default.svg` tampil |
| 8 | Data demo berlabel & tidak bisa dipakai booking nyata | HTTP/DB | **PASS** | `test-demo.mjs` 17/17; 0 fixture di DB; kartu tanpa tautan booking; mentor demo tak terverifikasi |
| 9 | Booking berbayar & mentoring under-18 tetap diblokir | DB | **PASS** | `paid_booking_not_enabled`; `under_18`/`not_set` → `mentoring_not_allowed_for_age`; insert langsung ditolak |
| 10 | Lint, typecheck, build, test lolos | Tooling | **PASS** | `npm run lint` bersih; `tsc --noEmit` bersih; `npm run build` sukses; semua harness hijau |

**Harness DB lengkap (lingkungan lokal dengan migrasi 012): 24/24 PASS.**
**Harness HTTP: mentor 11/11, groups-cover 12/12, demo 17/17 (on) / 9/9 (off).**

### Yang TIDAK bisa diklaim sebagai hasil test

| Area | Metode | Status | Alasan |
|------|--------|--------|--------|
| Interaksi browser / visual / console | BROWSER | **BLOCKED** | Tidak ada browser/Playwright/Puppeteer. Perlu checklist manual (buka `/mentor`, unggah PDF, cek tombol disabled, buka `/cv/...`). |
| UI unggah CV end-to-end di browser dengan 012 aktif di remote | BROWSER/HTTP | **BLOCKED untuk remote** | 012 belum diterapkan ke remote (sesuai larangan). Di lokal sudah diverifikasi di level DB/HTTP. |
| Deteksi reverse-block (`user_blocks`) | DB | **BLOCKED** | RLS hanya mengekspos baris sendiri; butuh fungsi/trigger — menunggu persetujuan pemilik. |
| Verifikasi skrip `set-moderator` dengan kunci nyata | Ops | **TIDAK DIJALANKAN** | Tidak ada service-role key; dilarang menjalankan tanpa instruksi eksplisit. Logika CLI diuji tanpa kunci. |

Perbedaan: hasil **PASS DB** = perilaku database/RPC/Storage nyata;
**PASS HTTP** = server action / route nyata; baris **BLOCKED** tidak diklaim lulus.

---

## 8. Blocker yang benar-benar butuh tindakan pemilik

1. **Terapkan migrasi 012** ke database remote, lalu rilis kode bersamaan —
   tanpa ini fitur CV dan persetujuan mentor tetap nonaktif (UI menampilkan
   pesan "migrasi belum diterapkan").
2. **Putuskan lingkungan uji** untuk test browser: sediakan browser/Playwright
   agar checklist interaksi (unggah CV, tombol disabled, signed URL) dapat
   dieksekusi penuh.
3. **Reverse-block** (`user_blocks`): setujui pembuatan fungsi/trigger bila
   deteksi dua arah diperlukan.
4. (Opsional) sediakan `SUPABASE_SERVICE_ROLE_KEY` di lingkungan ops bila ingin
   skrip moderator diuji dengan kunci nyata.

---

## Berkas referensi penting

- `src/lib/mentor/actions.ts`, `src/lib/validation/mentor.ts`
- `src/lib/mentor/cv.ts`, `src/lib/data/{mentor-self,moderation,groups}.ts`
- `src/components/app/{mentor-cv-card,mentor-verification-submit,moderator-verification-actions,demo-groups,demo-mentors}.tsx`
- `src/app/(app)/cv/[mentorId]/route.ts`, `src/app/(app)/{mentor,moderator,groups,discover}/page.tsx`
- `scripts/set-moderator.mjs`, `docs/moderator-setup.md`, `docs/demo-mode.md`
- `public/images/group-covers/*.svg`
- `supabase/migrations/20261019160000_012_cv_documents_and_group_covers.sql` (+ reference + bundle)
