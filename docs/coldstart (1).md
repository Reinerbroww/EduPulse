# EduPulse — Cold Start

**Dokumen utama proyek:** ringkasan keputusan STEP 1–5 sesuai SOP Vibe Coding  
**Versi dokumen:** 1.0  
**Tanggal pembaruan:** 13 Oktober 2026  
**Status:** STEP 1–5 APPROVED · STEP 6 BELUM DIMULAI

> Gunakan dokumen ini sebagai sumber konteks utama saat melanjutkan percakapan atau membuka sesi kerja baru. Keputusan produk tidak boleh diperluas diam-diam. Jika ada perubahan pada scope, arsitektur inti, schema, atau arahan visual, minta approval pengguna dan perbarui dokumen ini.

---

## 0. Status Approval dan Sumber Keputusan

| Tahap SOP | Dokumen / keputusan | Status |
|---|---|---|
| STEP 1 | Ide dan EduPulse PRD v1.2 | **APPROVED** — PRD menjadi dasar fitur MVP |
| STEP 2 | `docs/STEP-2-user-persona-user-flow.md` | **APPROVED** |
| STEP 3 | `docs/STEP-3-wireframes.md` | **APPROVED** — struktur wireframe 18 halaman |
| STEP 4 | `docs/STEP-4-database-schema.md` | **APPROVED** — cakupan tabel, katalog topik, keselamatan usia, dan pembayaran manual disetujui tanpa revisi |
| STEP 5 | `docs/STEP-5-style-mood.md` | **APPROVED** — Warm, Collaborative & Trustworthy; palet warna dan prinsip visual disetujui tanpa revisi |

**Persetujuan terakhir:** pengguna menyetujui STEP 5 dan tidak memberikan catatan revisi pada 13 Oktober 2026. Dengan demikian, semua tahap STEP 1–5 dianggap approved untuk keperluan dokumen ini.

**Batas pekerjaan sekarang:** hanya merangkum STEP 1–5. Jangan mulai STEP 6, setup project, membuat migration SQL, menulis kode aplikasi, atau melakukan deployment sebelum pengguna meminta dan mengikuti tahapan SOP berikutnya.

---

## 1. Identitas dan Ide Produk

### Nama produk

**EduPulse**

### Ringkasan satu kalimat

EduPulse adalah platform web kolaborasi belajar yang membantu pelajar menemukan partner belajar, membangun atau bergabung dengan kelompok belajar, menemukan mentor yang sesuai, dan mencatat progres menuju tujuan belajar.

### Masalah yang ingin dibantu

Pelajar dapat mengalami kesulitan menemukan teman belajar yang konsisten, memiliki tujuan dan jadwal yang cocok, atau mengetahui mentor yang relevan. Proses memilih mentor juga membutuhkan transparansi tentang keahlian, status verifikasi, durasi, harga, ketersediaan, dan ketentuan sesi. Setelah sesi berlangsung, pengguna perlu menyimpan hasil diskusi dan mengetahui langkah belajar berikutnya.

### Nilai utama

- Menyatukan discovery partner, kelompok, dan mentor dalam satu pengalaman belajar.
- Membantu pengguna memulai dari tujuan belajar, bukan sekadar mencari orang secara acak.
- Menampilkan alasan kecocokan, termasuk topik, tujuan, tingkat pemahaman yang tersedia, dan jadwal.
- Membuat detail layanan mentor, harga, ketentuan, dan status booking mudah dipahami.
- Mendukung konsistensi melalui agenda, checklist, catatan, feedback, dan riwayat progres.
- Mengutamakan kepercayaan dan perlindungan pengguna melalui verifikasi mentor, privasi, pelaporan, dan pemblokiran.

### Sasaran pengguna

EduPulse ditujukan untuk semua pelajar sejak awal, termasuk siswa, mahasiswa, dan pelajar mandiri. Rancangan MVP memakai satu persona utama sebagai titik awal, bukan sebagai gambaran seluruh pengguna. Perlindungan tambahan untuk pengguna di bawah umur wajib ditentukan sebelum fitur mentoring atau interaksi yang relevan diaktifkan untuk mereka.

---

## 2. STEP 1 — Ringkasan PRD yang Disetujui

