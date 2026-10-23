# Laporan Fase C — Kelengkapan UI/UX & Pemisahan Form

Status: **SELESAI (Fase C) — berhenti untuk review pemilik.**
Tanggal: 2026-10-20
Lingkup: §1–§8 sesuai arahan UI/UX Completion & Form Separation.

> Catatan pembatas tetap berlaku: migrasi **012 belum diterapkan ke database
> remote** (sesuai larangan). Pesan fitur CV nonaktif **tidak menyamar sebagai
> sukses** (§6). Tidak ada perubahan skema, tidak ada operasi destruktif, tidak
> ada deploy produksi, `NEXT_PUBLIC_DEMO_MODE` default **nonaktif** untuk
> produksi.

---

## 1. Ringkasan perubahan aktual

| # | Area | Berkas utama | Yang berubah |
|---|------|--------------|--------------|
| §1 | Audit halaman kosong | seluruh `src/app/(app)/**/page.tsx` | Setiap halaman daftar/dashboard diberi empty state yang menjelaskan kondisi + aksi relevan; halaman yang kosong memakai konten contoh hanya saat mode demo aktif. |
| §2 | Perluasan mode demo | `src/lib/demo/fixtures.ts`, `src/components/app/{demo-partners,demo-goals,demo-sessions}.tsx`, wiring di `discover`, `groups/[groupId]`, `goals`, `dashboard` | Fixture contoh untuk partner, tujuan, sesi, dan pratinjau dashboard; semua berlabel `Contoh Demo`, hanya tampil saat area kosong. |
| §3 | Pemisahan form | **rute form baru** (§3 di bawah), `src/components/app/form-page.tsx`, `src/components/app/goal-form.tsx` | Semua form buat/ubah dipindah ke halaman form tersendiri; halaman daftar hanya menampilkan ringkasan + tombol aksi. |
| §4 | Navigasi form | `src/components/app/form-page.tsx`, `src/lib/goals/actions.ts`, `src/lib/mentor/actions.ts` | Setiap halaman form punya judul + tujuan, tombol kembali, tombol simpan jelas, pesan sukses/gagal, dan redirect ke halaman tujuan setelah simpan. |
| §5 | Aturan visual | `src/app/globals.css`, komponen demo | Palet §5 terverifikasi **persis** di CSS token; tidak ada gambar eksternal; komponen demo memakai Kartu/Badge/Alert/Button yang konsisten. |
| §6 | Profil & CV mentor | `src/lib/mentor/cv.ts`, `src/components/app/mentor-cv-card.tsx`, `src/app/(app)/mentor/page.tsx` | Ringkasan Ruang Mentor dipisah dari form; alur buat profil → info → CV → ajukan → tunggu; pesan CV nonaktif apa adanya (migrasi 012 belum diterapkan). |
| §8 | Uji & hasil | harness di temp dir | `lint` + `tsc` + `build` hijau; demo on **30/30**, demo off **17/17**, rute form **26/26** PASS. |

---

## 2. §3 Rute form baru (terpisah dari halaman utama)

| Halaman utama | Rute form baru | Isi |
|---|---|---|
| `/goals` | `/goals/new` | Form buat tujuan belajar |
| `/goals/[goalId]` | `/goals/[goalId]/edit` | Form ubah tujuan belajar (dual-mode) |
| `/groups` | `/groups/new` | Form buat kelompok + pilihan sampul |
| `/mentor` | `/mentor/profile` | Form buat/ubah profil mentor |
| `/mentor` | `/mentor/services/new` | Form tambah layanan mentoring |
| `/mentor` | `/mentor/slots/new` | Form tambah jadwal tersedia |

**Bukti tanpa form tertanam di halaman daftar.** Pencarian `GoalForm`/
`GroupForm` hanya menemukan 3 berkas — semuanya rute form di atas. Halaman
`/goals` dan `/groups` kini hanya menautkan ke rute tersebut.

**Aksi sederhana yang diizinkan tetap tinggal** (sesuai pengecualian §3):
terima/tolak permintaan (`/requests`), setujui/tolak anggota (`/groups/[groupId]`),
buka blokir (`/profile`), aktif/nonaktif & hapus layanan, hapus jadwal, toggle
menerima sesi (`/mentor`), tindakan moderasi (`/moderator`), dan mini-form
checklist/catatan kontekstual di `/sessions/[sessionId]`.

---

## 3. Komponen visual baru

| Komponen | Fungsi |
|---|---|
| `src/components/app/form-page.tsx` | Kerangka bersama halaman form: judul, deskripsi, isi dalam Card, tautan kembali `←`. |
| `src/components/app/demo-partners.tsx` | Kartu partner contoh (avatar inisial lokal, topik, tujuan, alasan cocok, waktu luang, tombol nonaktif). |
| `src/components/app/demo-goals.tsx` | `DemoGoalsSection` (tujuan + milestone + progres) dan `DemoGoalsPreview` (versi ringkas untuk dashboard). |
| `src/components/app/demo-sessions.tsx` | Struktur sesi contoh (agenda + checklist read-only). |
| `src/components/app/goal-form.tsx` | Ditulis ulang dual-mode: buat (`createLearningGoal`) dan ubah (`updateLearningGoal` + `goalId`). |

