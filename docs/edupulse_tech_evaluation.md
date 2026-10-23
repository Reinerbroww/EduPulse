# EduPulse — Evaluasi Tech Stack & Arsitektur
**Tanggal:** 13 Oktober 2026  
**Status:** Evaluasi Pra-Implementasi — Menunggu Approval  
**Referensi:** coldstart.md v1.0 + STEP 2–5 (semua APPROVED)

---

## 1. Ringkasan Pemahaman EduPulse

EduPulse adalah platform web kolaborasi belajar dengan **5 kelompok fitur MVP**:

1. **Smart Study Matching** — rekomendasi berbasis aturan (rule-based), bukan ML
2. **Study Groups & Shared Goals** — kelompok belajar dengan agenda, checklist, catatan
3. **Mentor Discovery & Booking** — penemuan dan pemesanan mentor terverifikasi
4. **Structured Mentoring & Learning Progress** — ringkasan sesi, feedback, progres tujuan
5. **Trust, Safety & Service Management** — blokir, laporan, verifikasi manual, privasi

**Batasan MVP yang kritis:**
- Tidak ada live chat / video conference internal
- Matching bukan ML — aturan yang dapat dijelaskan
- Pembayaran manual-only; paid booking diblokir hingga pilot disepakati
- Verifikasi mentor dilakukan manual oleh admin
- Perlindungan under-18 wajib sebelum mentoring diaktifkan untuk kelompok tersebut
- 23 tabel PostgreSQL yang telah disetujui
- 18 halaman wireframe yang telah disetujui
- Visual: Warm, Collaborative & Trustworthy (Deep Teal #246B60, Amber #F2B84B, Off-white #F8FAF8)

---

## 2. Tabel Fitur MVP vs Dukungan Tech Stack

| Fitur MVP | Komponen Stack | Dukungan | Catatan |
|---|---|:---:|---|
| Auth (email/password, session) | Supabase Auth | ✅ Penuh | Sudah include JWT, session management, email confirm |
| Profil & onboarding | Next.js + Supabase | ✅ Penuh | Server Actions / API Routes untuk mutasi data |
| Rule-based matching | Next.js API Routes / Supabase RPC | ✅ Penuh | Logika matching di server (PostgreSQL function atau API Route) |
| Study Groups & members | PostgreSQL + RLS | ✅ Penuh | Transaksi atomik didukung |
| Study Session Workspace (checklist, notes) | Supabase Realtime (opsional) | ✅ Cukup | Tanpa real-time pun bisa; polling atau manual refresh |
| Mentor Discovery + filter/search | PostgreSQL + Next.js | ✅ Penuh | Full-text search via `pg_trgm` atau `ILIKE` |
| Mentor Booking (status workflow) | PostgreSQL + RLS + API Routes | ✅ Penuh | Slot locking dengan transaksi PostgreSQL |
| Payment manual (pencatatan referensi) | PostgreSQL (`booking_payments`) | ✅ Penuh | Tidak butuh payment gateway |
| Session Summary & Feedback | PostgreSQL + Next.js | ✅ Penuh | CRUD biasa |
| Learning Progress tracking | PostgreSQL + Next.js | ✅ Penuh | Riwayat dari `learning_goal_updates` |
| Blokir & laporan | PostgreSQL + RLS | ✅ Penuh | Blokir harus dicek di semua query interaksi |
| Admin dashboard (verifikasi mentor) | Next.js Route Groups | ⚠️ Perlu diputuskan | Apakah ada halaman admin di Next.js atau pakai Supabase Studio? |
| Responsif desktop + mobile | Tailwind CSS | ✅ Penuh | Utility-first, mudah responsive |
| File upload (avatar, portofolio mentor) | Supabase Storage | ✅ Penuh | Bucket dengan RLS policy |
| Deployment | Vercel | ✅ Penuh | Native Next.js deployment |
| RLS & keamanan akses data | Supabase RLS | ✅ Penuh | Wajib diaktifkan di semua tabel |

**Kesimpulan bagian ini:** Stack mendukung **seluruh fitur MVP** yang tertuang dalam coldstart.md.

---

## 3. Rancangan Arsitektur yang Direkomendasikan

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER / CLIENT                        │
│  React Components (Next.js App Router)                          │
│  Tailwind CSS  ·  TypeScript                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                     NEXT.JS (Vercel)                            │
│                                                                 │
│  ┌──────────────────┐  ┌───────────────────┐                   │
│  │   App Router     │  │   Server Actions  │                   │
│  │   (RSC + Pages)  │  │   / API Routes    │                   │
│  └──────────────────┘  └────────┬──────────┘                   │
│         │                       │ supabase-js (service_role)    │
│         │                       │ ← rahasia server, tidak       │
│         │                       │   dikirim ke browser          │
└─────────┼───────────────────────┼─────────────────────────────-─┘
          │                       │
          │ supabase-js           │
          │ (anon key + JWT)      │
          │ ← RLS berlaku         │
┌─────────▼───────────────────────▼─────────────────────────────-─┐
│                        SUPABASE                                 │
│                                                                 │
│  ┌───────────────┐  ┌────────────┐  ┌──────────────────────┐   │
│  │  Supabase Auth│  │ PostgreSQL │  │   Supabase Storage   │   │
│  │  (JWT, email) │  │ (23 tabel) │  │   (avatar, file)     │   │
│  └───────────────┘  │ + RLS      │  └──────────────────────┘   │
│                     │ + Functions│                              │
│                     └────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### Pola Kunci Arsitektur

**A. Dua jalur akses Supabase:**
- **Anon key + JWT (client-side):** untuk read data yang diizinkan RLS — profil publik, topik, listing mentor terverifikasi. RLS sebagai garda pertama.
- **Service role key (server-side only):** untuk operasi privileged — mengubah `verification_status` mentor, memverifikasi pembayaran, moderasi laporan. Kunci ini **tidak boleh muncul di browser**.

**B. Matching engine di server:**
- Logika matching (topik, skill level, jadwal, tujuan) dijalankan di Next.js API Route atau PostgreSQL Function.
- Tidak ada tabel ML. Skor dapat dijelaskan dan diaudit.

**C. Transaksi atomik untuk booking:**
- Pembuatan booking + update slot status (`reserved`) harus dalam satu transaksi PostgreSQL untuk mencegah double booking.
- Diimplementasikan via Supabase RPC (PostgreSQL function) atau Server Action dengan `BEGIN/COMMIT`.

**D. Admin panel:**
- Verifikasi mentor dan moderasi laporan membutuhkan antarmuka admin terbatas.
- **Rekomendasi:** buat route group `/app/admin/` di Next.js dengan middleware proteksi peran — ini perlu keputusan (lihat bagian Risiko).

**E. Realtime (opsional untuk MVP):**
- Supabase Realtime tersedia untuk update status booking/request secara live.
- Tidak wajib untuk MVP — polling atau reload manual sudah cukup sesuai scope yang disetujui.

---

## 4. Evaluasi Database, Autentikasi, dan Keamanan

### 4.1 Database

**Kompatibilitas penuh.** Seluruh 23 tabel yang disetujui dapat diimplementasikan di PostgreSQL/Supabase tanpa perubahan model data:

| Aspek Schema | Status |
|---|---|
| UUID primary keys | ✅ Native PostgreSQL |
| `timestamptz` | ✅ Native PostgreSQL |
| `CHECK` constraints (harga, rating, jam, dll.) | ✅ Native PostgreSQL |
| Composite primary keys (`profile_topics`, `user_blocks`, dll.) | ✅ Native PostgreSQL |
| `ON DELETE CASCADE / SET NULL` | ✅ Native PostgreSQL |
| `UNIQUE` constraint (`booking_id` di `booking_payments`) | ✅ Native PostgreSQL |
| Enum-like values via CHECK | ✅ Atau gunakan PostgreSQL ENUM — pilihan perlu diputuskan |
| Snapshot harga di `mentor_bookings` | ✅ Kolom biasa, tidak butuh trigger wajib |
| Indeks yang disarankan (STEP 4) | ✅ Dapat dibuat saat migration |

**Satu hal teknis yang perlu diputuskan:** apakah status field (seperti `verification_status`, `status` booking) menggunakan `text + CHECK` atau `PostgreSQL ENUM`? Keduanya valid; ENUM lebih ketat tapi kurang fleksibel saat migration.

### 4.2 Autentikasi

Supabase Auth menangani:
- Registrasi dan login via email/password
- Session JWT yang otomatis diperbarui
- Email konfirmasi akun
- Reset password
- `auth.users.id` → `profiles.id` (one-to-one, sudah sesuai schema STEP 4)

**Pola yang direkomendasikan:**
1. Saat user mendaftar, trigger atau webhook Supabase membuat baris di `profiles` dan `user_safety_settings`.
2. `onboarding_completed = false` sampai user menyelesaikan onboarding.
3. Middleware Next.js memeriksa sesi Supabase — redirect ke login jika tidak ada, redirect ke onboarding jika belum selesai.

### 4.3 Row Level Security (RLS)

RLS adalah **komponen wajib** sesuai STEP 4. Pola implementasi:

| Tabel Sensitif | Policy Kritis |
|---|---|
| `user_safety_settings` | Hanya `auth.uid() = user_id` yang bisa baca/tulis — admin via service_role |
| `mentor_profiles.verification_status` | `UPDATE` policy: hanya service_role (admin) |
| `booking_payments.status` | `UPDATE verified/rejected`: hanya service_role (verifier) |
| `user_reports.resolution_note` | `SELECT`: hanya service_role (moderator) |
| `booking_payments.review_note` | `SELECT`: hanya service_role |
| Semua tabel | RLS wajib diaktifkan sebelum tabel diekspos ke client |

**Prinsip keamanan yang dipertahankan:**
- Validasi blokir (`user_blocks`) di level query/function server, bukan hanya UI
- Slot booking dikunci dengan transaksi, bukan hanya cek di aplikasi
- Status verifikasi dan pembayaran tidak bisa diubah sendiri oleh pihak yang diverifikasi

### 4.4 Perlindungan Under-18

Sesuai coldstart.md: **interaksi mentoring untuk `under_18` harus dinonaktifkan via RLS/policy hingga aturan akses, persetujuan, dan moderasi ditetapkan.** Ini bukan fitur opsional — ini syarat peluncuran.

---

## 5. Akun, Konfigurasi, dan Environment Variables

### 5.1 Akun yang Perlu Disiapkan

| Layanan | Kebutuhan | Biaya |
|---|---|---|
| **Supabase** | Buat project baru (1 project = 1 database) | Free tier cukup untuk dev/staging |
| **Vercel** | Connect repository GitHub | Free tier cukup untuk MVP |
| **GitHub** | Repository untuk version control | Free |
| **Domain (opsional)** | Custom domain untuk production | Berbayar, opsional untuk MVP awal |

### 5.2 Environment Variables yang Diperlukan

**Catatan: jangan bagikan nilai aktual melalui chat. Simpan di `.env.local` (development) dan Vercel dashboard (production).**

```
# Supabase — WAJIB
NEXT_PUBLIC_SUPABASE_URL=          # URL project Supabase (aman di client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Anon key Supabase (aman di client, RLS berlaku)
SUPABASE_SERVICE_ROLE_KEY=         # Service role key (RAHASIA — server only!)

# App
NEXT_PUBLIC_APP_URL=               # URL aplikasi (untuk callback, email link)

# Opsional: email provider jika pakai custom SMTP
# SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
```

**Aturan kritis:**
- `SUPABASE_SERVICE_ROLE_KEY` **tidak boleh** mempunyai prefix `NEXT_PUBLIC_` — ini akan mengeksposnya ke browser
- Variabel server-only hanya diakses di Server Actions, API Routes, dan `middleware.ts`

### 5.3 Konfigurasi Supabase yang Perlu Disiapkan

1. **Auth settings:** aktifkan email confirmation, set redirect URL ke domain yang benar
2. **RLS:** aktifkan di setiap tabel sebelum ekspos ke client
3. **Storage buckets:** buat bucket untuk avatar dan file mentor (dengan RLS bucket policy)
4. **Database:** jalankan migration SQL dari schema STEP 4 yang sudah disetujui
5. **Supabase Studio:** untuk operasi admin awal (verifikasi mentor, moderasi) sebelum admin panel tersedia

---

## 6. Dependensi yang Direkomendasikan

### 6.1 Wajib (Core)

| Package | Versi | Fungsi |
|---|---|---|
| `next` | 14.x atau 15.x | Framework utama |
| `react` + `react-dom` | Sesuai Next.js | UI |
| `typescript` | 5.x | Bahasa |
| `tailwindcss` + `postcss` + `autoprefixer` | 3.x | Styling — sesuai keputusan stack |
| `@supabase/supabase-js` | 2.x | Client Supabase |
| `@supabase/ssr` | Latest | Helper Next.js App Router + middleware untuk session |

> **Catatan penting:** `@supabase/auth-helpers-nextjs` sudah deprecated. Gunakan `@supabase/ssr` yang merupakan paket resmi terbaru untuk Next.js App Router.

### 6.2 Sangat Direkomendasikan

| Package | Fungsi | Alasan |
|---|---|---|
| `zod` | Schema validation | Validasi form dan input server-side; konsisten antara client dan server |
| `react-hook-form` | Form management | Mengelola form onboarding, booking, profile — lebih ringan dari Formik |
| `@tanstack/react-query` | Server state & caching | Data fetching yang efisien; menangani loading/error/refetch dengan baik |
| `date-fns` atau `dayjs` | Date formatting | Untuk `timestamptz`, slot jadwal, dan tampilan zona waktu pengguna |
| `lucide-react` | Icon library | Konsisten dengan Tailwind; tree-shakeable |

### 6.3 Opsional (Pertimbangkan Sesuai Kebutuhan)

| Package | Fungsi | Kapan Gunakan |
|---|---|---|
| `@supabase/realtime-js` | Realtime updates | Jika diperlukan live update status booking/request — tidak wajib MVP |
| `next-intl` | Internationalization | Jika multi-bahasa diperlukan di masa depan |
| `sharp` | Image optimization | Untuk resize avatar sebelum upload |
| `@radix-ui/react-*` | Accessible UI primitives | Jika butuh komponen accessible (dialog, dropdown, dll.) tanpa full component library |
| `vitest` + `@testing-library/react` | Testing | Untuk unit test komponen dan API routes |

### 6.4 Yang Tidak Perlu (Sesuai Scope MVP)

- ❌ Stripe / Midtrans / payment SDK — pembayaran manual, tidak perlu gateway
- ❌ Socket.io / Ably — tidak ada live chat internal
- ❌ TensorFlow.js / ML library — matching rule-based, bukan ML
- ❌ Prisma / Drizzle ORM — Supabase client cukup; ORM menambah kompleksitas di atas Supabase

---

## 7. Risiko Teknis dan Hal yang Perlu Diputuskan

### 7.1 Risiko Teknis

| # | Risiko | Level | Mitigasi |
|---|---|:---:|---|
| R1 | **Slot booking race condition** — dua user booking slot yang sama secara bersamaan | 🔴 Tinggi | Wajib gunakan PostgreSQL transaction / `SELECT FOR UPDATE` / advisory lock di Supabase RPC |
| R2 | **RLS terlupa/salah konfigurasi** — data sensitif bocor | 🔴 Tinggi | Test dengan minimal 2 akun berbeda sebelum launch; tulis RLS test dengan `supabase test db` |
| R3 | **`user_blocks` tidak dicek di semua query** — pengguna yang diblokir masih muncul | 🟡 Sedang | Buat helper function server-side; gunakan view atau RPC yang selalu menyertakan blokir check |
| R4 | **`under_18` akses mentoring** — fitur dibuka sebelum kebijakan siap | 🔴 Tinggi | RLS policy eksplisit: `age_band = 'under_18'` tidak bisa buat/terima booking mentor |
| R5 | **Status verifikasi bisa diubah sendiri** — mentor mengubah statusnya sendiri | 🔴 Tinggi | Policy RLS: UPDATE pada `verification_status` hanya untuk service_role |
| R6 | **Status paid booking otomatis "lunas"** — sebelum diverifikasi manual | 🔴 Tinggi | Tidak ada path kode yang mengubah `booking_payments.status = 'verified'` tanpa service_role |
| R7 | **SUPABASE_SERVICE_ROLE_KEY bocor ke client** | 🔴 Tinggi | Pastikan tidak ada prefix `NEXT_PUBLIC_`; review di code review |
| R8 | **Performa query matching** — query kompleks melibatkan topik + jadwal + blokir | 🟡 Sedang | Index yang direkomendasikan di STEP 4 wajib dibuat; monitor query plan |
| R9 | **Supabase Free Tier limits** — 500MB DB, 1GB storage, 50K MAU | 🟢 Rendah | Cukup untuk MVP; perlu upgrade saat scaling |
| R10 | **Vercel Cold Start** — API Routes lambat pertama kali | 🟢 Rendah | Gunakan Edge Runtime untuk middleware; API Routes toleran untuk MVP |

### 7.2 Keputusan yang Masih Perlu Dikonfirmasi Sebelum Implementasi

| # | Keputusan | Implikasi Jika Tidak Diputuskan |
|---|---|---|
| D1 | **Admin panel:** apakah admin menggunakan Supabase Studio saja (untuk MVP awal) atau perlu halaman `/admin` di Next.js? | Jika butuh Next.js admin panel, perlu mendesain role system dan route protection |
| D2 | **Tipe field status:** `text + CHECK constraint` atau `PostgreSQL ENUM`? | ENUM lebih ketat tapi kurang fleksibel saat migration; perlu dipilih sebelum migration pertama |
| D3 | **Trigger otomatis untuk `profiles`:** apakah baris `profiles` dibuat via Supabase trigger saat `auth.users` dibuat, atau via API Route setelah register? | Trigger lebih andal (tidak bisa di-skip); API Route lebih mudah diuji |
| D4 | **`updated_at` automation:** apakah menggunakan trigger `moddatetime` (Supabase extension) atau diisi manual di aplikasi? | Trigger lebih konsisten; perlu aktivasi extension |
| D5 | **Full-text search untuk mentor:** cukup dengan `ILIKE` / `pg_trgm`, atau butuh Supabase Vector (pgvector)? | `pg_trgm` cukup untuk MVP; vector search berlebihan dan di luar scope |
| D6 | **Upload file (avatar/portofolio mentor):** Supabase Storage atau layanan lain? | Supabase Storage sudah terintegrasi dan paling sederhana |
| D7 | **Zona waktu pengguna:** apakah `timezone` di `profiles` ditentukan otomatis (via browser API) atau dipilih manual pengguna? | Berpengaruh pada UX onboarding dan tampilan jadwal |
| D8 | **Kebijakan under-18:** aturan akses, persetujuan orang tua, dan moderasi harus ditetapkan sebelum fitur mentoring dibuka — ini **bukan keputusan teknis murni** | Tanpa ini, fitur mentoring tidak boleh diaktifkan untuk `age_band = 'under_18'` |
| D9 | **Prosedur pilot pembayaran:** metode, pihak yang memverifikasi, batas waktu, kebijakan pembatalan — harus ditetapkan sebelum `paid` booking diaktifkan | Tanpa ini, semua booking berbayar tetap diblokir di level aplikasi |

---

## 8. Rekomendasi Langkah Setup Berikutnya

> **CATATAN:** Bagian ini hanya gambaran urutan kerja — belum ada yang dikerjakan sampai Anda memberikan approval.

```
STEP 6 (ketika Anda meminta dimulai):

[ ] 6.1  Setup Supabase Project
          - Buat project di supabase.com
          - Catat SUPABASE_URL dan ANON_KEY (aman dipublikasikan)
          - Simpan SERVICE_ROLE_KEY (rahasia)

[ ] 6.2  Setup Next.js Project
          - npx create-next-app@latest ./ dengan TypeScript + Tailwind
          - Konfigurasi @supabase/ssr untuk App Router

[ ] 6.3  Database Migration
          - Terjemahkan schema STEP 4 menjadi SQL migration
          - Aktifkan extension: uuid-ossp, pg_trgm, moddatetime (jika D4 disetujui)
          - Jalankan migration di Supabase
          - Seed data awal: katalog topics

[ ] 6.4  RLS Policies
          - Tulis dan test RLS untuk semua 23 tabel
          - Test dengan minimal 2 akun berbeda
          - Validasi: under_18 tidak bisa akses mentoring booking

[ ] 6.5  Auth Flow
          - Implementasi register, login, logout, reset password
          - Trigger/handler untuk auto-create profiles + user_safety_settings

[ ] 6.6  Halaman P0 (urutan per wireframe STEP 3)
          - Landing Page → Sign Up / Login → Onboarding → Dashboard
          - Learning Goals → Discover/Recommendations
          - Partner/Group Details → Request Status
          - Mentor Directory → Mentor Profile → Booking Review
          - Study Session Workspace → Mentoring Session Details
          - Session Summary & Feedback → Learning Progress
          - Safety / Report / Block → Profile & Settings

[ ] 6.7  Halaman P1 (sebelum paid mentoring diaktifkan)
          - Payment Instructions
          - Admin: verifikasi mentor, moderasi laporan
```

---

## Kesimpulan Akhir

> **"Apakah tech stack ini sudah cukup untuk mendukung EduPulse sesuai `coldstart.md`?"**

**Ya — tech stack yang dipilih sudah cukup dan sangat tepat untuk EduPulse MVP.**

Berikut alasannya:

1. **Next.js + TypeScript + Tailwind CSS** memberikan fondasi yang solid untuk 18 halaman yang disetujui, dengan dukungan SSR/RSC untuk keamanan (server-side logic tidak bocor ke browser) dan responsivitas yang baik.

2. **Supabase (PostgreSQL + Auth + RLS + Storage)** adalah pilihan yang paling efisien untuk EduPulse karena menggabungkan database, autentikasi, keamanan akses data, dan file storage dalam satu ekosistem — yang langsung menjawab kompleksitas 23 tabel, relasi, dan kebijakan akses yang disetujui.

3. **Vercel** adalah platform deployment paling native untuk Next.js, dengan zero-config untuk App Router.

**Dua kendala yang harus diselesaikan sebelum implementasi dimulai:**

| Prioritas | Kendala |
|:---:|---|
| 🔴 Wajib | **D8 — Kebijakan under-18:** aturan akses mentoring untuk pengguna di bawah umur harus ditetapkan. Ini syarat hukum/produk, bukan hanya teknis. |
| 🔴 Wajib | **D9 — Prosedur pilot pembayaran:** metode, verifikator, dan kebijakan paid booking harus disepakati sebelum fitur berbayar diaktifkan. |

**Keputusan teknis yang bisa diputuskan lebih awal (D1–D7) akan memengaruhi detail implementasi** tetapi tidak memblokir dimulainya STEP 6.