**Referensi PRD:** EduPulse PRD v1.2  
**Status:** APPROVED

### Tujuan produk

Membantu pengguna menetapkan tujuan belajar, menemukan cara dukungan belajar yang sesuai, menjalankan sesi belajar atau mentoring, lalu mendokumentasikan progres dan langkah berikutnya.

### Lima kelompok fitur MVP

1. **Smart Study Matching** — rekomendasi partner belajar berdasarkan topik, tujuan, tingkat pemahaman yang tersedia, jadwal, dan preferensi. Alasan kecocokan harus dapat dipahami pengguna.
2. **Study Groups & Shared Goals** — membuat atau menemukan kelompok belajar, mengirim permintaan bergabung, menyepakati target dan sesi, serta menggunakan agenda, checklist, dan catatan.
3. **Mentor Discovery & Booking** — menemukan mentor, melihat profil dan keahlian, memeriksa status verifikasi, layanan, jadwal, durasi, harga, dan ketentuan pembatalan, lalu mengajukan booking.
4. **Structured Mentoring & Learning Progress** — melihat detail sesi, menyimpan ringkasan dan feedback, memberi penilaian setelah sesi selesai, serta memperbarui tujuan dan progres belajar.
5. **Trust, Safety & Service Management** — pengaturan privasi/visibilitas, verifikasi mentor secara manual, blokir pengguna, pelaporan masalah, dan penanganan status booking/pembayaran secara transparan.

### Aturan produk utama

- Pengguna memulai dari profil dan tujuan belajar, lalu dapat memilih partner, kelompok, mentor, atau beberapa jalur tersebut.
- Matching MVP menggunakan aturan dan skor yang dapat dijelaskan; **bukan machine learning**.
- Hasil rekomendasi tidak boleh dibuat seolah-olah cocok jika datanya belum tersedia. Sediakan empty state dan kesempatan mengubah filter atau preferensi.
- Hanya mentor berstatus terverifikasi yang dapat ditampilkan untuk booking aktif.
- Semua sesi harus menunjukkan waktu, durasi, status, serta ketentuan yang relevan dengan jelas.
- Informasi pembayaran berbayar tidak boleh tampak lunas sebelum referensi/statusnya diverifikasi secara manual oleh pihak yang berwenang.
- Perlindungan pengguna di bawah umur, termasuk aturan akses, persetujuan, moderasi, dan eskalasi, harus ditentukan sebelum interaksi mentoring bagi kelompok usia itu diaktifkan.

### Di luar scope MVP

- Live chat atau internal messaging.
- Video conference internal.
- Matching berbasis machine learning.
- Native mobile app.
- Integrasi LMS.
- Gamifikasi kompleks.
- Course/material marketplace.
- Payment gateway, pembayaran otomatis, komisi otomatis, auto payout, atau refund otomatis.
- Verifikasi pihak ketiga otomatis.

### Asumsi layanan mentor

Pengguna dapat mengajukan diri menjadi mentor, tetapi klaim keahlian dan profil mentor harus melalui pemeriksaan/verifikasi yang sesuai sebelum ditampilkan sebagai terverifikasi. Layanan dapat dirancang sebagai gratis atau berbayar, tetapi **booking berbayar tetap nonaktif sampai mekanisme pembayaran pilot, verifikasi, pembatalan, dan penanganan masalah disepakati**.

---

## 3. STEP 2 — User Persona

**Dokumen:** `docs/STEP-2-user-persona-user-flow.md`  
**Status:** APPROVED

### Persona utama: Alya

Alya adalah persona fiktif berusia 19 tahun dan mahasiswa tahun pertama. Ia belajar mandiri melalui materi online, tetapi lebih terbantu dengan diskusi dan kesempatan bertanya. Ia ingin memahami dasar pemrograman dan menyelesaikan proyek kecil bersama orang lain.

**Kebutuhan dan kendala utama:**

- Menemukan partner atau kelompok dengan topik, target, dan jadwal yang cocok.
- Mendapatkan bimbingan mentor saat mengalami kesulitan.
- Melihat alasan rekomendasi dan menilai keahlian mentor.
- Memahami biaya, durasi, jadwal, dan ketentuan sebelum booking.
- Menyimpan hasil sesi, feedback, dan langkah belajar berikutnya.
- Merasa aman ketika berinteraksi dengan pengguna yang belum dikenal.

