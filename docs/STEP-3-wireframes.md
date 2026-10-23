# EduPulse — STEP 3: Wireframe

**Dokumen:** Struktur Wireframe Berbasis Teks  
**Produk:** EduPulse  
**Referensi:** PRD EduPulse v1.2 dan STEP 2 — User Persona & User Flow  
**Tahap SOP:** STEP 3 — Buat Wireframe  
**Status:** Draft — menunggu approval

---

## 1. Tujuan dan Batasan

Dokumen ini mendeskripsikan struktur kasar setiap halaman EduPulse dalam bentuk teks. Fokusnya adalah susunan elemen, informasi, tombol, navigasi, dan kondisi antarmuka — bukan warna, tipografi, ilustrasi, atau desain visual final.

Wireframe mengikuti fitur MVP yang disetujui:

1. Smart Study Matching.
2. Study Groups & Shared Goals.
3. Mentor Discovery & Booking.
4. Structured Mentoring & Learning Progress.
5. Trust, Safety & Service Management.

### Prinsip wireframe

- Pengguna harus memahami tindakan utama pada setiap halaman.
- Rekomendasi partner, kelompok, dan mentor perlu menampilkan alasan kecocokan, bukan hanya skor.
- Harga serta status sesi gratis/berbayar harus jelas sebelum pemesanan diajukan.
- Tampilan harus responsif untuk desktop dan mobile.
- Sediakan tampilan loading, kosong, gagal, dan sukses untuk alur penting.
- Jangan menambahkan live chat atau video conference internal; keduanya berada di luar scope MVP.
- Alur untuk pengguna di bawah umur harus dilengkapi kebijakan perlindungan yang sesuai sebelum interaksi dengan mentor diaktifkan.

## 2. Struktur Navigasi Utama

### Pengunjung belum login

- Beranda
- Cara Kerja
- Cari Mentor (preview terbatas; tindakan untuk booking meminta login)
- Masuk
- Daftar

### Pengguna yang sudah login

- Dashboard
- Temukan Partner / Kelompok
- Temukan Mentor
- Tujuan Belajar
- Progres Belajar
- Sesi Saya
- Profil dan Pengaturan
- Pusat Bantuan / Laporkan Masalah

**Catatan:** Pada mobile, navigasi utama dapat diringkas menjadi menu atau bottom navigation. Label dan struktur navigasi bisa disesuaikan setelah wireframe disetujui, tetapi semua fungsi inti harus tetap mudah ditemukan.

## 3. Wireframe Per Halaman

## Halaman 1 — Landing Page

**Tujuan:** Menjelaskan EduPulse dan mengarahkan pengunjung untuk mulai belajar.

```text
┌────────────────────────────────────────────────────────────────────┐
│ EduPulse        Cara Kerja     Cari Mentor       Masuk   [Daftar]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Temukan teman belajar dan mentor yang tepat                        │
│ Belajar bersama dengan tujuan yang jelas.                           │
│                                                                    │
│ [Mulai Belajar]                 [Jelajahi Mentor]                   │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│ CARA KERJA                                                         │
│ [1. Tentukan Tujuan] [2. Temukan Partner/Mentor] [3. Belajar]     │
├────────────────────────────────────────────────────────────────────┤
│ PILIH CARA BELAJAR                                                  │
│ [Temukan Partner] [Gabung Kelompok] [Cari Mentor]                  │
├────────────────────────────────────────────────────────────────────┤
│ MENTOR PILIHAN (opsional, data nyata yang tersedia saja)            │
│ [Kartu Mentor] [Kartu Mentor] [Lihat Semua Mentor]                  │
├────────────────────────────────────────────────────────────────────┤
│ FAQ singkat | Bantuan | Privasi | Ketentuan | Keamanan              │
└────────────────────────────────────────────────────────────────────┘
```

**Elemen utama:** identitas EduPulse, headline dan deskripsi manfaat, CTA daftar, CTA menjelajah mentor, cara kerja singkat, pilihan cara belajar, area mentor pilihan bila tersedia, dan tautan kebijakan.

