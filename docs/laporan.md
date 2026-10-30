# Laporan EduPulse — Apa Saja yang Sudah Ada di Website

Tanggal: 19 Oktober 2026
Cakupan: aplikasi web `edupulse-app` (Next.js + Supabase) — halaman, fitur, alur, basis data, dan aturan bisnis.
Status: build, lint, dan typecheck **PASS**; 28 halaman; basis data remote sudah dimigrasikan (001–011).

> Ringkasan singkat: EduPulse adalah platform belajar bersama. Pengguna membuat profil belajar, menetapkan tujuan, mencari **partner belajar**, **kelompok belajar**, dan **mentor terverifikasi**, lalu menjalankan sesi, mencatat ringkasan, memantau progres, serta memakai fitur keselamatan (blokir/lapor) dan moderasi. Pembayaran berbayar, mentoring di bawah 18 tahun, chat/video internal, dan pembayaran otomatis **sengaja dinonaktifkan** pada tahap MVP ini.

---

## 1. Teknologi & Konfigurasi

- Framework: **Next.js 16.4.0** (App Router, Turbopack).
- Bahasa: **TypeScript** (strict) + **React 19**.
- Styling: **Tailwind CSS v4** dengan token tema khusus (mis. `--color-canvas`, `--color-surface`, `--color-ink`, `--color-muted`, `--color-primary`, `--color-danger`).
- Validasi: **Zod** (di `src/lib/validation/*`).
- Backend: **Supabase** (Postgres + Auth + RLS), diakses lewat `@supabase/ssr`.
- Middleware: Next 16 memakai **`src/proxy.ts`** (menggantikan `middleware.ts`).
- Fitur Next yang aktif: `cacheComponents: true` dan `partialPrefetching: true` (di `next.config.ts`).
- Folder aplikasi:
  - `src/app/(app)` — halaman yang butuh login (dibungkus `AppShell`).
  - `src/app/(auth)` — halaman autentikasi (login, daftar, reset, ubah sandi).
  - `src/app` — halaman publik (landing, error, 404) dan route handler `auth/confirm`.

### Pola render (Partial Prerender)
- Setiap halaman terautentikasi bersifat **`◐ Partial Prerender`**: shell statis + konten yang di-stream.
- `requireUser()` (`src/lib/auth/guards.ts`) memakai `await connection()` agar tidak memicu error prerender `Date.now()`.
- Setiap route punya `loading.tsx` yang memakai skeleton bersama `src/components/app/route-loading.tsx`.
- `AppShell` (`src/components/app/app-shell.tsx`) **sengaja sinkron** (tanpa baca cookie/DB) agar seluruh route tingkat atas tetap `◐` dan tidak jatuh menjadi `ƒ Dynamic`.

### Perlindungan rute (`src/lib/supabase/proxy.ts`)
- **Wajib login** (diredirect ke `/login?redirectTo=...`): `/dashboard`, `/onboarding`, `/goals`, `/discover`, `/requests`, `/groups`, `/sessions`, `/bookings`, `/mentor`, `/moderator`, `/profile`.
- **Pengguna yang sudah login** diredirect dari `/login`, `/signup`, `/reset-password` ke `/dashboard`.
- Otorisasi detail tetap di **RLS** dan di setiap Server Action.

---

## 2. Peta Halaman (28 rute)

### Publik
| Rute | Isi |
|---|---|
| `/` | Landing: hero, 3 kartu manfaat, 3 langkah cara kerja, footer. Tombol "Mulai belajar" & "Saya sudah punya akun". |
| `/login` | Form masuk (email + kata sandi). |
| `/signup` | Form daftar (nama tampilan + email + kata sandi). |
| `/reset-password` | Form minta tautan reset kata sandi. |
| `/update-password` | Form menetapkan kata sandi baru (+ konfirmasi). |
| `/auth/confirm` | Route handler untuk konfirmasi email/OTP Supabase. |
| `/auth/error` | Halaman error autentikasi. |
| `/_not-found` | Halaman 404 kustom (`src/app/not-found.tsx`). |

