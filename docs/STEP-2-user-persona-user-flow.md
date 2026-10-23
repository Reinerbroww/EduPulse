# EduPulse — STEP 2: User Persona & User Flow

**Dokumen:** User Persona & User Flow  
**Produk:** EduPulse  
**Referensi PRD:** EduPulse PRD v1.2  
**Tahap SOP:** STEP 2 — User Persona & User Flow  
**Status:** Draft — menunggu approval

---

## 1. Tujuan Dokumen

Dokumen ini menerjemahkan PRD EduPulse menjadi gambaran pengguna utama dan alur penggunaan inti. Dokumen menjadi acuan untuk menyusun wireframe pada STEP 3.

Sesuai PRD, EduPulse ditujukan untuk semua pelajar sejak awal, menyediakan study matching, kelompok belajar, pencarian dan pemesanan mentor, progres belajar, serta perlindungan pengguna. Persona di bawah adalah **persona utama untuk merancang MVP**, bukan representasi seluruh pelajar.

## 2. User Persona Utama

### Alya — Pelajar yang Ingin Belajar Bersama dan Mendapatkan Bimbingan

| Aspek | Deskripsi |
|---|---|
| Nama | Alya (persona fiktif) |
| Usia | 19 tahun |
| Status | Mahasiswa tahun pertama |
| Kebiasaan belajar | Belajar mandiri melalui materi online, tetapi lebih terbantu ketika bisa berdiskusi dan bertanya kepada orang lain |
| Tujuan | Memahami materi pemrograman dasar dan menyelesaikan proyek kecil bersama orang lain |
| Kebutuhan utama | Menemukan partner atau kelompok belajar yang cocok berdasarkan topik, tujuan, dan jadwal; mendapatkan bimbingan ketika mengalami kesulitan |
| Masalah utama | Sulit menemukan partner yang konsisten; teman yang tersedia belum tentu memiliki tujuan atau jadwal yang cocok; belum tahu cara memilih mentor yang tepat |
| Motivasi | Ingin lebih memahami materi, menyelesaikan target belajar, dan membangun kebiasaan belajar yang konsisten |
| Hambatan | Waktu terbatas, ragu menghubungi orang yang belum dikenal, serta perlu mengetahui dengan jelas biaya dan ekspektasi sebelum memesan sesi mentor |
| Kriteria keberhasilan | Berhasil menemukan partner/kelompok yang cocok atau mentor yang relevan, menyelesaikan sesi belajar, dan mengetahui langkah belajar berikutnya |

### Kebutuhan yang Harus Dijawab Produk

1. Membantu Alya menyatakan apa yang ingin dipelajari, tingkat pemahaman, dan jadwal yang tersedia.
2. Menampilkan rekomendasi partner atau kelompok beserta alasan kecocokannya.
3. Memungkinkan Alya menemukan mentor berdasarkan topik, keahlian, jadwal, jenis sesi, dan harga.
4. Menjelaskan detail sesi dan status pemesanan secara transparan.
5. Menyimpan tujuan, catatan sesi, feedback, dan langkah belajar berikutnya.
6. Menyediakan cara untuk melaporkan atau memblokir pengguna serta menampilkan informasi kepercayaan dan keamanan yang relevan.

### Batasan Persona

Alya dipakai sebagai persona utama untuk merancang alur MVP. Karena EduPulse ditujukan kepada siswa, mahasiswa, dan pelajar mandiri, rancangan perlu diuji lagi kepada pengguna dari jenjang berbeda. Alur untuk pengguna di bawah umur harus mengikuti aturan keamanan dan perlindungan yang sesuai sebelum fitur komunikasi atau mentoring digunakan.

---

## 3. User Flow Utama: Dari Mendaftar hingga Mencapai Tujuan Belajar

**Tujuan flow:** Pengguna baru menemukan pengalaman belajar yang sesuai — baik melalui partner/kelompok belajar maupun mentoring — lalu menyelesaikan sesi dan mencatat progresnya.

### A. Masuk dan Mengatur Profil

1. **Landing Page** — Pengguna membuka EduPulse dan memahami manfaat utama: menemukan partner belajar, kelompok, atau mentor.
2. **Sign Up / Log In** — Pengguna membuat akun atau masuk menggunakan metode autentikasi yang tersedia.
3. **Onboarding / Learning Profile** — Pengguna memilih jenjang pendidikan, topik yang diminati, tingkat pemahaman, tujuan belajar, jadwal, dan preferensi belajar.
4. **Dashboard** — Pengguna melihat ringkasan tujuan belajar, rekomendasi, kelompok, sesi mentoring, dan aktivitas berikutnya.

