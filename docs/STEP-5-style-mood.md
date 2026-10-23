# EduPulse — STEP 5: Style & Mood Visual

**Dokumen:** Arah visual dan palet warna awal  
**Produk:** EduPulse  
**Referensi:** PRD EduPulse v1.2, STEP 2 — User Persona & User Flow, STEP 3 — Wireframe, STEP 4 — Database Schema (approved)  
**Tahap SOP:** STEP 5 — Tentukan Style & Mood Visual  
**Status:** Draft rekomendasi — menunggu approval pengguna

---

## 1. Tujuan

Menetapkan arahan visual EduPulse sebelum setup dan implementasi. Arah visual perlu mendukung kegiatan mencari partner belajar, membangun kelompok, menemukan mentor, dan melacak progres tanpa membuat produk terasa seperti dashboard administrasi atau media sosial yang ramai.

Dokumen ini adalah usulan desain, bukan implementasi UI final. Palet dan arahan visual belum dianggap disetujui sampai pengguna memberi approval.

## 2. Rekomendasi Mood & Vibe

### Warm, Collaborative & Trustworthy

**Inti pengalaman:** *A supportive space to learn together.*

EduPulse sebaiknya terasa hangat dan terbuka untuk berbagai jenis pelajar, tetapi tetap teratur dan dapat dipercaya. Pengguna harus mudah menemukan orang yang tepat, memahami detail sesi, serta mengetahui langkah belajar berikutnya.

Karakter yang dituju:

- **Ramah, bukan kekanak-kanakan.** Gunakan bahasa yang suportif, bentuk sederhana, dan aksen hangat tanpa meniru tampilan game anak-anak.
- **Kolaboratif, bukan seperti feed media sosial.** Tonjolkan tujuan belajar, kecocokan topik, jadwal, kelompok, dan sesi berikutnya; hindari feed tanpa akhir atau metrik popularitas yang tidak dibutuhkan.
- **Dapat dipercaya, bukan terlalu korporat.** Profil mentor, informasi harga, status verifikasi, dan ketentuan sesi harus mudah ditemukan.
- **Fokus, bukan ramai.** Gunakan ruang kosong, hierarki visual yang jelas, dan satu tindakan utama pada tiap halaman.
- **Tidak berlebihan dengan visual AI.** Hindari gradient neon, efek glow, dan dekorasi futuristik yang tidak membantu tugas pengguna.

## 3. Palet Warna yang Direkomendasikan

Palet utama terdiri dari tiga warna: deep teal sebagai warna utama, off-white sebagai dasar, serta warm amber sebagai aksen. Warna netral tambahan di bawah berfungsi untuk teks dan batas komponen, bukan sebagai warna brand utama.

| Peran | Nama | Hex | Penggunaan |
|---|---|---|---|
| Primary | Deep Teal | `#246B60` | Tombol utama, tautan penting, kontrol aktif, dan highlight inti |
| Base | Soft Off-white | `#F8FAF8` | Latar belakang utama agar halaman terasa ringan |
| Accent | Warm Amber | `#F2B84B` | Badge pilihan, penanda progres, ikon kecil, atau highlight terpilih |
| Text utama | Deep Charcoal Green | `#20302D` | Heading, body text, label tombol pada latar amber |
| Text sekunder | Muted Green-gray | `#5E6E68` | Deskripsi pendukung dan metadata |
| Surface | White | `#FFFFFF` | Kartu, form, panel, dan area yang perlu dipisahkan dari background |
| Border | Soft Gray-green | `#E1E8E4` | Garis pembatas halus dan pemisah komponen |

### Kontras teks

Perkiraan rasio kontras dihitung dari nilai warna sRGB dengan rumus relative luminance WCAG:

| Kombinasi | Rasio kontras | Arahan |
|---|---:|---|
| Deep Teal `#246B60` pada Soft Off-white `#F8FAF8` | 5.98:1 | Memenuhi acuan 4.5:1 untuk teks normal |
| Putih `#FFFFFF` pada Deep Teal `#246B60` | 6.27:1 | Cocok untuk label tombol primary |
| Deep Charcoal Green `#20302D` pada Soft Off-white `#F8FAF8` | 13.15:1 | Cocok untuk teks utama |
| Muted Green-gray `#5E6E68` pada Soft Off-white `#F8FAF8` | 5.13:1 | Cocok untuk teks sekunder |
| Deep Charcoal Green `#20302D` pada Warm Amber `#F2B84B` | 7.71:1 | Cocok untuk teks pada badge berwarna amber |

**Aturan aksen:** Warm Amber pada latar off-white tidak memiliki kontras yang cukup untuk dijadikan teks kecil atau satu-satunya penanda kontrol. Gunakan amber sebagai bidang aksen dengan teks gelap, atau sebagai dekorasi pendukung. Jangan gunakan teks putih di atas amber. Kontras tetap perlu diperiksa lagi jika opacity atau warna berubah.

## 4. Prinsip Penggunaan Visual

### A. Hierarki yang jelas

1. Konten utama atau tujuan halaman.
2. Satu tindakan utama.
3. Informasi pendukung seperti topik, jadwal, harga, dan status.
4. Aksi sekunder dan detail tambahan.

### B. Ruang kosong dan kartu