### Terautentikasi
| Rute | Isi |
|---|---|
| `/onboarding` | Form profil belajar lengkap (nama, jenjang, kelompok usia, visibilitas, zona waktu, topik + tingkat). |
| `/dashboard` | Ringkasan: statistik, sesi mentor mendatang, ringkas profil, peringatan onboarding/usia. |
| `/discover` | Jelajah 3 tab: **Partner**, **Kelompok**, **Mentor**. |
| `/discover/partners/[partnerId]` | Detail calon partner: topik, tujuan, ketersediaan, alasan kecocokan, kirim permintaan, panel keselamatan. |
| `/discover/mentors/[mentorId]` | Detail mentor: keahlian, status verifikasi, layanan, panel keselamatan. |
| `/discover/mentors/[mentorId]/book` | Form pengajuan sesi **gratis**; layanan berbayar diblokir dengan pesan eksplisit. |
| `/requests` | Permintaan partner masuk & keluar; terima/tolak/batalkan. |
| `/groups` | Kelompok saya + kelompok publik + form buat kelompok. |
| `/groups/[groupId]` | Detail kelompok: anggota, persetujuan permintaan gabung (pemilik), gabung/keluar, daftar sesi. |
| `/groups/[groupId]/sessions/new` | Form buat sesi belajar untuk kelompok. |
| `/sessions/[sessionId]` | Detail sesi: peserta, checklist, catatan (privat/dibagi). |
| `/goals` | Daftar tujuan belajar + form buat tujuan. |
| `/goals/[goalId]` | Halaman "Progres Belajar": bar progres, riwayat, form tambah update. |
| `/mentor` | **Ruang Mentor**: profil mentor, status verifikasi + ajukan, toggle menerima booking, CRUD layanan, CRUD slot ketersediaan. |
| `/bookings` | Daftar booking "sebagai pembelajar" dan "sebagai mentor". |
| `/bookings/[bookingId]` | Hub sesi: aksi status booking, konteks sesi, ringkasan sesi, umpan balik, panel keselamatan, tautan progres. |
| `/profile` | **Profil & Pengaturan**: informasi akun, pengelola jadwal (ketersediaan), daftar blokir, kartu Moderasi (khusus moderator). |
| `/moderator` | **Ruang Moderator**: antrean verifikasi mentor + antrean laporan pengguna. |

Navigasi utama (`src/components/app/nav-links.tsx`): Dashboard · Jelajahi · Permintaan · Kelompok · Tujuan · Mentor · Booking · Profil.

---

## 3. Detail Fitur per Area

### 3.1 Autentikasi
- Login (`src/app/(auth)/login`), Daftar (`signup`), Minta reset (`reset-password`), Tetapkan sandi baru (`update-password`).
- Validasi: email valid; kata sandi 8–72 karakter; konfirmasi sandi harus cocok; nama tampilan 2–60 karakter.
- Saat pengguna baru terdaftar, trigger basis data otomatis membuat baris `profiles` dan `user_safety_settings` (nama tampilan diturunkan dari metadata/email).

### 3.2 Onboarding (`/onboarding`)
Form awal yang mengaktifkan pencarian. Field:
- Nama tampilan, jenjang pendidikan (`school`/`university`/`independent`/`other`), kelompok usia (`under_18`/`18_or_over`/`not_set`).
- Visibilitas profil (`discoverable`/`private`), zona waktu.
- Topik (maks 20) + tingkat pemahaman (`beginner`/`intermediate`/`advanced`/`not_sure`).
Menyimpan ke `profiles`, `user_safety_settings`, dan `profile_topics` (mengganti topik lama).

### 3.3 Dashboard (`/dashboard`)
- Statistik: jumlah tujuan aktif, jumlah sesi mentoring mendatang, jumlah partner (saat ini 0/placeholder).
- Daftar sesi mentoring mendatang dengan badge status + tombol "Lihat sesi".
- Kartu ringkas profil belajar.
- Peringatan: onboarding belum selesai; akun **di bawah 18 tahun** (mentoring dinonaktifkan).
- Notifikasi sukses setelah pengajuan booking (`?booking=success`).