**Kriteria berhasil:** Alya menemukan partner/kelompok atau mentor yang relevan, menyelesaikan sesi, dan mengetahui langkah belajar selanjutnya.

Persona ini hanya titik awal desain. Pengujian tambahan dengan pelajar dari jenjang berbeda diperlukan sebelum mengambil kesimpulan bahwa kebutuhan semua pelajar sudah terwakili.

---

## 4. STEP 2 — User Flow yang Disetujui

### Flow awal

`Landing Page → Sign Up / Log In → Onboarding / Learning Profile → Dashboard`

Pada onboarding, pengguna memilih jenjang pendidikan, topik, tingkat pemahaman, tujuan, jadwal, dan preferensi belajar.

### Flow tujuan dan discovery

`Dashboard → Create / Edit Learning Goal → Discover / Recommendations`

Pengguna membuat tujuan yang konkret dan memilih dukungan yang diinginkan: partner, kelompok, mentor, atau semua pilihan. Rekomendasi menampilkan informasi dan alasan kecocokan yang relevan.

### Cabang A — partner atau kelompok

`Partner / Group Details → Connect / Join Request → Request Status → Study Session Plan & Workspace → Session Summary & Progress`

Workspace berfokus pada tujuan sesi, agenda, checklist, peserta, dan catatan. Komunikasi/video internal tidak dibangun untuk MVP; tautan eksternal dapat digunakan bila diperlukan dan disepakati peserta.

### Cabang B — mentor

`Mentor Directory → Mentor Profile & Service Details → Select Session → Booking Review → Booking Status → (Payment Instructions bila berbayar) → Mentoring Session → Session Notes & Feedback → Learning Progress`

Harga, durasi, ketersediaan, status verifikasi, dan ketentuan pembatalan harus terlihat sebelum pengguna mengajukan booking. Pembayaran berbayar mengikuti kebijakan pilot manual yang disetujui sebelum diaktifkan.

### Alur alternatif dan kondisi khusus

- Jika hasil discovery kosong, pengguna dapat mengubah topik, jadwal, tujuan, atau preferensi.
- Jika permintaan ditolak/tidak diterima, pengguna dapat membatalkan atau melihat alternatif lain.
- Jika mentor tidak tersedia atau sesi dibatalkan, status dan langkah berikutnya harus jelas.
- Jika pengguna merasa tidak aman, kontrol report/block mudah ditemukan.
- Aturan khusus untuk pengguna di bawah umur harus ditentukan dan diberlakukan sebelum mereka menggunakan interaksi mentoring yang relevan.

---

## 5. STEP 3 — Wireframe yang Disetujui

**Dokumen:** `docs/STEP-3-wireframes.md`  
**Status:** APPROVED · 18 halaman

Wireframe adalah struktur low-fidelity berbasis teks. Ia menetapkan susunan informasi, navigasi, tindakan, serta loading/empty/error/success states. Wireframe bukan spesifikasi desain visual final.

### Daftar 18 halaman

1. Landing Page.
2. Sign Up / Log In.
3. Onboarding / Learning Profile.
4. Dashboard.
5. Create / Edit Learning Goal.
6. Discover / Recommendations.
7. Partner / Group Details.
8. Request Status.
9. Study Session Plan & Workspace.
10. Mentor Directory.
11. Mentor Profile & Service Details.
12. Booking Review & Status.
13. Payment Instructions — khusus sesi berbayar.
14. Mentoring Session Details.
15. Session Summary & Feedback.
16. Learning Progress.
17. Safety, Report & Block Controls.
18. Profile & Settings.

### Navigasi utama

Pengunjung belum login dapat membuka Beranda, Cara Kerja, preview Cari Mentor, Masuk, dan Daftar. Pengguna yang sudah login memiliki akses ke Dashboard, discovery partner/kelompok, direktori mentor, tujuan, progres, sesi, profil/pengaturan, serta bantuan/pelaporan. Navigasi mobile dapat diringkas, tetapi fitur inti harus tetap mudah ditemukan.

### Prioritas wireframe