Gunakan ruang yang cukup antarkomponen. Kartu boleh digunakan untuk profil partner, kelompok, mentor, dan sesi, dengan sudut membulat moderat (sekitar 12–16 px) dan bayangan yang sangat halus atau tanpa bayangan. Hindari menumpuk banyak kartu statistik di dashboard.

### C. Komponen yang konsisten

Gunakan pola yang sama untuk tombol, input, chip topik, label status, kartu profil, empty state, loading state, error state, dan notifikasi. Status harus memakai teks yang jelas; jangan mengandalkan warna saja untuk membedakan status.

### D. Kepercayaan dan keamanan

Status verifikasi mentor, harga, durasi, dan ketentuan pembatalan harus mudah dibaca sebelum pengguna melakukan booking. Kontrol laporan/blokir perlu dapat ditemukan, tetapi tidak harus mendominasi halaman.

### E. Responsif dan aksesibel

Desain harus nyaman di desktop maupun mobile, menampilkan focus state yang terlihat, memakai label form yang jelas, dan menjaga kontras teks. Jangan membedakan status hanya melalui warna atau ikon tanpa teks pendukung.

## 5. Typography

**Rekomendasi:** gunakan font sans-serif bawaan sistem atau default Tailwind. Font khusus belum diperlukan untuk MVP.

Gunakan hierarki yang sederhana: heading halaman, subheading, body text, dan metadata. Body text sebaiknya nyaman dibaca di layar kecil; hindari terlalu banyak variasi font, huruf kapital penuh, dan teks sekunder yang terlalu kecil atau terlalu pudar.

## 6. Penerapan pada Halaman EduPulse

| Area | Arahan visual |
|---|---|
| Landing Page | Menjelaskan manfaat EduPulse secara jelas; satu CTA utama seperti “Mulai Belajar” |
| Dashboard | Prioritaskan tujuan aktif dan aktivitas berikutnya, lalu rekomendasi partner/kelompok/mentor; hindari dashboard penuh statistik |
| Discover | Kartu yang mudah dipindai, dengan topik, tujuan, jadwal, dan alasan kecocokan yang tampak jelas |
| Mentor Directory & Profile | Keahlian, status verifikasi, durasi, harga, ketersediaan, dan kebijakan sesi mudah dibandingkan |
| Booking | Alur bertahap dengan ringkasan jadwal, harga, dan kebijakan sebelum pengajuan; status pembayaran manual tidak boleh tampak lunas sebelum diverifikasi |
| Study Session Workspace | Checklist, agenda, anggota, dan catatan menjadi fokus; hindari komponen dekoratif yang tidak membantu sesi |
| Learning Progress | Tampilkan target, milestone, riwayat sesi, dan langkah berikutnya dengan visual sederhana |
| Safety & Reports | Bahasa netral, konfirmasi yang jelas, serta akses lapor/blokir yang konsisten |

## 7. Referensi Visual untuk Dipelajari

Referensi ini bukan template untuk disalin. Ambil pola yang relevan dengan kebutuhan EduPulse dan pertahankan identitas visual sendiri.

1. **[Notion](https://www.notion.com/)** — referensi untuk workspace yang tertata, hierarki konten yang jelas, dan UI yang tidak berisik. Ambil pendekatan struktur dan whitespace, bukan kompleksitas fitur Notion.
2. **[Khan Academy](https://www.khanacademy.org/)** — referensi pengalaman yang berpusat pada pelajar dan penjelasan pembelajaran yang mudah dipahami. Ambil pendekatan learner-first dan bahasa yang suportif, bukan meniru karakter visualnya.
3. **[ADPList — Explore Mentors](https://adplist.org/explore)** — referensi untuk penemuan mentor melalui profil dan informasi yang membantu pengguna memilih. Ambil pola pemindaian profil, keahlian, dan jalur booking yang jelas.

## 8. Hal yang Tidak Menjadi Tujuan Visual MVP

- Tidak mengejar tampilan futuristik atau “AI-generated” yang dominan.
- Tidak menggunakan animasi atau gamifikasi berat untuk memaksa engagement.
- Tidak menambahkan banyak warna brand tanpa kebutuhan yang jelas.
- Tidak menonjolkan jumlah pengikut, popularitas, atau statistik sosial yang tidak mendukung hasil belajar.
- Tidak menampilkan pembayaran berbayar sebagai lunas sebelum status diverifikasi.

## 9. Ringkasan Rekomendasi

- **Mood:** Warm, Collaborative & Trustworthy.
- **Primary:** Deep Teal `#246B60`.
- **Base:** Soft Off-white `#F8FAF8`.
- **Accent:** Warm Amber `#F2B84B`.
- **Typography:** system font / default Tailwind sans-serif.
- **Arah UI:** rapi, suportif, mudah dipindai, transparan soal mentor dan sesi, serta nyaman di desktop dan mobile.

---

## 10. Approval Pengguna

Mohon review dan pilih salah satu:

- [ ] **APPROVE** — setuju dengan mood, palet warna, typography, dan prinsip visual di dokumen ini.
- [ ] **REVISE** — ada bagian yang perlu diubah sebelum disetujui.

**Catatan pengguna:** _Menunggu masukan._

**Langkah berikutnya sesuai SOP:** setelah STEP 5 disetujui, rangkum keputusan STEP 1–5 yang telah disetujui ke dalam `coldstart.md`. STEP 6 belum dimulai pada dokumen ini.