### 3.4 Pencocokan Partner & Keselamatan (`/discover`, tab Partner)
- **Pencocokan berbasis aturan (bukan ML)** — `listMatchCandidates` (`src/lib/data/partners.ts`) menghitung skor yang dapat dijelaskan atas: kesamaan topik, tujuan terbuka, dan tumpang-tindih ketersediaan.
- **Tidak menampilkan persentase**; hanya menampilkan daftar **alasan kecocokan** yang bisa dibaca manusia.
- Hanya profil `discoverable` dan `onboarding_completed` yang muncul (dibatasi RLS + query).
- Detail partner: topik, tujuan terbuka, ketersediaan, alasan kecocokan, form kirim permintaan, dan panel keselamatan.
- Permintaan partner (`/requests`): kirim, terima, tolak, batalkan. Aturan: tidak bisa ke diri sendiri, tidak duplikat, tidak ke pasangan yang diblokir.

### 3.5 Keselamatan & Privasi (Trust & Safety)
- **Blokir/Buka blokir** pengguna (`blockUser`/`unblockUser`); daftar blokir tampil di `/profile`.
- **Lapor pengguna** (`submitReport`) dengan alasan: pelecehan, profil menyesatkan, perilaku tidak aman, spam, masalah pembayaran, lainnya; opsional dikaitkan ke kelompok/sesi/booking.
- **Visibilitas profil**: `discoverable` vs `private`.
- **Gerbang usia**: fungsi `can_use_mentoring` hanya mengizinkan `age_band = '18_or_over'` (fail-closed; `under_18` dan `not_set` diblokir).
- Panel keselamatan (`SafetyPanel`) dapat dipakai ulang, muncul di detail partner, detail mentor, dan hub booking.

### 3.6 Kelompok Belajar (`/groups`)
- Buat kelompok: nama (3–80), deskripsi (≤1000), topik, tujuan, jumlah maksimum anggota (2–50), visibilitas (`public`/`invite_only`).
- Daftar "kelompok saya" dan "kelompok publik".
- Detail kelompok: daftar anggota, permintaan gabung (owner menyetujui/menolak), tombol gabung/keluar, daftar sesi, tautan buat sesi.
- Status anggota: `pending`/`active`/`rejected`/`left`; peran: `owner`/`moderator`/`member`.

### 3.7 Sesi Belajar (`/sessions/[sessionId]`, `/groups/[groupId]/sessions/new`)
- Buat sesi: judul (3–120), tujuan (≤1000), waktu mulai & selesai (selesai harus setelah mulai), tautan rapat eksternal (URL valid).
- Detail sesi: daftar peserta, **checklist** (tambah + toggle selesai), **catatan** (privat/dibagi).
- Akses checklist & catatan dibatasi untuk peserta sesi (selaras RLS `is_session_participant`).

### 3.8 Tujuan Belajar (`/goals`, `/goals/[goalId]`)
- Buat tujuan: judul (3–120), deskripsi (≤1000), topik, tanggal target, mode dukungan (`partner`/`group`/`mentor`/`any`), visibilitas (`private`/`matchable`).
- Halaman Progres: bar progres dari update milik pengguna, riwayat aktivitas (dengan label sumber sesi/booking), form tambah update (khusus pemilik), tampilan baca-saja untuk non-pemilik.
- Progres **dicatat oleh pengguna** (0–100%), bukan klaim penguasaan otomatis.

### 3.9 Mentor
- **Jelajah mentor** (`/discover`, tab Mentor): hanya mentor `verified` yang **menerima booking**.
- **Detail mentor**: keahlian, ringkasan, pengalaman, status verifikasi, daftar layanan, panel keselamatan.
- **Booking sesi gratis** (`.../book`): form pengajuan; layanan **berbayar diblokir** di UI + server action + RPC.
- **Ruang Mentor** (`/mentor`):
  - Buat/ubah profil mentor (headline, ringkasan keahlian, pengalaman, menerima booking atau tidak).
  - **Ajukan verifikasi** (status menjadi `pending`) — mentor **tidak bisa** menjadikan dirinya `verified` sendiri.
  - CRUD **layanan** mentor: judul, deskripsi, topik, durasi (15–480 menit), mode (`online_external`/`in_person`), tipe harga (`free`/`paid`), nominal, kebijakan pembatalan. Aturan: `free` ⇒ harga 0; `paid` ⇒ harga > 0.
  - CRUD **slot ketersediaan**: waktu mulai/selesai (selesai harus setelah mulai).