- **P0 — jalur inti:** autentikasi, onboarding, dashboard, tujuan, discovery, detail partner/kelompok, request, direktori/profil mentor, booking, workspace sesi, ringkasan/feedback, progres, dan safety/report/block.
- **P1 — sebelum paid mentoring diaktifkan:** instruksi pembayaran berdasarkan prosedur pilot yang sudah ditentukan, kebijakan pembatalan/penanganan sengketa, dan proses verifikasi mentor yang dapat diaudit.
- Landing Page, Profile & Settings, bantuan, dan kebijakan mendukung pengalaman inti.

Kontrol keselamatan dasar harus tersedia saat fitur berisiko dirilis; prioritas P1 bukan alasan untuk menunda perlindungan yang diperlukan.

---

## 6. STEP 4 — Database Schema yang Disetujui

**Dokumen:** `docs/STEP-4-database-schema.md`  
**Status:** APPROVED  
**Target:** PostgreSQL melalui Supabase  
**Jumlah tabel logis:** 23

### Daftar tabel dan perannya

| No. | Tabel | Peran utama |
|---:|---|---|
| 1 | `profiles` | Profil aplikasi yang terhubung ke Supabase Auth |
| 2 | `user_safety_settings` | Kelompok usia dan pengaturan visibilitas/privasi sensitif |
| 3 | `topics` | Katalog topik bersama untuk minat, tujuan, dan layanan mentor |
| 4 | `profile_topics` | Topik dan tingkat pemahaman/keahlian pengguna |
| 5 | `user_availability` | Pola ketersediaan mingguan untuk matching partner/kelompok |
| 6 | `learning_goals` | Tujuan belajar, mode dukungan, visibilitas, dan status |
| 7 | `study_partner_requests` | Permintaan koneksi partner |
| 8 | `study_groups` | Informasi kelompok belajar |
| 9 | `study_group_members` | Keanggotaan dan permintaan bergabung kelompok |
| 10 | `study_sessions` | Sesi terjadwal untuk partner/kelompok |
| 11 | `study_session_members` | Peserta sesi belajar |
| 12 | `study_session_checklist_items` | Agenda/checklist sesi |
| 13 | `study_session_notes` | Catatan dalam sesi belajar |
| 14 | `mentor_profiles` | Profil mentor dan status verifikasi manual |
| 15 | `mentor_services` | Jenis layanan, durasi, mode, harga, ketentuan |
| 16 | `mentor_availability_slots` | Slot jadwal mentor pada tanggal dan waktu tertentu |
| 17 | `mentor_bookings` | Booking mentor, snapshot detail layanan, serta status |
| 18 | `booking_payments` | Referensi dan status verifikasi pembayaran manual |
| 19 | `mentoring_session_summaries` | Ringkasan sesi dan langkah belajar berikutnya |
| 20 | `mentor_feedback` | Rating/feedback setelah booking selesai |
| 21 | `learning_goal_updates` | Riwayat progres tujuan belajar |
| 22 | `user_blocks` | Relasi pemblokiran antar pengguna |
| 23 | `user_reports` | Laporan keselamatan dan status penanganan |

### Relasi utama

- `auth.users` → `profiles`: satu-ke-satu.
- `profiles` ↔ `topics` melalui `profile_topics`: banyak-ke-banyak.
- `profiles` → `user_availability`, `learning_goals`, dan `study_partner_requests`: satu-ke-banyak.
- `study_groups` ↔ `profiles` melalui `study_group_members`: banyak-ke-banyak.
- `study_sessions` ↔ `profiles` melalui `study_session_members`: banyak-ke-banyak.
- `study_sessions` → checklist dan notes: satu-ke-banyak.
- `profiles` → `mentor_profiles`: satu-ke-nol/atau-satu; mentor memiliki banyak service dan slot.
- `mentor_bookings` → `booking_payments`, `mentoring_session_summaries`, dan `mentor_feedback`: masing-masing nol/atau-satu sesuai aturan schema.
- `learning_goals` → `learning_goal_updates`: satu-ke-banyak.
- `profiles` terhubung ke blokir dan laporan sebagai pihak terkait.

### Prinsip database dan keamanan