### B. Menentukan Cara Belajar

5. **Create Learning Goal** — Pengguna memasukkan tujuan yang konkret, misalnya “memahami dasar Python dan menyelesaikan latihan dalam dua minggu”. Pengguna dapat memilih mencari partner, bergabung dengan kelompok, mencari mentor, atau melihat semua pilihan.
6. **Recommendations / Discover** — EduPulse menampilkan rekomendasi berdasarkan topik, tujuan, jadwal, preferensi, serta kecocokan kemampuan jika tersedia. Alasan rekomendasi ditampilkan agar pengguna dapat menilai hasilnya.

### C1. Cabang A — Mencari Partner atau Kelompok Belajar

7. **Study Partner / Group Details** — Pengguna membuka profil partner atau detail kelompok, memeriksa tujuan, topik, jadwal, dan ekspektasi partisipasi.
8. **Connect / Join Request** — Pengguna mengirim permintaan koneksi atau permintaan bergabung ke kelompok.
9. **Request Status** — Pengguna melihat apakah permintaan menunggu, diterima, atau ditolak. Setelah diterima, pengguna dapat melihat informasi sesi yang disepakati.
10. **Study Session Plan** — Anggota menyepakati target, jadwal, dan agenda sesi belajar.
11. **Study Session Workspace** — Pengguna menggunakan checklist, tujuan sesi, dan catatan bersama untuk menjalankan sesi. MVP tidak membutuhkan video conference atau live chat internal.
12. **Session Summary & Progress** — Pengguna menyimpan hasil sesi, memperbarui target bersama, dan menentukan langkah berikutnya.

### C2. Cabang B — Mencari dan Memesan Mentor

7. **Mentor Directory** — Pengguna mencari mentor berdasarkan topik, keahlian, pengalaman, ketersediaan, jenis sesi, dan harga.
8. **Mentor Profile & Service Details** — Pengguna meninjau profil, informasi keahlian/verifikasi, deskripsi layanan, durasi, jadwal, harga, dan kebijakan sesi yang tersedia.
9. **Select Session** — Pengguna memilih sesi gratis atau berbayar dan menentukan tujuan atau pertanyaan yang ingin dibahas.
10. **Booking Review** — Pengguna memeriksa kembali mentor, waktu, durasi, tujuan, harga, dan ketentuan pembatalan sebelum mengajukan pemesanan.
11. **Booking Status** — Pengguna melihat status permintaan, misalnya menunggu konfirmasi, diterima, ditolak, atau dibatalkan.
12. **Payment Instructions — hanya jika berbayar** — Jika sesi berbayar, harga dan instruksi pembayaran yang berlaku untuk pilot harus ditampilkan secara transparan. **Pembayaran otomatis, pencairan dana, komisi otomatis, dan refund otomatis tidak termasuk MVP.** Pemesanan berbayar tidak boleh ditampilkan sebagai lunas sebelum mekanisme pembayaran pilot ditentukan dan statusnya diverifikasi.
13. **Mentoring Session** — Setelah jadwal dan persyaratan sesi terpenuhi, pengguna mengikuti sesi sesuai metode yang disepakati. MVP dapat menggunakan tautan pertemuan eksternal bila diperlukan; fitur video conference internal tidak dibangun.
14. **Session Notes & Feedback** — Pengguna meninjau catatan, feedback mentor, dan rekomendasi langkah berikutnya. Pengguna dapat memberikan penilaian atau melaporkan masalah.
15. **Learning Progress** — Pengguna melihat riwayat mentoring dan memperbarui progres tujuan belajar.

### D. Alur Alternatif dan Kondisi Khusus

- **Tidak ada rekomendasi yang cocok:** pengguna dapat mengubah topik, jadwal, tujuan, atau preferensi lalu mencoba pencarian kembali.
- **Permintaan tidak diterima:** pengguna dapat membatalkan permintaan atau melihat alternatif lain.
- **Mentor tidak tersedia:** pengguna dapat memilih jadwal berbeda atau mentor lain.
- **Sesi dibatalkan:** status dan informasi langkah berikutnya ditampilkan secara jelas sesuai kebijakan yang berlaku.
- **Pengguna merasa tidak aman:** pengguna dapat melaporkan atau memblokir akun melalui kontrol yang mudah ditemukan.
- **Pengguna di bawah umur:** akses, interaksi, dan mekanisme persetujuan harus mengikuti kebijakan keselamatan yang ditetapkan sebelum peluncuran kepada kelompok usia tersebut.