### 3.10 Booking & Siklus Status (`/bookings`, `/bookings/[bookingId]`)
- Daftar booking dipisah "sebagai pembelajar" dan "sebagai mentor", dengan peran + nama pihak lain.
- Aksi sesuai peran & status (`src/components/app/booking-actions.tsx`):
  - Mentor: konfirmasi/tolak (saat `pending`), selesaikan/batalkan (saat `confirmed`).
  - Pembelajar: batalkan.
  - Aksi destruktif meminta **alasan opsional**; kontrol menghilang pada status akhir.
- Status booking: `pending`, `confirmed`, `declined`, `cancelled_by_learner`, `cancelled_by_mentor`, `completed`, `no_show`.
- Transisi divalidasi oleh RPC `transition_booking_status` (008); slot ketersediaan dilepas kembali ke `available` saat sesi tidak jadi (tolak/batal).
- **Hub sesi** (`/bookings/[bookingId]`): konteks sesi, pihak-pihak, ringkasan sesi (lihat/ubah), umpan balik pembelajar (rating 1–5), panel keselamatan, tautan ke progres tujuan.
  - Ringkasan sesi: `summary` (wajib), `next_steps` (opsional). (Field wireframe "hal yang membingungkan" digabung ke ringkasan teks, tanpa menambah kolom.)
  - Umpan balik hanya oleh pembelajar untuk booking `completed`.

### 3.11 Profil & Pengaturan (`/profile`)
- Informasi akun (nama, jenjang, zona waktu, kelompok usia, visibilitas).
- **Jadwal belajar (pengelola ketersediaan)**: tambah jadwal per hari (Minggu–Sabtu), jam mulai/selesai, aktif/nonaktif, hapus. Jadwal ini **memengaruhi skor kecocokan partner**.
- Daftar pengguna yang diblokir + buka blokir.
- **Kartu Moderasi** (hanya muncul untuk moderator) → tautan ke `/moderator`.
- Tombol "Edit" → `/onboarding` untuk mengubah data dasar.

### 3.12 Moderasi (`/moderator`) — khusus moderator
- **Antrean verifikasi mentor**: setujui/tolak (`verified`/`rejected`/`suspended`).
- **Antrean laporan**: ubah status (`open`/`in_review`/`resolved`/`dismissed`) + catatan penyelesaian internal (menyimpan `reviewed_by`/`reviewed_at`).
- Non-moderator melihat keadaan "akses dibatasi".
- Keputusan moderator: identitas moderator = JWT `app_metadata.role` bernilai `admin` atau `moderator`.

---

## 4. Basis Data (23 Tabel)

Skema didefinisikan di `supabase/migrations/20261014160516_002_tables.sql`. Semua nilai kategoris memakai `text` + `CHECK`. Semua waktu memakai `timestamptz`.

1. **profiles** — id (= auth.users), display_name, avatar_url, bio, education_level, timezone, onboarding_completed, created_at, updated_at.
2. **user_safety_settings** — user_id (PK), age_band, profile_visibility, updated_at.
3. **topics** — id, name (unik), slug (unik), description, is_active, created_at.
4. **profile_topics** — (profile_id, topic_id) PK, interest_type, skill_level, created_at.
5. **user_availability** — id, user_id, day_of_week (0–6), start_time, end_time (end > start), is_active, created_at.
6. **learning_goals** — id, user_id, topic_id, title, description, target_date, support_modes, visibility, status, created_at, updated_at.
7. **study_partner_requests** — id, requester_id, recipient_id, learning_goal_id, message, status, responded_at, created_at, updated_at (tidak boleh diri sendiri).
8. **study_groups** — id, owner_id, learning_goal_id, topic_id, name, description, max_members (≥2), visibility, status, created_at, updated_at.
9. **study_group_members** — id, group_id, user_id, role, status, requested_at, responded_at, joined_at (unik per grup+user).
10. **study_sessions** — id, created_by, group_id, learning_goal_id, title, objectives, starts_at, ends_at (end > start), external_meeting_url, status, created_at, updated_at.
11. **study_session_members** — (session_id, user_id) PK, role, status, responded_at, created_at.
12. **study_session_checklist_items** — id, session_id, created_by, title, position, is_completed, completed_by, completed_at, created_at.
13. **study_session_notes** — id, session_id, author_id, content, is_shared, created_at, updated_at.
14. **mentor_profiles** — user_id (PK), headline, expertise_summary, experience_years, verification_status, verification_submitted_at, verification_reviewed_at, is_accepting_bookings, created_at, updated_at.
15. **mentor_services** — id, mentor_id, topic_id, title, description, duration_minutes, delivery_mode, price_type, price_amount, currency (IDR), cancellation_policy, is_active, created_at, updated_at (aturan harga free/paid).
16. **mentor_availability_slots** — id, mentor_id, starts_at, ends_at (end > start), status (`available`/`reserved`/`unavailable`), created_at, updated_at.
17. **mentor_bookings** — id, learner_id, mentor_id, service_id, availability_slot_id, learning_goal_id, snapshot layanan (judul/jadwal/harga), learner_objective, status, cancellation_reason, cancelled_at, created_at, updated_at (tidak boleh booking diri sendiri).
18. **booking_payments** — id, booking_id (unik), amount, currency, payment_instructions_snapshot, payment_reference, status, verified_by, verified_at, review_note (**internal**). *Alur berbayar dinonaktifkan (D9); hanya catatan manual, tanpa gateway.*
19. **mentoring_session_summaries** — id, booking_id (unik), author_id, summary, next_steps, created_at, updated_at.
20. **mentor_feedback** — id, booking_id (unik), learner_id, mentor_id, rating (1–5), comment, created_at, updated_at.
21. **learning_goal_updates** — id, learning_goal_id, author_id, source_study_session_id, source_mentor_booking_id, progress_percent (0–100), update_text, next_step, created_at.
22. **user_blocks** — (blocker_id, blocked_user_id) PK, created_at (tidak boleh memblokir diri sendiri).
23. **user_reports** — id, reporter_id, reported_user_id, study_group_id, study_session_id, mentor_booking_id, reason_code, details, status, reviewed_by, reviewed_at, resolution_note (**internal**), created_at.