- Penamaan `snake_case`; UUID untuk entitas utama; `profiles.id` mengikuti ID Supabase Auth.
- Timestamp memakai `timestamptz`, dengan tampilan mengikuti zona waktu pengguna.
- Password/email autentikasi tidak diduplikasi pada tabel profil aplikasi.
- Jangan menyimpan detail kartu pembayaran, kredensial bank, atau dokumen identitas sensitif dalam schema MVP.
- Terapkan Supabase Row Level Security (RLS) untuk setiap tabel yang diekspos ke client; uji dengan minimal dua akun berbeda.
- Hanya pemilik, peserta, atau pihak yang berwenang dapat mengakses data sesuai perannya. Status verifikasi mentor dan status pembayaran tidak boleh diubah sendiri oleh pihak yang sedang diverifikasi/dibayar.
- Validasi transisi status, anggota kelompok, slot booking, benturan jadwal, relasi data, dan aturan blokir harus dilakukan di backend/database, bukan hanya dengan menyembunyikan tombol di UI.
- Matching menggunakan aturan yang dapat dijelaskan dari topik, skill level, tujuan, dan jadwal.
- Schema ini adalah rancangan logis; belum berupa migration SQL dan belum diterapkan pada database.

### Keputusan STEP 4 yang disetujui pengguna

1. Cakupan 23 tabel disetujui.
2. Satu katalog `topics` untuk minat pengguna, tujuan belajar, dan layanan mentor disetujui.
3. Pendekatan kelompok usia (`under_18`, `18_or_over`, `not_set`) disetujui sebagai dasar rancangan keselamatan, bukan pengganti kebijakan perlindungan anak.
4. Agenda/checklist/catatan digunakan tanpa chat internal.
5. Pembayaran hanya manual; paid booking tidak boleh diaktifkan sebelum prosedur pilot disepakati.
6. Verifikasi mentor dilakukan secara manual untuk MVP, tanpa layanan verifikasi pihak ketiga otomatis.

---

## 7. STEP 5 — Style & Mood Visual yang Disetujui

**Dokumen:** `docs/STEP-5-style-mood.md`  
**Status:** APPROVED tanpa revisi

### Mood / vibe

**Warm, Collaborative & Trustworthy** — *A supportive space to learn together.*

EduPulse harus terasa hangat, kolaboratif, fokus, dan dapat dipercaya. UI tidak boleh kekanak-kanakan, terlalu korporat, seperti feed media sosial yang ramai, atau terlalu menonjolkan visual AI.

### Palet warna resmi

| Peran | Nama | Hex | Pemakaian |
|---|---|---|---|
| Primary | Deep Teal | `#246B60` | Tombol utama, tautan penting, kontrol aktif, highlight |
| Base | Soft Off-white | `#F8FAF8` | Latar halaman |
| Accent | Warm Amber | `#F2B84B` | Badge pilihan, penanda progres, ikon kecil, highlight |
| Text utama | Deep Charcoal Green | `#20302D` | Heading, body text, teks di atas amber |
| Text sekunder | Muted Green-gray | `#5E6E68` | Deskripsi dan metadata |
| Surface | White | `#FFFFFF` | Kartu, form, panel |
| Border | Soft Gray-green | `#E1E8E4` | Pembatas halus |

### Kontras warna yang telah dicatat pada STEP 5

| Kombinasi | Rasio di dokumen STEP 5 | Arahan |
|---|---:|---|
| Deep Teal di Soft Off-white | 5.98:1 | Memenuhi acuan 4.5:1 untuk teks normal |
| Putih di Deep Teal | 6.27:1 | Label tombol primary |
| Deep Charcoal Green di Soft Off-white | 13.15:1 | Teks utama |
| Muted Green-gray di Soft Off-white | 5.13:1 | Teks sekunder |
| Deep Charcoal Green di Warm Amber | 7.71:1 | Teks pada bidang amber |

Amber tidak boleh dipakai sebagai teks kecil di atas off-white atau dengan teks putih. Jika opacity/warna berubah, kontras harus dicek kembali.

### Typography

Gunakan system sans-serif atau default Tailwind. Font custom belum diperlukan untuk MVP. Gunakan hierarki sederhana: heading, subheading, body text, dan metadata.

### Prinsip visual