---

## 4. Halaman yang Dibutuhkan Berdasarkan Flow

| Halaman | Tujuan utama | Elemen penting |
|---|---|---|
| Landing Page | Menjelaskan nilai EduPulse | Ringkasan manfaat, CTA daftar/masuk, cara kerja |
| Sign Up / Log In | Autentikasi pengguna | Form autentikasi, validasi, bantuan saat gagal |
| Onboarding / Learning Profile | Mengumpulkan kebutuhan belajar | Jenjang, topik, tujuan, tingkat pemahaman, jadwal, preferensi |
| Dashboard | Menjadi pusat aktivitas | Tujuan aktif, rekomendasi, kelompok, pemesanan, aktivitas berikutnya |
| Create Learning Goal | Membuat tujuan belajar | Topik, target, tenggat opsional, pilihan cara belajar |
| Discover / Recommendations | Menemukan opsi yang cocok | Kartu partner, kelompok, mentor; filter; alasan rekomendasi |
| Partner / Group Details | Mengevaluasi kecocokan | Tujuan, topik, jadwal, anggota atau informasi kelompok, tombol koneksi/gabung |
| Mentor Directory | Menemukan mentor | Pencarian, filter, topik, ketersediaan, harga |
| Mentor Profile & Service Details | Menilai mentor dan layanan | Keahlian, pengalaman, status verifikasi, layanan, jadwal, harga, ketentuan |
| Booking Review & Status | Mengajukan dan memantau pemesanan | Rincian sesi, harga bila berbayar, status, pembatalan |
| Payment Instructions | Menjelaskan pembayaran sesi berbayar selama pilot | Harga, instruksi yang disetujui, status verifikasi; tanpa pembayaran otomatis |
| Study Session Workspace | Menjalankan sesi kelompok | Tujuan, agenda, checklist, catatan, anggota |
| Mentoring Session Details | Menampilkan informasi sesi mentor | Jadwal, tujuan, tautan pertemuan eksternal bila digunakan, status |
| Session Summary & Feedback | Mendokumentasikan hasil | Catatan, feedback, rating, langkah selanjutnya, pelaporan |
| Learning Progress | Melihat perkembangan belajar | Tujuan, riwayat sesi, milestone, langkah berikutnya |
| Safety / Report Controls | Menjaga keamanan interaksi | Laporkan, blokir, alasan laporan, konfirmasi tindakan |

---

## 5. Asumsi yang Perlu Dikonfirmasi

1. **Peluncuran untuk semua pelajar:** produk ditujukan ke berbagai jenjang, tetapi perlu pengujian dan perlindungan khusus untuk pengguna di bawah umur.
2. **Mentor:** semua pengguna dapat mengajukan diri sebagai mentor, tetapi profil dan klaim keahliannya perlu melalui pemeriksaan atau verifikasi yang sesuai sebelum ditampilkan sebagai terverifikasi.
3. **Mentoring berbayar:** MVP menyimpan detail layanan dan pemesanan, tetapi tidak menyediakan sistem pembayaran otomatis. Alur pembayaran pilot harus disepakati sebelum transaksi nyata.
4. **Komunikasi:** MVP menggunakan jadwal, catatan, dan tautan eksternal bila diperlukan; video conference dan live chat internal berada di luar scope.
5. **Matching:** versi awal menggunakan aturan dan skor yang dapat dijelaskan, bukan machine learning.
6. **Persona:** Alya merupakan persona utama untuk rancangan awal. Persona tambahan dapat dibuat setelah wawancara pengguna, bukan diasumsikan sebagai hasil riset.

## 6. Kriteria Review dan Approval STEP 2

- [ ] Persona utama sesuai dengan masalah dan target EduPulse.
- [ ] Alur pencarian partner/kelompok sudah masuk akal.
- [ ] Alur pencarian dan pemesanan mentoring gratis/berbayar sudah jelas.
- [ ] Halaman yang dibutuhkan cukup untuk membangun MVP.
- [ ] Asumsi dan batasan MVP sudah dipahami.

**Keputusan:** Menunggu approval pengguna sebelum melanjutkan ke STEP 3 — Wireframe.

---

*Dokumen ini merupakan rancangan awal berdasarkan PRD EduPulse v1.2. Detail yang belum divalidasi dengan calon pengguna dicatat sebagai asumsi, bukan fakta hasil riset.*