**Indeks penting** (`003_indexes.sql`): pencarian topik/skill, ketersediaan, tujuan per status/topik, permintaan partner, anggota grup, sesi mendatang, layanan & slot mentor, booking per pihak, antrean laporan, dan indeks **GIN trigram** untuk pencarian teks pada `mentor_profiles` (headline & expertise_summary).

---

## 5. Fungsi & RPC Basis Data

**Helper (migrasi 004, `SECURITY DEFINER`)** — dipakai RLS agar tidak rekursif:
- `handle_new_user()` — trigger pembuatan profil + safety settings saat signup.
- `is_moderator()` — cek JWT `app_metadata.role ∈ {admin, moderator}`.
- `is_profile_discoverable(id)`, `can_use_mentoring(id)`, `is_group_member/is_group_owner(id)`, `is_session_participant/is_session_organizer(id)`, `is_verified_mentor(id)`, `owns_goal(id)`, `is_booking_party/is_booking_learner/is_completed_booking_for_learner(id)`.

**RPC aplikasi:**
- **007 `create_booking_with_slot_reservation`** — pembuatan booking atomik: validasi pemanggil, gerbang usia (fail-closed), mentor terverifikasi, cek blokir dua arah, pencegahan double-booking (`FOR UPDATE SKIP LOCKED` pada slot `available`), guard `paid_booking_not_enabled`. `SECURITY DEFINER`, `REVOKE` dari publik/anon, `GRANT` ke authenticated.
- **008 `transition_booking_status(p_booking_id, p_action, p_reason)`** — transisi status booking (konfirmasi/tolak/selesai/batal/no_show) dengan validasi pihak & rilis slot.
- **009 `submit_mentor_verification()` & `review_mentor_verification(p_mentor_id, p_decision)`** — pengajuan verifikasi oleh mentor dan keputusan oleh moderator. Hanya jalur tulis status verifikasi.

---

## 6. Keamanan / RLS (Ringkas)