Semua komponen demo memakai: reproduksi inisial/ilustrasi **lokal** (bukan URL
eksternal), badge `Contoh Demo`, dan `Alert` peringatan "bukan data nyata".

---

## 4. §5 Aturan visual — token terverifikasi

`src/app/globals.css` cocok persis dengan palet yang disetujui:

| Peran | Token | Nilai |
|---|---|---|
| Primary | `--color-primary` | `#246b60` |
| Background | `--color-canvas` | `#f8faf8` |
| Accent | `--color-accent` | `#f2b84b` |
| Teks utama | `--color-ink` | `#20302d` |
| Teks sekunder | `--color-muted` | `#5e6e68` |
| Surface | `--color-surface` | `#ffffff` |

Tidak ada URL gambar eksternal di `src/**` (pencarian regex → 0 hasil). Sampul
kelompok tetap memakai SVG lokal yang sudah ada + fallback bawaan.

---

## 5. §6 Profil & CV mentor

- `/mentor` kini **ringkasan**: kartu profil (+`Ubah profil`), kartu layanan
  (+`Tambah layanan`, toggle/hapus), kartu jadwal (+`Tambah jadwal`, hapus),
  kartu alur verifikasi 5 langkah, kartu status, kartu CV, toggle menerima sesi,
  kartu pratinjau demo, tautan pencarian mentor. Jalur belum punya profil
  menampilkan CTA `Buat profil mentor`.
- Alur dipertahankan: buat profil → lengkapi informasi → unggah CV → ajukan
  verifikasi → menunggu keputusan moderator. Mentor **tidak bisa** menyetel
  `verified` sendiri (diuji di Fase B).
- CV tetap privat; tidak ada URL CV publik; akses lewat signed URL 60 detik
  untuk owner/moderator.
- Jika skema 012 belum ada, kartu CV menampilkan `CV_UNAVAILABLE_MESSAGE` secara
  apa adanya ("Fitur CV belum aktif di database…"), **bukan** sukses palsu.

---

## 6. §8 Hasil pengujian (aktual)

| Uji | Perintah / berkas | Hasil |
|---|---|---|
| Lint | `npm run lint` | **PASS** (0 error) |
| Type check | `npx tsc --noEmit` | **PASS** (0 error) |
| Build | `npm run build` | **PASS** (semua rute form baru terkompilasi) |
| Demo aktif | `test-demo.mjs` (`EXPECT_DEMO=true`) | **30/30 PASS** |
| Demo nonaktif | `test-demo.mjs` (`EXPECT_DEMO=false`) | **17/17 PASS** |
| Rute form | `test-form-routes.mjs` | **26/26 PASS** |
| Fixture di DB | bagian `test-demo.mjs` | **0 baris** (tidak menulis DB) |

Cakupan `test-demo.mjs` (aktif) memverifikasi: label `Contoh Demo`, kartu
partner/kelompok/mentor/tujuan/sesi, pratinjau dashboard, peringatan "bukan data
nyata", mentor demo tidak mengklaim terverifikasi, tombol demo tanpa tautan aksi
nyata, dan data nyata tidak tertimpa.

Cakupan `test-form-routes.mjs`: setiap rute form (`/goals/new`,
`/goals/[goalId]/edit`, `/groups/new`, `/mentor/profile`,
`/mentor/services/new`, `/mentor/slots/new`) → HTTP 200, judul tampil, tautan
kembali benar, dan halaman daftar menautkan ke rutenya.

**Metode:** uji HTTP nyata terhadap server dev + database. Pengguna uji
dibuat/dihapus oleh harness; tidak menyentuh data produksi.

---

## 7. Yang TIDAK diubah / tetap dijaga

- Validasi Zod, otorisasi Server Action, dan RLS **tidak diubah**.
- Skema database tidak diubah; migrasi 012 **tidak** diterapkan ke remote.
- Demo: tidak menulis DB, tidak menimpa data nyata, tidak menerima booking nyata.
- Peran moderator tidak bisa diubah dari UI publik.
- `NEXT_PUBLIC_DEMO_MODE` default **nonaktif**; hanya `.env.local` dev yang `true`.

---

## 8. Blocker (tetap dari Fase B)

| Blocker | Dampak | Status |
|---|---|---|
| Tanpa browser/Playwright | Uji interaksi visual/console tidak dapat dijalankan otomatis | BLOCKED — checklist manual disediakan |
| `@example.com` → 400, signup 429 | Tidak mengulang probe signup | Dicatat |
| Tanpa service-role key di remote | `set-moderator.mjs` hanya divalidasi logikanya | BLOCKED |
| Deteksi reverse-block | Butuh fungsi/trigger DB (perlu persetujuan) | Dicatat |
| Migrasi 012 remote | Verifikasi CV E2E hanya di stack lokal | BLOCKED sesuai larangan |

---

## 9. Berhenti untuk review

Fase C selesai secara implementasi + pengujian yang dapat dijalankan tanpa
browser. Menunggu review pemilik. Tidak ada perubahan lebih lanjut tanpa
persetujuan (khususnya penerapan migrasi 012 ke remote).
