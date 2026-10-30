# EduPulse — STEP 4: Database Schema

**Dokumen:** Rancangan database relasional untuk MVP  
**Produk:** EduPulse  
**Referensi:** PRD EduPulse v1.2, STEP 2 — User Persona & User Flow, STEP 3 — Wireframe (approved)  
**Tahap SOP:** STEP 4 — Rancang Database Schema  
**Status:** Draft — menunggu approval pengguna  
**Target database:** PostgreSQL melalui Supabase

---

## 1. Tujuan dan Prinsip Rancangan

Schema ini menjadi rancangan struktur data untuk mendukung fitur MVP EduPulse: Smart Study Matching, Study Groups & Shared Goals, Mentor Discovery & Booking, Structured Mentoring & Learning Progress, serta Trust, Safety & Service Management.

Prinsip rancangan:

- Gunakan nama tabel dan kolom `snake_case` secara konsisten.
- Gunakan UUID sebagai primary key untuk entitas utama. `profiles.id` mengikuti ID dari Supabase Auth.
- Gunakan `timestamptz` untuk timestamp agar waktu tersimpan secara konsisten; tampilan waktu mengikuti zona waktu pengguna.
- Hindari menyimpan email atau password duplikat di tabel aplikasi. Autentikasi dikelola Supabase Auth.
- Jangan menyimpan data kartu pembayaran, kredensial bank, atau dokumen identitas sensitif dalam schema MVP.
- Tidak ada tabel atau layanan untuk chat internal, video conference internal, machine-learning matching, atau pembayaran otomatis.
- Nilai status ditulis sebagai himpunan nilai yang tervalidasi melalui `CHECK` constraint atau PostgreSQL enum saat implementasi dipilih.

Tabel berikut menjelaskan desain logis dan tipe data PostgreSQL. Dokumen ini **belum** merupakan migration SQL dan belum menjalankan perubahan pada database.

## 2. Ringkasan Tabel

| No. | Tabel | Fungsi |
|---:|---|---|
| 1 | `profiles` | Profil dasar pengguna yang aman untuk kebutuhan aplikasi |
| 2 | `user_safety_settings` | Pengaturan privasi dan kelompok usia yang hanya boleh diakses pengguna terkait serta backend berwenang |
| 3 | `topics` | Katalog topik belajar |
| 4 | `profile_topics` | Topik minat/keahlian setiap pengguna dan tingkat pemahaman |
| 5 | `user_availability` | Jadwal mingguan untuk pencocokan partner/kelompok |
| 6 | `learning_goals` | Tujuan belajar pengguna |
| 7 | `study_partner_requests` | Permintaan koneksi partner belajar |
| 8 | `study_groups` | Kelompok belajar |
| 9 | `study_group_members` | Anggota, status permintaan bergabung, dan peran di kelompok |
| 10 | `study_sessions` | Sesi belajar terjadwal untuk partner atau kelompok |
| 11 | `study_session_members` | Daftar peserta sesi belajar |
| 12 | `study_session_checklist_items` | Checklist agenda/tugas sesi kelompok |
| 13 | `study_session_notes` | Catatan dalam workspace sesi belajar |
| 14 | `mentor_profiles` | Informasi mentor dan status verifikasinya |
| 15 | `mentor_services` | Layanan mentoring yang ditawarkan mentor |
| 16 | `mentor_availability_slots` | Slot ketersediaan mentor pada tanggal dan jam tertentu |
| 17 | `mentor_bookings` | Pemesanan sesi mentor dan statusnya |
| 18 | `booking_payments` | Status dan referensi verifikasi pembayaran manual untuk sesi berbayar |
| 19 | `mentoring_session_summaries` | Ringkasan sesi mentoring dan langkah belajar berikutnya |
| 20 | `mentor_feedback` | Feedback dan rating dari peserta setelah sesi |
| 21 | `learning_goal_updates` | Catatan perubahan progres tujuan belajar |
| 22 | `user_blocks` | Relasi blokir antar pengguna |
| 23 | `user_reports` | Laporan keselamatan/penyalahgunaan dan status penanganan |

## 3. Detail Schema per Tabel

Keterangan: **PK** = primary key, **FK** = foreign key, **UQ** = unique. `NULL` berarti kolom boleh kosong; selain itu kolom dianggap wajib kecuali disebutkan.

### 3.1 `profiles`