- Hierarki jelas: konten utama → satu aksi utama → informasi pendukung → aksi sekunder.
- Whitespace cukup; kartu seperlunya dengan radius moderat sekitar 12–16 px dan shadow halus atau tanpa shadow.
- Komponen konsisten, termasuk button, form, chip topik, status, empty/loading/error/success states.
- Status harus memiliki label teks; jangan bergantung hanya pada warna atau ikon.
- Desain responsif untuk desktop dan mobile, dengan focus state, label form yang jelas, dan kontras memadai.
- Harga, durasi, ketersediaan, status verifikasi, ketentuan sesi, dan status pembayaran harus mudah dipahami.
- Dashboard memprioritaskan tujuan aktif dan aktivitas berikutnya, bukan kumpulan statistik.
- Hindari neon, glow, gradient berlebihan, gamifikasi/animasi berat, feed tanpa akhir, dan metrik popularitas yang tidak membantu hasil belajar.

### Referensi visual

- [Notion](https://www.notion.com/) — workspace tertata, hierarki dan whitespace.
- [Khan Academy](https://www.khanacademy.org/) — pengalaman yang learner-first dan mudah dipahami.
- [ADPList — Explore Mentors](https://adplist.org/explore) — profil mentor, informasi keahlian, dan pola discovery/booking.

Referensi ini adalah inspirasi pola, bukan template untuk disalin.

---

## 8. Arahan Teknologi untuk Konteks Mendatang

SOP Vibe Coding menetapkan arah stack berikut untuk tahap implementasi saat nanti dimulai:

- Framework: Next.js.
- UI: React.
- Bahasa: TypeScript.
- Styling: Tailwind CSS.
- Database: PostgreSQL melalui Supabase atau Neon; rancangan schema EduPulse saat ini menargetkan **Supabase**.
- Autentikasi dan kontrol akses: Supabase Auth dan RLS sesuai schema.
- Version control dan deployment publik mengikuti ketentuan SOP ketika tahap tersebut tiba.

Bagian ini hanya menyimpan konteks teknis untuk penggunaan kelak. **Tidak ada project yang disetup, kode yang dibuat, database yang diubah, atau deployment yang dilakukan dalam tahap STEP 1–5 ini.**

---

## 9. Aturan untuk AI / Coding Agent di Sesi Berikutnya

1. Baca `coldstart.md` dan dokumen STEP yang dirujuk sebelum memberi saran arsitektur atau implementasi.
2. Ikuti scope MVP EduPulse yang sudah approved; jangan menambahkan fitur tanpa approval eksplisit.
3. Jangan memasukkan chat internal, video conference internal, ML matching, payment gateway/auto payout/refund, atau verifikasi pihak ketiga otomatis tanpa perubahan scope yang disetujui.
4. Pertahankan transparansi harga, layanan, jadwal, booking, pembayaran manual, dan pembatalan.
5. Terapkan RLS dan validasi akses/relasi/status di backend; rahasia server tidak boleh dikirim ke browser.
6. Perlindungan pengguna di bawah umur harus menjadi syarat peluncuran, bukan pekerjaan opsional setelah mentoring aktif.
7. Jaga arah visual Warm, Collaborative & Trustworthy dan palet warna yang telah approved.
8. Jika perubahan berdampak pada schema, keamanan, arsitektur inti, atau scope produk, jelaskan konsekuensinya lalu minta approval sebelum mengubah.
9. Perbarui `coldstart.md` setelah keputusan baru disetujui.
10. **Jangan mulai STEP 6 kecuali pengguna secara eksplisit meminta untuk melanjutkan sesuai SOP.**

---

## 10. Dokumen Terkait

- `docs/STEP-2-user-persona-user-flow.md`
- `docs/STEP-3-wireframes.md`
- `docs/STEP-4-database-schema.md`
- `docs/STEP-5-style-mood.md`

PRD yang dirujuk oleh dokumen kerja ini adalah EduPulse PRD v1.2. Isi ringkasan PRD di atas diambil dari fitur, alur, scope, dan aturan yang tercatat pada dokumen STEP 2–5 yang merujuk PRD tersebut.

---

**Status akhir:** STEP 1–5 APPROVED. `coldstart.md` sudah disusun sebagai titik awal rujukan proyek. **STEP 6 belum dimulai.**