- **profiles**: baca sendiri, atau profil `discoverable`, atau moderator; ubah hanya milik sendiri.
- **user_safety_settings**: baris sendiri; moderator bisa membaca untuk moderasi.
- **profile_topics / user_availability**: baca sendiri + `discoverable` + moderator; tulis hanya milik sendiri (owner CRUD penuh).
- **learning_goals**: baca sendiri / `matchable` / moderator; tulis pemilik.
- **study_partner_requests**: hanya pihak terkait (pengirim/penerima) + moderator.
- **study_groups / study_group_members**: publik atau keanggotaan; aksi owner untuk persetujuan.
- **study_sessions / members / checklist / notes**: peserta & organizer + moderator; catatan mengikuti `is_shared` & keanggotaan.
- **mentor_profiles**: baca sendiri / `verified` / moderator; **UPDATE dibatasi per kolom** untuk authenticated (hanya headline, expertise_summary, experience_years, is_accepting_bookings, updated_at) — verifikasi hanya via RPC moderator.
- **mentor_services**: pemilik (mentor) mengelola; pengguna `authenticated` dapat melihat layanan milik **mentor terverifikasi** yang `is_active`; moderator dapat melihat semua. **mentor_availability_slots**: pemilik mengelola; `authenticated` dapat melihat slot milik mentor terverifikasi; moderator melihat semua.
- **mentor_bookings / summaries / feedback / goal_updates**: pihak booking / pemilik tujuan + moderator.
- **user_blocks**: hanya baris milik pemanggil terlihat (keterbatasan reverse-block — lihat bagian 9).
- **user_reports**: pelapor & moderator; kolom internal tidak diekspos ke pengguna biasa.

---

## 7. Status/Enum & Label (Bahasa Indonesia)

Semua nilai mesin selalu ditampilkan sebagai label teks (bukan hanya warna) — prinsip aksesibilitas STEP 5. Pemetaan ada di `src/lib/status.ts`, antara lain:
- **Tujuan**: Aktif / Selesai / Dijeda / Diarsipkan.
- **Booking**: Menunggu konfirmasi / Terkonfirmasi / Ditolak / Dibatalkan pembelajar / Dibatalkan mentor / Selesai / Tidak hadir.
- **Verifikasi mentor**: Belum diajukan / Menunggu verifikasi / Terverifikasi / Ditolak / Ditangguhkan.
- **Permintaan partner**: Menunggu jawaban / Diterima / Ditolak / Dibatalkan.
- **Grup & anggota**, **sesi & peserta**, **laporan** (Terbuka / Sedang ditinjau / Selesai / Diabaikan), **alasan laporan**, **hari (Minggu–Sabtu)**, **mode pengiriman**, **tipe harga**, **jenjang**, **tingkat**, **jenis minat**, **pembayaran**.

---

## 8. Aturan Validasi (Zod)

- **Auth**: email valid; sandi 8–72; konfirmasi cocok; nama 2–60.
- **Onboarding**: nama 2–60; topik ≤20 UUID; enum jenjang/usia/visibilitas/tingkat.
- **Tujuan**: judul 3–120; deskripsi ≤1000; tanggal `YYYY-MM-DD`; mode dukungan & visibilitas.
- **Kelompok**: nama 3–80; deskripsi ≤1000; max anggota 2–50; visibilitas.
- **Sesi**: judul 3–120; tujuan ≤1000; URL rapat valid; selesai > mulai. Checklist judul ≤200; catatan ≤4000.
- **Partner**: pesan ≤500; alasan laporan enum; detail ≤1000.
- **Mentoring**: ringkasan ≤4000; langkah ≤2000; rating 1–5; komentar ≤1000; progres 0–100.
- **Mentor**: headline 3–120; ringkasan keahlian 10–2000; pengalaman 0–60; durasi 15–480; harga ≥0; kebijakan pembatalan 3–1000; slot selesai > mulai.
- **Ketersediaan (settings)**: hari 0–6; format jam `HH:MM`; selesai > mulai.

---

## 9. Keputusan & Batasan yang Dipertahankan

- **Pembayaran berbayar dinonaktifkan** (UI + server action + RPC). Layanan `paid` boleh dicatat, tetapi sesi berbayar tidak dapat dibooking pada MVP.
- **Mentoring di bawah 18 tahun diblokir** (gerbang usia fail-closed; ada peringatan di dashboard). Partner & kelompok tetap tersedia.
- **Pencocokan tanpa ML / tanpa persentase** — hanya alasan yang dapat dijelaskan.
- **Verifikasi mentor manual** — tidak ada verifikasi otomatis; mentor hanya bisa mengajukan `pending`, keputusan di tangan moderator.
- **Tanpa chat/video internal** — sesi memakai tautan rapat eksternal.
- **Tanpa gateway pembayaran** — hanya referensi pembayaran manual (dan saat ini nonaktif).
- **Keterbatasan blokir dua arah**: RLS `user_blocks` hanya mengekspos baris milik pemanggil, sehingga aplikasi dapat menyembunyikan pengguna yang **kita blokir**, tetapi **belum** dapat mendeteksi "seseorang memblokir kita" tanpa fungsi/trigger basis data (perubahan skema — menunggu persetujuan).
- **Field wireframe "hal yang membingungkan"** pada ringkasan sesi digabung ke teks ringkasan (tanpa menambah kolom).