Satu baris untuk satu akun aplikasi. ID harus sama dengan ID pengguna Supabase Auth.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users.id`, `ON DELETE CASCADE` |
| `display_name` | `text` | Wajib; nama yang ditampilkan di aplikasi |
| `avatar_url` | `text` | NULL; URL avatar opsional |
| `bio` | `text` | NULL; deskripsi singkat pengguna |
| `education_level` | `text` | NULL; nilai yang disarankan: `school`, `university`, `independent`, `other` |
| `timezone` | `text` | Wajib; zona waktu IANA, misalnya `Asia/Makassar` |
| `onboarding_completed` | `boolean` | Wajib, default `false` |
| `created_at` | `timestamptz` | Wajib, default waktu saat dibuat |
| `updated_at` | `timestamptz` | Wajib, diperbarui saat record berubah |

**Catatan:** Email dan password tetap berada di Supabase Auth, bukan di `profiles`.

### 3.2 `user_safety_settings`

Pengaturan yang lebih sensitif dipisahkan dari profil publik agar tidak ikut terbaca ketika profil ditampilkan ke pengguna lain.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `user_id` | `uuid` | PK, FK → `profiles.id`, `ON DELETE CASCADE` |
| `age_band` | `text` | Wajib; `under_18`, `18_or_over`, atau `not_set` |
| `profile_visibility` | `text` | Wajib; `discoverable` atau `private`, default `discoverable` |
| `updated_at` | `timestamptz` | Wajib |

**Penting:** kelompok usia bukan pengganti kebijakan perlindungan anak. Sebelum interaksi mentoring dengan pengguna di bawah umur diaktifkan, aturan akses, persetujuan, moderasi, dan proses eskalasi harus ditentukan. Jika aturan itu belum siap, akses mentoring untuk akun `under_18` harus dinonaktifkan lewat kebijakan aplikasi/RLS yang telah diuji.

### 3.3 `topics`

Katalog topik yang dipakai untuk profil, tujuan belajar, serta pencarian layanan mentor.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `name` | `text` | Wajib, UQ |
| `slug` | `text` | Wajib, UQ; bentuk singkat untuk URL/filter |
| `description` | `text` | NULL |
| `is_active` | `boolean` | Wajib, default `true` |
| `created_at` | `timestamptz` | Wajib |

### 3.4 `profile_topics`

Menghubungkan profil dengan beberapa topik minat atau keahlian.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `profile_id` | `uuid` | PK gabungan, FK → `profiles.id`, `ON DELETE CASCADE` |
| `topic_id` | `uuid` | PK gabungan, FK → `topics.id` |
| `interest_type` | `text` | Wajib; `learning`, `teaching`, atau `both` |
| `skill_level` | `text` | Wajib; `beginner`, `intermediate`, `advanced`, atau `not_sure` |
| `created_at` | `timestamptz` | Wajib |

**Primary key:** (`profile_id`, `topic_id`).

### 3.5 `user_availability`

Pola jadwal mingguan yang membantu matching partner atau kelompok. Ini bukan slot booking mentor bertanggal.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `user_id` | `uuid` | FK → `profiles.id`, `ON DELETE CASCADE` |
| `day_of_week` | `smallint` | Wajib; `0`–`6` dengan konvensi `0 = Minggu` |
| `start_time` | `time` | Wajib |
| `end_time` | `time` | Wajib; harus lebih besar dari `start_time` |
| `is_active` | `boolean` | Wajib, default `true` |
| `created_at` | `timestamptz` | Wajib |

**Constraint:** `CHECK (day_of_week BETWEEN 0 AND 6)` dan `CHECK (end_time > start_time)`.

### 3.6 `learning_goals`

Tujuan belajar milik pengguna. Matching hanya menggunakan tujuan yang statusnya aktif dan boleh ditemukan.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `user_id` | `uuid` | FK → `profiles.id`, `ON DELETE CASCADE` |
| `topic_id` | `uuid` | NULL, FK → `topics.id` |
| `title` | `text` | Wajib |
| `description` | `text` | NULL |
| `target_date` | `date` | NULL; target tanggal opsional |
| `support_modes` | `text[]` | Wajib; minimal satu dari `partner`, `group`, `mentor` |
| `visibility` | `text` | Wajib; `private` atau `matchable`, default `matchable` |
| `status` | `text` | Wajib; `active`, `completed`, `paused`, atau `archived`; default `active` |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

### 3.7 `study_partner_requests`

Permintaan satu pengguna untuk belajar bersama pengguna lain. Penerimaan request tidak membuka chat internal; pengguna bisa merencanakan sesi melalui fitur sesi belajar.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `requester_id` | `uuid` | FK → `profiles.id`, `ON DELETE CASCADE` |
| `recipient_id` | `uuid` | FK → `profiles.id`, `ON DELETE CASCADE` |
| `learning_goal_id` | `uuid` | NULL, FK → `learning_goals.id`, `ON DELETE SET NULL` |
| `message` | `text` | NULL; pesan permintaan singkat |
| `status` | `text` | Wajib; `pending`, `accepted`, `rejected`, atau `cancelled`; default `pending` |
| `responded_at` | `timestamptz` | NULL |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

**Constraint:** `CHECK (requester_id <> recipient_id)`. Backend perlu memeriksa agar pengguna yang diblokir tidak dapat saling mengirim permintaan.

### 3.8 `study_groups`

Kelompok belajar dengan tujuan, topik, dan batas jumlah anggota.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `owner_id` | `uuid` | FK → `profiles.id` |
| `learning_goal_id` | `uuid` | NULL, FK → `learning_goals.id`, `ON DELETE SET NULL` |
| `topic_id` | `uuid` | NULL, FK → `topics.id` |
| `name` | `text` | Wajib |
| `description` | `text` | NULL |
| `max_members` | `integer` | Wajib, default `8`, minimal `2` |
| `visibility` | `text` | Wajib; `public` atau `invite_only` |
| `status` | `text` | Wajib; `active`, `closed`, atau `archived`; default `active` |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

**Constraint:** `CHECK (max_members >= 2)`. Saat kelompok dibuat, aplikasi harus membuat baris anggota aktif untuk `owner_id` dengan role `owner` di `study_group_members`.

### 3.9 `study_group_members`

Mencatat keanggotaan dan permintaan bergabung; baris dengan status `pending` berfungsi sebagai join request.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `group_id` | `uuid` | FK → `study_groups.id`, `ON DELETE CASCADE` |
| `user_id` | `uuid` | FK → `profiles.id`, `ON DELETE CASCADE` |
| `role` | `text` | Wajib; `owner`, `moderator`, atau `member`; default `member` |
| `status` | `text` | Wajib; `pending`, `active`, `rejected`, atau `left`; default `pending` |
| `requested_at` | `timestamptz` | Wajib |
| `responded_at` | `timestamptz` | NULL |
| `joined_at` | `timestamptz` | NULL |

**Constraints:** UQ (`group_id`, `user_id`). Backend harus memastikan jumlah anggota aktif tidak melewati `max_members` dan hanya pemilik/moderator berwenang yang dapat menerima permintaan.

### 3.10 `study_sessions`

Sesi belajar yang direncanakan oleh partner atau anggota kelompok. Kolom `group_id` kosong untuk sesi partner.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `created_by` | `uuid` | FK → `profiles.id` |
| `group_id` | `uuid` | NULL, FK → `study_groups.id`, `ON DELETE SET NULL` |
| `learning_goal_id` | `uuid` | NULL, FK → `learning_goals.id`, `ON DELETE SET NULL` |
| `title` | `text` | Wajib |
| `objectives` | `text` | NULL |
| `starts_at` | `timestamptz` | Wajib |
| `ends_at` | `timestamptz` | Wajib; harus setelah `starts_at` |
| `external_meeting_url` | `text` | NULL; tautan layanan eksternal jika dipakai |
| `status` | `text` | Wajib; `planned`, `in_progress`, `completed`, atau `cancelled`; default `planned` |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

**Constraint:** `CHECK (ends_at > starts_at)`. Backend harus memastikan pembuat dan peserta merupakan anggota kelompok terkait atau partner yang berhak mengikuti sesi.

### 3.11 `study_session_members`

Peserta dalam sesi belajar. Primary key gabungan mencegah pengguna ditambahkan dua kali ke sesi yang sama.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `session_id` | `uuid` | PK gabungan, FK → `study_sessions.id`, `ON DELETE CASCADE` |
| `user_id` | `uuid` | PK gabungan, FK → `profiles.id`, `ON DELETE CASCADE` |
| `role` | `text` | Wajib; `organizer` atau `participant` |
| `status` | `text` | Wajib; `invited`, `confirmed`, `declined`, `attended`, atau `absent`; default `invited` |
| `responded_at` | `timestamptz` | NULL |
| `created_at` | `timestamptz` | Wajib |

**Primary key:** (`session_id`, `user_id`).

### 3.12 `study_session_checklist_items`

Checklist agenda atau tugas dalam workspace sesi belajar.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `session_id` | `uuid` | FK → `study_sessions.id`, `ON DELETE CASCADE` |
| `created_by` | `uuid` | FK → `profiles.id` |
| `title` | `text` | Wajib |
| `position` | `integer` | Wajib, default `0`; urutan item |
| `is_completed` | `boolean` | Wajib, default `false` |
| `completed_by` | `uuid` | NULL, FK → `profiles.id`, `ON DELETE SET NULL` |
| `completed_at` | `timestamptz` | NULL |
| `created_at` | `timestamptz` | Wajib |

### 3.13 `study_session_notes`

Catatan pengguna pada workspace sesi belajar. Tidak menyediakan editor kolaboratif real-time.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `session_id` | `uuid` | FK → `study_sessions.id`, `ON DELETE CASCADE` |
| `author_id` | `uuid` | FK → `profiles.id` |
| `content` | `text` | Wajib |
| `is_shared` | `boolean` | Wajib, default `true` |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

### 3.14 `mentor_profiles`

Informasi tambahan bagi pengguna yang mengajukan diri sebagai mentor. Semua pengguna tetap bisa memiliki profil pembelajar biasa.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `user_id` | `uuid` | PK, FK → `profiles.id`, `ON DELETE CASCADE` |
| `headline` | `text` | Wajib |
| `expertise_summary` | `text` | Wajib |
| `experience_years` | `smallint` | NULL; tidak boleh negatif |
| `verification_status` | `text` | Wajib; `not_submitted`, `pending`, `verified`, `rejected`, atau `suspended`; default `not_submitted` |
| `verification_submitted_at` | `timestamptz` | NULL |
| `verification_reviewed_at` | `timestamptz` | NULL |
| `is_accepting_bookings` | `boolean` | Wajib, default `false` |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

**Aturan aplikasi:** hanya mentor dengan status `verified` dan `is_accepting_bookings = true` yang boleh ditampilkan sebagai mentor yang dapat dipesan. Verifikasi awal dilakukan secara manual; bukan verifikasi pihak ketiga otomatis.

### 3.15 `mentor_services`

Layanan mentor dapat berisi sesi gratis atau berbayar. Harga dan durasi yang ditampilkan harus disimpan pada layanan dan disalin sebagai snapshot saat booking dibuat.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `mentor_id` | `uuid` | FK → `mentor_profiles.user_id`, `ON DELETE CASCADE` |
| `topic_id` | `uuid` | NULL, FK → `topics.id` |
| `title` | `text` | Wajib |
| `description` | `text` | Wajib |
| `duration_minutes` | `smallint` | Wajib; harus lebih dari `0` |
| `delivery_mode` | `text` | Wajib; `online_external` atau `in_person` |
| `price_type` | `text` | Wajib; `free` atau `paid` |
| `price_amount` | `numeric(12,2)` | Wajib; `0` untuk `free`, lebih dari `0` untuk `paid` |
| `currency` | `char(3)` | Wajib; kode mata uang ISO 4217, misalnya `IDR` |
| `cancellation_policy` | `text` | Wajib; penjelasan kebijakan pembatalan |
| `is_active` | `boolean` | Wajib, default `true` |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

**Constraints:** `CHECK (duration_minutes > 0)`; `CHECK ((price_type = 'free' AND price_amount = 0) OR (price_type = 'paid' AND price_amount > 0))`; `CHECK (price_amount >= 0)`.

### 3.16 `mentor_availability_slots`

Slot tanggal dan waktu spesifik yang dapat dipilih saat booking. Slot ini berbeda dari pola mingguan `user_availability`.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `mentor_id` | `uuid` | FK → `mentor_profiles.user_id`, `ON DELETE CASCADE` |
| `starts_at` | `timestamptz` | Wajib |
| `ends_at` | `timestamptz` | Wajib; harus setelah `starts_at` |
| `status` | `text` | Wajib; `available`, `reserved`, atau `unavailable`; default `available` |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

**Constraint:** `CHECK (ends_at > starts_at)`. Saat implementasi, proses booking harus memakai transaksi database untuk mencegah dua pengguna berhasil memesan slot yang sama.

### 3.17 `mentor_bookings`

Booking sesi dengan mentor. Jadwal, judul layanan, durasi, jenis harga, jumlah harga, dan mata uang disimpan sebagai snapshot agar riwayat booking tidak berubah ketika layanan diedit.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `learner_id` | `uuid` | FK → `profiles.id` |
| `mentor_id` | `uuid` | FK → `mentor_profiles.user_id` |
| `service_id` | `uuid` | FK → `mentor_services.id` |
| `availability_slot_id` | `uuid` | FK → `mentor_availability_slots.id` |
| `learning_goal_id` | `uuid` | NULL, FK → `learning_goals.id`, `ON DELETE SET NULL` |
| `service_title_snapshot` | `text` | Wajib |
| `starts_at` | `timestamptz` | Wajib; snapshot waktu mulai |
| `ends_at` | `timestamptz` | Wajib; snapshot waktu selesai |
| `price_type_snapshot` | `text` | Wajib; `free` atau `paid` |
| `price_amount_snapshot` | `numeric(12,2)` | Wajib |
| `currency_snapshot` | `char(3)` | Wajib |
| `learner_objective` | `text` | Wajib; tujuan atau pertanyaan yang ingin dibahas |
| `status` | `text` | Wajib; `pending`, `confirmed`, `declined`, `cancelled_by_learner`, `cancelled_by_mentor`, `completed`, atau `no_show`; default `pending` |
| `cancellation_reason` | `text` | NULL |
| `cancelled_at` | `timestamptz` | NULL |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

**Constraints dan aturan:**

- `CHECK (learner_id <> mentor_id)`.
- `CHECK (ends_at > starts_at)` dan `CHECK (price_amount_snapshot >= 0)`.
- `price_type_snapshot = 'free'` harus memiliki harga `0`; `paid` harus memiliki harga di atas `0`.
- Booking berbayar tidak boleh dianggap lunas hanya karena booking berstatus `confirmed`. Status pembayaran berada di `booking_payments` dan harus diverifikasi secara terpisah.
- Proses create/cancel/confirm harus memperbarui status slot secara konsisten dan menangani permintaan bersamaan secara atomik.

### 3.18 `booking_payments`

Pencatatan status pembayaran manual untuk booking berbayar. Tabel ini tidak mengintegrasikan payment gateway dan tidak menyimpan detail kartu atau rekening.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `booking_id` | `uuid` | FK → `mentor_bookings.id`, UQ; satu catatan pembayaran per booking |
| `amount` | `numeric(12,2)` | Wajib; salinan jumlah harga dari booking |
| `currency` | `char(3)` | Wajib |
| `payment_instructions_snapshot` | `text` | NULL sebelum instruksi pilot ditentukan; salinan instruksi yang ditampilkan saat itu |
| `payment_reference` | `text` | NULL; referensi transaksi yang dikirim pengguna, bukan kredensial rahasia |
| `status` | `text` | Wajib; `awaiting_instructions`, `awaiting_payment`, `submitted_for_review`, `verified`, `rejected`, atau `cancelled` |
| `verified_by` | `uuid` | NULL, FK → `profiles.id` |
| `verified_at` | `timestamptz` | NULL |
| `review_note` | `text` | NULL; catatan internal peninjau, tidak boleh dibaca pengguna biasa |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

**Aturan penting:** tabel ini hanya mendukung pencatatan dan verifikasi manual. Alur booking berbayar **jangan diaktifkan** sebelum instruksi pembayaran, bukti/referensi yang diterima, pihak yang memverifikasi, pembatalan, serta penanganan sengketa disepakati. Booking gratis tidak memerlukan baris pada tabel ini.

### 3.19 `mentoring_session_summaries`

Ringkasan sesi mentoring yang berisi hasil diskusi dan langkah berikutnya. Satu booking dapat memiliki satu ringkasan utama.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `booking_id` | `uuid` | FK → `mentor_bookings.id`, UQ, `ON DELETE CASCADE` |
| `author_id` | `uuid` | FK → `profiles.id` |
| `summary` | `text` | Wajib |
| `next_steps` | `text` | NULL |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

### 3.20 `mentor_feedback`

Rating dan feedback yang diberikan peserta setelah sesi mentor selesai.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `booking_id` | `uuid` | FK → `mentor_bookings.id`, UQ, `ON DELETE CASCADE` |
| `learner_id` | `uuid` | FK → `profiles.id` |
| `mentor_id` | `uuid` | FK → `mentor_profiles.user_id` |
| `rating` | `smallint` | Wajib; nilai `1`–`5` |
| `comment` | `text` | NULL |
| `created_at` | `timestamptz` | Wajib |
| `updated_at` | `timestamptz` | Wajib |

**Constraints:** `CHECK (rating BETWEEN 1 AND 5)`. Backend memastikan hanya learner dari booking yang sudah selesai dapat memberi feedback dan `learner_id`/`mentor_id` cocok dengan booking.

### 3.21 `learning_goal_updates`

Riwayat progres tujuan belajar, termasuk pembaruan sesudah sesi.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `learning_goal_id` | `uuid` | FK → `learning_goals.id`, `ON DELETE CASCADE` |
| `author_id` | `uuid` | FK → `profiles.id` |
| `source_study_session_id` | `uuid` | NULL, FK → `study_sessions.id`, `ON DELETE SET NULL` |
| `source_mentor_booking_id` | `uuid` | NULL, FK → `mentor_bookings.id`, `ON DELETE SET NULL` |
| `progress_percent` | `smallint` | Wajib; nilai `0`–`100` |
| `update_text` | `text` | NULL |
| `next_step` | `text` | NULL |
| `created_at` | `timestamptz` | Wajib |

**Constraint:** `CHECK (progress_percent BETWEEN 0 AND 100)`. Dalam satu update, `source_study_session_id` dan `source_mentor_booking_id` sebaiknya tidak keduanya diisi.

### 3.22 `user_blocks`

Daftar blokir pengguna untuk mencegah interaksi langsung melalui fitur yang didukung aplikasi.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `blocker_id` | `uuid` | PK gabungan, FK → `profiles.id`, `ON DELETE CASCADE` |
| `blocked_user_id` | `uuid` | PK gabungan, FK → `profiles.id`, `ON DELETE CASCADE` |
| `created_at` | `timestamptz` | Wajib |

**Primary key:** (`blocker_id`, `blocked_user_id`). **Constraint:** `CHECK (blocker_id <> blocked_user_id)`. Blocking perlu diperiksa pada partner request, group join, matching, booking, dan tampilan profil.

### 3.23 `user_reports`

Laporan terhadap pengguna dengan status penanganan. Konteks laporan bisa berupa profil, kelompok, sesi belajar, atau booking mentor.

| Kolom | Tipe PostgreSQL | Aturan / Keterangan |
|---|---|---|
| `id` | `uuid` | PK, default UUID |
| `reporter_id` | `uuid` | FK → `profiles.id` |
| `reported_user_id` | `uuid` | FK → `profiles.id` |
| `study_group_id` | `uuid` | NULL, FK → `study_groups.id`, `ON DELETE SET NULL` |
| `study_session_id` | `uuid` | NULL, FK → `study_sessions.id`, `ON DELETE SET NULL` |
| `mentor_booking_id` | `uuid` | NULL, FK → `mentor_bookings.id`, `ON DELETE SET NULL` |
| `reason_code` | `text` | Wajib; misalnya `harassment`, `misleading_profile`, `unsafe_behavior`, `spam`, `payment_issue`, `other` |
| `details` | `text` | NULL; rincian laporan dari pelapor |
| `status` | `text` | Wajib; `open`, `in_review`, `resolved`, atau `dismissed`; default `open` |
| `reviewed_by` | `uuid` | NULL, FK → `profiles.id` |
| `reviewed_at` | `timestamptz` | NULL |
| `resolution_note` | `text` | NULL; catatan internal, akses terbatas |
| `created_at` | `timestamptz` | Wajib |

**Aturan:** paling banyak satu dari `study_group_id`, `study_session_id`, dan `mentor_booking_id` yang boleh diisi. Jika semuanya NULL, laporan mengacu pada profil pengguna. Catatan resolusi hanya boleh diakses role moderator/admin yang berwenang.

## 4. Ringkasan Relasi Antar Tabel

| Relasi | Kardinalitas | Penjelasan |
|---|---|---|
| `auth.users` → `profiles` | 1 : 1 | Satu akun autentikasi memiliki satu profil aplikasi |
| `profiles` ↔ `topics` melalui `profile_topics` | M : N | Pengguna dapat memilih banyak topik; setiap topik dimiliki banyak pengguna |
| `profiles` → `user_availability` | 1 : N | Pengguna dapat menyimpan beberapa blok jadwal mingguan |
| `profiles` → `learning_goals` | 1 : N | Pengguna dapat memiliki beberapa tujuan belajar |
| `profiles` → `study_partner_requests` | 1 : N | Pengguna dapat mengirim atau menerima banyak permintaan |
| `study_groups` ↔ `profiles` melalui `study_group_members` | M : N | Pengguna dapat bergabung dengan banyak kelompok dan kelompok berisi banyak pengguna |
| `study_sessions` ↔ `profiles` melalui `study_session_members` | M : N | Sesi dapat memiliki banyak peserta dan pengguna dapat ikut banyak sesi |
| `study_sessions` → `study_session_checklist_items` | 1 : N | Satu sesi dapat berisi banyak item checklist |
| `study_sessions` → `study_session_notes` | 1 : N | Catatan dapat dibuat oleh beberapa anggota sesi |
| `profiles` → `mentor_profiles` | 1 : 0..1 | Profil pengguna bisa memiliki data mentor tambahan |
| `mentor_profiles` → `mentor_services` | 1 : N | Mentor dapat menawarkan beberapa layanan |
| `mentor_profiles` → `mentor_availability_slots` | 1 : N | Mentor dapat mengelola banyak slot jadwal |
| `mentor_bookings` → `booking_payments` | 1 : 0..1 | Booking berbayar dapat mempunyai satu catatan pembayaran manual |
| `mentor_bookings` → `mentoring_session_summaries` | 1 : 0..1 | Satu booking mempunyai paling banyak satu ringkasan utama |
| `mentor_bookings` → `mentor_feedback` | 1 : 0..1 | Satu booking mempunyai paling banyak satu feedback learner |
| `learning_goals` → `learning_goal_updates` | 1 : N | Tujuan dapat memiliki riwayat progres |
| `profiles` → `user_blocks` | 1 : N | Pengguna dapat memblokir atau diblokir oleh pengguna lain |
| `profiles` → `user_reports` | 1 : N | Pengguna dapat melapor atau menjadi pengguna yang dilaporkan |

## 5. Indeks yang Disarankan

Indeks ini untuk pencarian yang sering dilakukan; detail final dapat disesuaikan ketika query implementasi diketahui.

- `profile_topics(topic_id, interest_type, skill_level)` untuk discovery berdasarkan topik dan tingkat kemampuan.
- `user_availability(user_id, day_of_week)` untuk jadwal milik pengguna.
- `learning_goals(user_id, status)` dan `learning_goals(topic_id, status, visibility)` untuk daftar tujuan dan matching.
- `study_partner_requests(recipient_id, status, created_at)` serta `(requester_id, status, created_at)` untuk halaman status request.
- `study_group_members(group_id, status)` dan `(user_id, status)` untuk daftar anggota serta permintaan.
- `study_sessions(starts_at, status)` dan `study_session_members(user_id, status)` untuk sesi mendatang pengguna.
- `mentor_services(topic_id, is_active, price_type)` untuk direktori mentor/layanan.
- `mentor_availability_slots(mentor_id, status, starts_at)` untuk pencarian slot tersedia.
- `mentor_bookings(learner_id, status, starts_at)` dan `(mentor_id, status, starts_at)` untuk dashboard masing-masing pihak.
- `user_reports(status, created_at)` untuk antrean moderasi.

## 6. Aturan Akses dan Keamanan Supabase (RLS)

Aktifkan Row Level Security (RLS) pada seluruh tabel aplikasi yang diekspos ke client. Kebijakan berikut adalah kebutuhan desain, bukan SQL policy final.

| Tabel / Data | Aturan akses minimum |
|---|---|
| `profiles` | Pengguna dapat mengedit profilnya sendiri; profil yang discoverable hanya ditampilkan secukupnya sesuai kebijakan aplikasi |
| `user_safety_settings` | Hanya pemilik dan backend/admin berwenang yang boleh membaca atau mengubahnya |
| `topics` | Pengguna dapat membaca topik aktif; hanya admin yang boleh mengelola katalog |
| `profile_topics`, `user_availability`, `learning_goals` | Pemilik dapat mengelola miliknya; data hanya dapat dipakai untuk matching jika visibilitas dan aturan keselamatan mengizinkan |
| `study_partner_requests` | Hanya pengirim/penerima yang boleh membaca; pengirim membuat atau membatalkan, penerima merespons |
| `study_groups`, `study_group_members` | Data kelompok publik dapat ditemukan; perubahan keanggotaan dibatasi pada anggota dan pemilik/moderator sesuai status |
| `study_sessions`, `study_session_members`, checklist, notes | Hanya peserta yang berhak dapat melihat; perubahan terbatas pada peserta yang sesuai perannya |
| `mentor_profiles`, `mentor_services`, `mentor_availability_slots` | Data layanan aktif dapat ditampilkan; mentor hanya mengelola datanya sendiri; kontrol verifikasi tidak boleh diberikan kepada mentor itu sendiri |
| `mentor_bookings` | Hanya learner dan mentor terkait yang dapat membaca; perubahan status harus mengikuti transisi yang diizinkan |
| `booking_payments` | Learner dapat melihat/mengirim referensi yang diperlukan; hanya verifier/admin yang dapat menandai verified/rejected dan membaca catatan internal |
| `mentoring_session_summaries`, `mentor_feedback`, `learning_goal_updates` | Akses dibatasi pada pemilik tujuan dan pihak sesi yang relevan; validasi hubungan data dilakukan di backend |
| `user_blocks` | Pengguna hanya membaca/mengelola daftar blokirnya sendiri |
| `user_reports` | Pelapor dapat melihat laporannya sendiri; detail internal dan resolusi hanya boleh diakses moderator/admin berwenang |

**Catatan implementasi Supabase:** operasi berhak istimewa harus dilakukan di server dengan kredensial yang tidak dikirim ke browser. Jangan mengandalkan penyembunyian tombol di frontend sebagai satu-satunya kontrol akses. Uji policy menggunakan setidaknya dua akun berbeda sebelum meluncurkan aplikasi.

## 7. Aturan Bisnis Penting

1. **Status verifikasi mentor:** mentor yang belum `verified` tidak dapat menawarkan booking aktif.
2. **Matching:** gunakan aturan yang dapat dijelaskan dari topik, skill level, tujuan, dan jadwal. Tidak ada tabel/model machine learning di MVP.
3. **Booking:** pembuatan booking harus memvalidasi slot, durasi layanan, status mentor, blokir pengguna, kecocokan usia/kebijakan keselamatan, dan tidak adanya booking aktif yang bentrok.
4. **Pembayaran:** harga disimpan sebagai snapshot; pembayaran manual baru boleh diaktifkan setelah proses pilot ditentukan. `verified` merupakan status hasil pemeriksaan pihak berwenang, bukan status otomatis.
5. **Feedback:** hanya learner yang benar-benar memiliki booking berstatus `completed` yang dapat memberikan satu feedback untuk booking tersebut.
6. **Progress:** `learning_goal_updates` menyimpan riwayat; nilai progres terakhir dapat dihitung dari update terbaru, sehingga tidak perlu menggandakan angka progres pada `learning_goals` di tahap ini.
7. **Blocking/reporting:** blokir harus diperiksa oleh pencarian dan semua alur untuk memulai interaksi; laporan tidak otomatis berarti pelapor atau pihak terlapor dianggap benar sebelum ditinjau.
8. **Data usia:** jangan mengumpulkan tanggal lahir lengkap kecuali benar-benar dibutuhkan dan memiliki alasan serta kebijakan yang jelas. `age_band` hanya rancangan awal untuk mendukung pembatasan keselamatan.

## 8. Keputusan dan Asumsi yang Perlu Approval

Mohon tinjau keputusan berikut sebelum schema dianggap final:

1. **Cakupan MVP:** apakah 23 tabel ini sudah sesuai, atau ingin menyederhanakan beberapa tabel sebelum build?
2. **Topik dan matching:** apakah satu katalog `topics` untuk minat pengguna, tujuan, serta layanan mentor sudah tepat?
3. **Kelompok usia:** apakah `age_band` (`under_18`, `18_or_over`, `not_set`) dapat digunakan sebagai minimum untuk perancangan kontrol keselamatan, dengan aturan mentoring di bawah umur ditentukan sebelum rilis?
4. **Sesi belajar:** apakah agenda, checklist, catatan bersama, dan peserta cukup tanpa chat internal?
5. **Pembayaran manual:** apakah kita setuju menyimpan hanya instruksi/referensi/status verifikasi manual dan menonaktifkan alur paid booking hingga prosedur pilot disepakati?
6. **Verifikasi mentor:** apakah status verifikasi manual cukup untuk MVP awal, tanpa integrasi verifikasi pihak ketiga?

### Di luar scope schema MVP ini

- Internal chat, real-time collaborative editor, dan video conference.
- Integrasi payment gateway, auto payout, komisi otomatis, serta refund otomatis.
- Machine-learning matching.
- Penyimpanan kredensial pembayaran atau dokumen identitas sensitif.
- Sistem course/material marketplace atau integrasi LMS.

---

**Status dokumen:** Draft database schema — menunggu approval pengguna.  
**Langkah berikutnya:** Setelah schema disetujui, lanjut sesuai urutan SOP ke STEP 5 — Style & Mood Visual. Belum ada SQL migration atau implementasi database yang dijalankan pada tahap ini.