**Aksi:** `Mulai Belajar` → daftar/masuk; `Jelajahi Mentor` → direktori mentor; pilihan cara belajar → masuk atau lanjut ke alur yang relevan.

**Kondisi:** jika belum ada mentor aktif, jangan tampilkan kartu palsu; tampilkan penjelasan bahwa direktori sedang disiapkan.

## Halaman 2 — Sign Up / Log In

**Tujuan:** Membuat akun atau masuk dengan alur yang sederhana.

```text
┌────────────────────────────────────────────┐
│ EduPulse                     [Kembali]      │
├────────────────────────────────────────────┤
│ [Masuk] [Daftar]                            │
│                                            │
│ Email                                      │
│ [______________________________________]   │
│ Kata sandi                                 │
│ [______________________________________]   │
│ [Lupa kata sandi?]                         │
│                                            │
│ [Masuk / Buat Akun]                        │
│                                            │
│ Pesan validasi / bantuan                   │
│ Tautan Ketentuan dan Privasi               │
└────────────────────────────────────────────┘
```

**Elemen utama:** pilihan masuk/daftar, email, kata sandi, tombol submit, tautan pemulihan kata sandi, pesan validasi, dan tautan kebijakan.

**Aksi:** pendaftaran sukses → onboarding; login sukses → dashboard atau halaman tujuan semula.

**Kondisi:** email tidak valid, kata sandi salah, akun belum terkonfirmasi, jaringan gagal, atau sesi berakhir. Pesan error harus membantu pengguna tanpa membocorkan informasi sensitif.

## Halaman 3 — Onboarding / Learning Profile

**Tujuan:** Mengumpulkan informasi minimum yang diperlukan untuk rekomendasi yang relevan.

```text
┌────────────────────────────────────────────────────────────────┐
│ EduPulse                         Langkah 1 dari 3     [Lewati*] │
├────────────────────────────────────────────────────────────────┤
│ Kenali cara belajarmu                                           │
│                                                                │
│ Nama tampilan        [______________________________]          │
│ Jenjang pendidikan   [Pilih jenjang v]                          │
│ Topik yang diminati  [Cari dan pilih topik...]                  │
│ Tingkat pemahaman    [Pemula] [Menengah] [Mahir]                │
│                                                                │
│ Tujuan belajar      [_______________________________]          │
│ Contoh: memahami dasar Python dalam dua minggu                  │
│                                                                │
│ Hari tersedia       [Sen] [Sel] [Rab] [Kam] [Jum] [Sab] [Min]  │
│ Waktu tersedia      [Pagi] [Siang] [Malam]                      │
│ Preferensi          [1:1] [Kelompok] [Mentoring] [Semua]        │
│                                                                │
│ [Kembali]                                     [Simpan & Lanjut] │
└────────────────────────────────────────────────────────────────┘
```

**Elemen utama:** nama tampilan, jenjang, topik, tingkat pemahaman, tujuan belajar, jadwal, preferensi, indikator langkah, dan tombol lanjut.

**Aksi:** menyimpan profil → dashboard; pengguna dapat melengkapi informasi yang belum wajib dari pengaturan jika sesuai aturan produk.

**Kondisi dan catatan:** minta data minimum saja. Jangan meminta alamat rumah atau informasi sensitif yang tidak diperlukan. Jika produk menerima pengguna di bawah umur, tampilkan penjelasan dan mekanisme perlindungan yang sudah ditentukan.

## Halaman 4 — Dashboard