---

## 10. Data Awal (Seed)

`006_seed_topics.sql` menyiapkan **24 topik** (idempotent): Matematika, Fisika, Kimia, Biologi, Statistika, Bahasa Inggris, Bahasa Indonesia, Bahasa Jepang, Bahasa Korea, Bahasa Arab, Pemrograman, Pengembangan Web, Data Science, Desain UI/UX, Ekonomi, Akuntansi, Sejarah, Geografi, Sosiologi, Public Speaking, Kewirausahaan, Fotografi, Musik, Bahasa Asing Lainnya.

---

## 11. Migrasi yang Sudah Diterapkan (Remote)

| No | Berkas | Isi |
|---|---|---|
| 001 | `20261014160515_001_extensions_and_schema.sql` | Ekstensi + skema. |
| 002 | `20261014160516_002_tables.sql` | 23 tabel + trigger `updated_at`. |
| 003 | `20261014160517_003_indexes.sql` | Indeks, termasuk GIN trigram. |
| 004 | `20261014160518_004_functions_and_triggers.sql` | Trigger signup + helper otorisasi. |
| 005 | `20261014160519_005_rls_policies.sql` | Semua kebijakan RLS + grant. |
| 006 | `20261014160520_006_seed_topics.sql` | Seed 24 topik. |
| 007 | `20261014160521_007_atomic_booking_rpc.sql` | RPC booking atomik. |
| 008 | `20261016120000_008_booking_status_transitions.sql` | RPC transisi status booking. |
| 009 | `20261016130000_009_mentor_verification_rpc.sql` | RPC pengajuan/review verifikasi mentor. |
| 010 | `20261019120000_010_backfill_missing_profiles.sql` | Perbaikan data: mengisi `profiles` + `user_safety_settings` untuk akun lama yang dibuat sebelum trigger auto-provision ada (idempotent; tanpa perubahan skema/RLS). |
| 011 | `20261019130000_011_rls_hardening.sql` | Pengerasan RLS: mencabut hak `INSERT` klien pada `mentor_bookings` + `booking_payments` (kini hanya lewat RPC / service-role), memperketat `study_sessions_insert` (harus anggota kelompok aktif), dan menambah fungsi `can_join_session(...)` + syarat `study_session_members_insert` agar hanya peserta sah yang bisa bergabung. |

Semua tercermin di `supabase/migrations_bundle.sql` dan salinan referensi di `supabase/reference/`.

---

## 12. Belum Ada / Langkah Berikutnya

- **Reverse-block** di tingkat basis data (fungsi/trigger) — perubahan skema, butuh persetujuan.
- **Pengujian langsung (in-browser)** untuk alur terautentikasi butuh 2+ akun; pendaftaran publik sempat dibatasi (HTTP 429) oleh SMTP bersama Supabase.
- **Akun moderator** belum ada; menguji `/moderator` butuh JWT dengan `app_metadata.role` = `moderator`/`admin`.
- Statistik "Partner belajar" di dashboard masih placeholder (0).
- Tidak ada pengiriman email transaksional kustom, tidak ada notifikasi real-time, tidak ada pencarian teks UI penuh (indeks trigram sudah siap di DB).

---

## 13. Verifikasi Kualitas

- `npm run lint` — PASS (tanpa error).
- `npx tsc --noEmit` — PASS.
- `npx next build` — PASS; **28 halaman**; seluruh rute tingkat atas `◐ Partial Prerender`; proxy aktif.
- RPC 008 & 009 diuji pada basis data live di dalam transaksi yang di-rollback (memakai peran `authenticated` agar RLS/grant berlaku): transisi booking (mentor-only guard, konfirmasi, transisi tak valid, batal + rilis slot, selesai, `not_a_party`) dan verifikasi mentor (`pending`, `already_pending`, `not_moderator`, `verified`), serta pemblokiran update mandiri `verification_status`.