**Tujuan:** Menjadi titik awal bagi pengguna untuk melanjutkan aktivitas belajar.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ EduPulse    Dashboard  Temukan  Mentor  Progres       [Profil v]      │
├──────────────────────────────────────────────────────────────────────┤
│ Halo, [Nama]                                                         │
│ Apa yang ingin kamu pelajari berikutnya?                             │
│ [+ Buat Tujuan Belajar]                                              │
├──────────────────────────────────────────────────────────────────────┤
│ TUJUAN BELAJAR AKTIF                                                  │
│ [Topik]  [Target]  [Progres]  [Lanjutkan]                            │
├──────────────────────────────────────────────────────────────────────┤
│ REKOMENDASI UNTUKMU                                                  │
│ [Partner/Kelompok] [Alasan cocok] [Lihat]                            │
│ [Mentor]           [Topik, jadwal, harga] [Lihat]                    │
├──────────────────────────────────────────────────────────────────────┤
│ SESI BERIKUTNYA                                                      │
│ [Tanggal/Jam] [Nama/kelompok] [Status] [Lihat Detail]                │
├──────────────────────────────────────────────────────────────────────┤
│ AKTIVITAS TERBARU                                                    │
│ [Permintaan diterima / ringkasan sesi / target selesai]              │
└──────────────────────────────────────────────────────────────────────┘
```

**Elemen utama:** sapaan, pembuatan tujuan, tujuan aktif, rekomendasi partner/kelompok/mentor, sesi mendatang, aktivitas terbaru, dan tautan cepat.

**Aksi:** buat tujuan, telusuri rekomendasi, buka sesi berikutnya, atau lihat progres.

**Kondisi:** dashboard pengguna baru menampilkan langkah awal yang jelas; jika tidak ada rekomendasi, tawarkan ubah preferensi atau cari secara manual.

## Halaman 5 — Create / Edit Learning Goal

**Tujuan:** Membantu pengguna menetapkan target belajar yang konkret.

```text
┌─────────────────────────────────────────────────────────────┐
│ Buat Tujuan Belajar                         [Kembali]       │
├─────────────────────────────────────────────────────────────┤
│ Apa yang ingin kamu pelajari?                                │
│ Topik                 [_______________________________]     │
│ Target spesifik       [_______________________________]     │
│ Contoh: mampu membuat program Python sederhana               │
│ Tingkat saat ini      [Pemula v]                             │
│ Target waktu          [Tanggal opsional]                     │
│                                                              │
│ Cara belajar yang dicari                                     │
│ [Partner] [Kelompok] [Mentor] [Belum yakin]                  │
│ Jadwal pilihan        [Pilih hari dan waktu]                 │
│                                                              │
│ [Batal]                                  [Simpan Tujuan]     │
└─────────────────────────────────────────────────────────────┘
```

**Elemen utama:** topik, hasil yang ingin dicapai, tingkat saat ini, tanggal target opsional, cara belajar, dan jadwal.

**Aksi:** simpan tujuan → halaman rekomendasi dengan filter awal berdasarkan tujuan tersebut.

**Validasi:** topik dan target harus cukup jelas untuk dipakai pada matching; tanggal target bersifat opsional.

## Halaman 6 — Discover / Recommendations

**Tujuan:** Menampilkan partner, kelompok, dan mentor yang relevan serta menjelaskan alasan rekomendasinya.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Temukan Partner, Kelompok, atau Mentor                               │
├──────────────────────────────────────────────────────────────────────┤
│ [Partner] [Kelompok] [Mentor]                                        │
│ Cari topik [____________________] [Filter] [Urutkan v]               │
│ Filter: tujuan | jadwal | level | online | jenis sesi | harga        │
├──────────────────────────────────────────────────────────────────────┤
│ HASIL                                                                 │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Nama / Nama Kelompok                                              │ │
│ │ Topik • Tujuan • Jadwal                                           │ │
│ │ Alasan cocok: tujuan sama, jadwal sesuai                          │ │
│ │ [Lihat Detail]                                     [Simpan]       │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ [Kartu hasil lainnya...]                                             │
│ [Muat Lagi]                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

**Elemen utama:** tab jenis hasil, pencarian, filter, pengurutan, kartu hasil, alasan kecocokan, tombol detail, dan simpan opsional.

**Aksi:** buka detail partner/kelompok/mentor; ubah filter; buat tujuan baru jika belum ada.

**Kondisi:** tampilkan loading, hasil kosong, dan error. Saat hasil kosong, berikan saran filter apa yang dapat dilonggarkan. Jangan menampilkan persentase kecocokan kecuali skor tersebut benar-benar dihitung dan dijelaskan.

## Halaman 7 — Partner / Group Details

**Tujuan:** Membantu pengguna mengevaluasi partner atau kelompok sebelum mengirim permintaan.

```text
┌─────────────────────────────────────────────────────────────┐
│ [Kembali ke Hasil]                                          │
├─────────────────────────────────────────────────────────────┤
│ Nama partner / nama kelompok                                │
│ Topik utama • Tingkat • Format belajar                      │
│                                                              │
│ Tentang tujuan belajar                                      │
│ [Deskripsi tujuan dan target]                               │
│                                                              │
│ Jadwal yang tersedia                                        │
│ [Hari / waktu]                                              │
│                                                              │
│ Untuk kelompok: anggota, kapasitas, dan target kelompok      │
│ Untuk partner: topik yang dikuasai dan ingin dipelajari      │
│                                                              │
│ Mengapa direkomendasikan                                    │
│ [Topik cocok] [Tujuan cocok] [Jadwal cocok]                 │
│                                                              │
│ [Laporkan] [Blokir]                   [Kirim Permintaan]     │
└─────────────────────────────────────────────────────────────┘
```

**Elemen utama:** informasi tujuan, topik, jadwal, detail partner/kelompok, alasan rekomendasi, kontrol keselamatan, serta tombol koneksi atau bergabung.

**Aksi:** kirim permintaan → layar konfirmasi dan status permintaan.

**Kondisi:** jika kelompok penuh atau permintaan tidak lagi tersedia, beri tahu pengguna dan arahkan kembali ke hasil pencarian.

## Halaman 8 — Request Status

**Tujuan:** Menampilkan status permintaan koneksi atau gabung kelompok.

```text
┌───────────────────────────────────────────────────────────┐
│ Permintaan Saya                                            │
├───────────────────────────────────────────────────────────┤
│ [Menunggu / Diterima / Ditolak / Dibatalkan]               │
│ Nama partner/kelompok                                      │
│ Tanggal permintaan                                         │
│ Pesan / tujuan belajar                                     │
│                                                           │
│ Jika menunggu: [Batalkan Permintaan]                       │
│ Jika diterima: [Atur Sesi Belajar]                        │
│ Jika ditolak: [Kembali ke Rekomendasi]                    │
└───────────────────────────────────────────────────────────┘
```

**Elemen utama:** status yang mudah terlihat, objek permintaan, tanggal, tujuan singkat, dan tombol aksi sesuai status.

**Catatan:** status harus berasal dari data backend. Jangan menampilkan permintaan sebagai diterima sebelum pihak terkait menyetujuinya.

## Halaman 9 — Study Session Plan & Workspace

**Tujuan:** Membantu kelompok menyepakati agenda dan mencatat hasil sesi tanpa membangun chat atau video conference internal.

```text
┌────────────────────────────────────────────────────────────────┐
│ Kelompok: [Nama]                       [Detail Kelompok]        │
├────────────────────────────────────────────────────────────────┤
│ SESI BELAJAR                                                    │
│ Topik sesi             [____________________________]           │
│ Tanggal dan waktu      [Pilih tanggal/jam]                      │
│ Target sesi            [____________________________]           │
│ Agenda                 [Tambah poin agenda +]                   │
│                                                                │
│ CHECKLIST SESI                                                  │
│ [ ] Target 1   Penanggung jawab (opsional)                      │
│ [ ] Target 2                                                    │
│ [ + Tambah tugas ]                                              │
│                                                                │
│ CATATAN BERSAMA                                                 │
│ [Area teks untuk poin penting dan hasil diskusi]                │
│                                                                │
│ [Simpan Draft] [Tandai Sesi Selesai] [Laporkan Masalah]        │
└────────────────────────────────────────────────────────────────┘
```

**Elemen utama:** tujuan dan jadwal sesi, agenda, checklist, catatan bersama, simpan, tandai selesai, dan laporan.

**Aksi:** anggota menyiapkan agenda, memperbarui checklist, menyimpan catatan, dan menutup sesi dengan ringkasan.

**Kondisi:** tampilkan siapa yang terakhir mengubah catatan dan waktu penyimpanan bila memungkinkan. Hindari konflik dengan memberi pesan jika penyimpanan gagal.

## Halaman 10 — Mentor Directory

**Tujuan:** Membantu pengguna menemukan mentor sesuai kebutuhan dan kemampuan biaya.

```text
┌───────────────────────────────────────────────────────────────────┐
│ Temukan Mentor                                                     │
├───────────────────────────────────────────────────────────────────┤
│ Cari nama atau keahlian [________________________] [Cari]         │
│ Filter: topik | jadwal | pengalaman | gratis/berbayar | format    │
├───────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ [Foto/avatar] Nama Mentor             [Terverifikasi*]        │ │
│ │ Keahlian • pengalaman • bahasa                                 │ │
│ │ Jenis sesi: 1:1 / kelompok                                    │ │
│ │ Harga: Gratis / Rp... per sesi                                │ │
│ │ Jadwal terdekat: ...                                           │ │
│ │ [Lihat Profil]                                                 │ │
│ └───────────────────────────────────────────────────────────────┘ │
│ [Kartu mentor lainnya...]                                         │
└───────────────────────────────────────────────────────────────────┘
```

**Elemen utama:** pencarian, filter, kartu mentor, keahlian, status verifikasi yang benar-benar telah diperiksa, jenis sesi, harga, jadwal, dan tombol profil.

**Aksi:** pilih kartu → profil mentor dan layanan.

**Kondisi:** beri hasil kosong yang membantu. Jangan menyatakan keahlian atau identitas telah diverifikasi jika proses verifikasi belum selesai.

## Halaman 11 — Mentor Profile & Service Details

**Tujuan:** Memberi informasi yang cukup agar pengguna bisa memilih mentor dan layanan dengan sadar.

```text
┌─────────────────────────────────────────────────────────────┐
│ [Kembali ke Direktori]                                      │
├─────────────────────────────────────────────────────────────┤
│ [Avatar] Nama Mentor        Status verifikasi bila ada       │
│ Bidang keahlian • ringkasan pengalaman • bahasa             │
│ Tentang mentor                                               │
│ Bukti/portofolio keahlian (opsional, jika tersedia)          │
├─────────────────────────────────────────────────────────────┤
│ LAYANAN YANG DITAWARKAN                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Nama sesi                                                │ │
│ │ Tujuan dan cakupan                                       │ │
│ │ Durasi • format • gratis/berbayar • harga                │ │
│ │ Jadwal yang tersedia                                     │ │
│ │ [Pilih Sesi]                                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Ketentuan pembatalan dan ekspektasi sesi                     │
│ [Laporkan Profil] [Blokir]                                  │
└─────────────────────────────────────────────────────────────┘
```

**Elemen utama:** profil, keahlian, indikator verifikasi yang akurat, layanan, durasi, format, jadwal, harga, ketentuan pembatalan, dan kontrol keselamatan.

**Aksi:** pilih layanan → form pemesanan.

**Catatan:** klaim keahlian dan badge verifikasi perlu didukung proses yang jelas. Ulasan hanya ditampilkan bila berasal dari sesi yang valid.

## Halaman 12 — Booking Review & Status

**Tujuan:** Mengumpulkan kebutuhan mentoring dan memastikan pengguna memahami detail sebelum mengirim pemesanan.

```text
┌─────────────────────────────────────────────────────────────┐
│ Pesan Sesi Mentoring                                        │
├─────────────────────────────────────────────────────────────┤
│ Mentor dan nama layanan                                     │
│ Tujuan belajar / pertanyaan yang ingin dibahas               │
│ [____________________________________________________]       │
│ Pilih jadwal              [Tanggal v] [Waktu v]              │
│ Durasi                   [Durasi layanan]                   │
│ Format sesi              [Pilihan yang tersedia]             │
├─────────────────────────────────────────────────────────────┤
│ RINGKASAN                                                    │
│ Biaya sesi               Gratis / Rp...                     │
│ Ketentuan pembatalan     [Lihat ketentuan]                  │
│ [ ] Saya memahami detail dan ketentuan pemesanan             │
│                                                             │
│ [Kembali]                         [Kirim Permintaan Booking] │
└─────────────────────────────────────────────────────────────┘
```

Setelah submit, halaman status menampilkan:

```text
┌─────────────────────────────────────────────────────────────┐
│ Status Pemesanan: [Menunggu / Diterima / Ditolak / ...]      │
│ Mentor • Layanan • Jadwal • Durasi • Harga                  │
│ Tujuan sesi                                                  │
│ Langkah berikutnya                                           │
│ [Batalkan Permintaan jika diizinkan] [Lihat Detail Sesi]     │
└─────────────────────────────────────────────────────────────┘
```

**Elemen utama:** tujuan, tanggal/waktu, detail layanan, harga, ketentuan, persetujuan, status, dan langkah berikutnya.

**Kondisi:** cegah pemesanan ganda karena klik berulang. Jika slot tidak tersedia lagi, minta pengguna memilih jadwal lain. Jelaskan bila permintaan masih menunggu konfirmasi mentor.

## Halaman 13 — Payment Instructions (Khusus Sesi Berbayar)

**Tujuan:** Menampilkan harga dan instruksi pembayaran pilot secara transparan tanpa mengklaim tersedianya payment gateway otomatis.

```text
┌─────────────────────────────────────────────────────────────┐
│ Detail Pembayaran Sesi                                      │
├─────────────────────────────────────────────────────────────┤
│ Mentor / layanan / jadwal                                   │
│ Total biaya: Rp...                                          │
│ Status: Menunggu pembayaran / Menunggu verifikasi / Terverifikasi │
│                                                             │
│ Instruksi pembayaran pilot yang telah disetujui             │
│ [Instruksi yang berlaku]                                    │
│ Referensi pembayaran (jika digunakan)                       │
│ [Unggah bukti jika alur pilot mensyaratkannya]              │
│                                                             │
│ [Kembali ke Booking] [Lihat Status]                         │
│ Bantuan / Laporkan masalah pembayaran                       │
└─────────────────────────────────────────────────────────────┘
```

**Penting:** wireframe ini tidak menetapkan metode pembayaran tertentu. Sebelum mengaktifkan pembayaran nyata, pemilik produk harus menentukan metode pilot, siapa yang memverifikasi, batas waktu, pembatalan, penanganan sengketa, dan kebijakan refund. Jangan meminta data kartu atau kredensial finansial sensitif. Jangan menandai transaksi sebagai lunas sebelum status diverifikasi.

## Halaman 14 — Mentoring Session Details

**Tujuan:** Menjadi halaman pusat informasi sesi mentor yang telah dikonfirmasi.

```text
┌─────────────────────────────────────────────────────────────┐
│ Detail Sesi Mentoring                                       │
├─────────────────────────────────────────────────────────────┤
│ Mentor • nama layanan • status sesi                         │
│ Tanggal • waktu • durasi • zona waktu                       │
│ Tujuan dan pertanyaan yang disiapkan                        │
│                                                             │
│ Cara mengikuti sesi                                         │
│ [Tautan eksternal jika sudah disepakati dan tersedia]        │
│                                                             │
│ Persiapan sebelum sesi                                      │
│ [Checklist / materi yang perlu disiapkan]                   │
│                                                             │
│ [Batalkan jika diizinkan] [Laporkan Masalah]                │
│ Setelah sesi: [Buka Ringkasan & Feedback]                   │
└─────────────────────────────────────────────────────────────┘
```

**Elemen utama:** identitas sesi, status, jadwal, tujuan, cara mengikuti sesi, persiapan, kebijakan perubahan/pembatalan, dan link menuju ringkasan.

**Catatan:** tautan eksternal hanya ditampilkan bila benar-benar tersedia dan hanya kepada pihak yang diizinkan. Tidak ada video conference internal di MVP.

## Halaman 15 — Session Summary & Feedback

**Tujuan:** Menyimpan hasil sesi dan membantu pengguna menetapkan langkah belajar selanjutnya.

```text
┌─────────────────────────────────────────────────────────────┐
│ Ringkasan Sesi                                              │
├─────────────────────────────────────────────────────────────┤
│ Nama sesi • tanggal • mentor/kelompok                       │
│ Tujuan awal                                                 │
│ Apa yang dipelajari?                                        │
│ [____________________________________________________]       │
│ Hal yang masih membingungkan                                │
│ [____________________________________________________]       │
│ Tugas / langkah berikutnya                                  │
│ [____________________________________________________]       │
│ [Simpan Ringkasan]                                          │
├─────────────────────────────────────────────────────────────┤
│ FEEDBACK (untuk sesi mentoring)                             │
│ Penilaian pengalaman [skala yang sederhana]                 │
│ Apakah sesi membantu tujuanmu? [Ya / Sebagian / Belum]      │
│ Komentar opsional                                           │
│ [Kirim Feedback] [Laporkan Masalah]                         │
└─────────────────────────────────────────────────────────────┘
```

**Elemen utama:** konteks sesi, ringkasan, pemahaman baru, hal yang belum dipahami, langkah selanjutnya, feedback, dan laporan.

**Aksi:** simpan hasil → perbarui progres belajar.

**Catatan:** feedback harus dibatasi pada pengalaman nyata. Jangan membuka komentar privat kepada publik tanpa kebijakan dan persetujuan yang jelas.

## Halaman 16 — Learning Progress

**Tujuan:** Menampilkan perkembangan tujuan, sesi, dan milestone tanpa menyatakan kemajuan akademik yang tidak diukur.

```text
┌─────────────────────────────────────────────────────────────┐
│ Progres Belajar                                             │
├─────────────────────────────────────────────────────────────┤
│ Tujuan aktif [Pilih tujuan v]                               │
│ Target: [deskripsi]                                         │
│ Status: Belum dimulai / Berjalan / Selesai                  │
│ Milestone: [Selesai] dari [Total]                           │
├─────────────────────────────────────────────────────────────┤
│ RIWAYAT AKTIVITAS                                           │
│ [Tanggal] Sesi kelompok — ringkasan                         │
│ [Tanggal] Mentoring — feedback dan tindak lanjut            │
├─────────────────────────────────────────────────────────────┤
│ LANGKAH BERIKUTNYA                                          │
│ [Target atau tugas berikutnya]                              │
│ [Perbarui Tujuan] [Buka Catatan]                            │
└─────────────────────────────────────────────────────────────┘
```

**Elemen utama:** tujuan yang dipilih, status, milestone yang ditandai pengguna, riwayat sesi, catatan, dan langkah berikutnya.

**Catatan:** progres pada MVP didasarkan pada tujuan dan aktivitas yang dicatat, bukan klaim otomatis bahwa pengguna sudah menguasai materi.

## Halaman 17 — Safety, Report & Block Controls

**Tujuan:** Memudahkan pengguna mengelola risiko dan melaporkan masalah.

```text
┌─────────────────────────────────────────────────────────────┐
│ Laporkan Masalah                                            │
├─────────────────────────────────────────────────────────────┤
│ Laporkan siapa / konten apa?                                │
│ [Pilih pengguna / sesi / profil]                            │
│ Alasan                                                     │
│ [Perilaku tidak pantas / penipuan / spam / lainnya]         │
│ Penjelasan opsional                                         │
│ [____________________________________________________]       │
│ [Kirim Laporan]                                             │
├─────────────────────────────────────────────────────────────┤
│ Tindakan lain                                               │
│ [Blokir Pengguna]                                           │
│ Penjelasan tentang efek pemblokiran                         │
└─────────────────────────────────────────────────────────────┘
```

**Elemen utama:** objek laporan, kategori alasan, deskripsi opsional, kirim, blokir, dan penjelasan dampak tindakan.

**Kondisi:** konfirmasi setelah laporan terkirim; sediakan cara untuk kembali tanpa mengirim. Jangan menjanjikan hasil moderasi tertentu sebelum ditinjau admin.

**Kebutuhan untuk semua jenjang:** sebelum membuka fitur yang mempertemukan pengguna di bawah umur dengan orang yang belum dikenal, kebijakan perlindungan, pelaporan, moderasi, batas komunikasi, dan persyaratan wali yang sesuai harus ditetapkan. Jangan mengandalkan tombol report sebagai satu-satunya perlindungan.

## Halaman 18 — Profile & Settings

**Tujuan:** Memungkinkan pengguna mengubah informasi belajar dan preferensi dasar.

```text
┌─────────────────────────────────────────────────────────────┐
│ Profil dan Pengaturan                                       │
├─────────────────────────────────────────────────────────────┤
│ Foto/avatar • nama tampilan                                 │
│ Jenjang • topik • tingkat pemahaman                         │
│ Tujuan dan ketersediaan                                     │
│ Preferensi matching                                         │
│ [Edit Profil] [Simpan Perubahan]                            │
├─────────────────────────────────────────────────────────────┤
│ Akun                                                        │
│ [Pengaturan Login] [Privasi] [Keluar]                       │
│ [Bantuan / Laporkan Masalah]                               │
└─────────────────────────────────────────────────────────────┘
```

**Elemen utama:** profil belajar, preferensi, kontrol akun, privasi, keluar, dan bantuan.

**Catatan:** pilihan visibilitas profil dan informasi yang ditampilkan ke pengguna lain perlu ditentukan secara eksplisit pada implementasi.

---

## 4. Komponen UI yang Digunakan Berulang

- **Header / navigasi:** brand, navigasi inti, menu akun.
- **Kartu hasil:** nama, topik, tujuan, jadwal, alasan cocok, CTA.
- **Status chip/label:** menunggu, diterima, ditolak, dibatalkan, terverifikasi, atau status lain yang sesuai data nyata.
- **Form field:** label jelas, bantuan input, validasi, dan pesan error.
- **Modal konfirmasi:** pembatalan permintaan/sesi, pemblokiran, dan tindakan yang tidak mudah dibatalkan.
- **Empty state:** penjelasan mengapa belum ada data beserta aksi berikutnya.
- **Loading state:** indikator saat memuat hasil atau menyimpan perubahan.
- **Error state:** pesan yang bisa ditindaklanjuti dan tombol coba lagi bila aman.
- **Feedback state:** konfirmasi bahwa perubahan tersimpan atau permintaan berhasil dikirim.

## 5. Prioritas Implementasi yang Disarankan

Agar MVP tetap terkendali, wireframe diprioritaskan sebagai berikut:

### Prioritas P0 — Jalur inti MVP

1. Sign Up / Log In.
2. Onboarding / Learning Profile.
3. Dashboard.
4. Create Learning Goal.
5. Discover / Recommendations.
6. Partner / Group Details dan Request Status.
7. Mentor Directory serta Mentor Profile & Service Details.
8. Booking Review & Status.
9. Study Session Workspace.
10. Mentoring Session Details.
11. Session Summary & Feedback.
12. Learning Progress.
13. Safety / Report / Block.

### Prioritas P1 — Perlu siap sebelum mentoring berbayar diaktifkan

1. Payment Instructions untuk skema pilot yang telah ditentukan.
2. Penjelasan pembatalan dan penanganan sengketa.
3. Alur verifikasi mentor serta status verifikasi yang dapat diaudit.

### Halaman pendukung

- Landing Page.
- Profile & Settings.
- Halaman bantuan dan kebijakan.

**Catatan:** prioritas ini bukan berarti perlindungan dasar boleh ditunda ketika layanan sudah dibuka. Fitur keamanan yang relevan harus tersedia sebelum fitur berisiko dirilis ke pengguna.

## 6. Keputusan yang Perlu Disetujui

1. Apakah daftar halaman dan struktur tiap halaman sudah mencakup flow yang disetujui pada STEP 2?
2. Apakah tab partner/kelompok/mentor pada halaman Discover lebih disukai daripada halaman terpisah untuk masing-masing jenis pencarian?
3. Apakah ruang sesi kelompok cukup menggunakan agenda, checklist, dan catatan bersama tanpa chat internal pada MVP?
4. Apakah alur pembayaran berbayar tetap dinonaktifkan sampai mekanisme pilot, verifikasi pembayaran, pembatalan, dan refund ditentukan?
5. Apakah halaman profil dan pengaturan masuk dalam scope MVP awal?

---

**Status dokumen:** Draft wireframe — menunggu approval pengguna.  
**Langkah berikutnya:** Setelah wireframe disetujui, lanjut ke STEP 4 — Rancang Database Schema sesuai SOP Vibe Coding.
