# Mode Demo (Konten Contoh)

Mode demo menampilkan **kartu contoh** untuk partner, kelompok, mentor, tujuan
belajar, sesi, dan pratinjau dashboard kosong, yang semuanya diberi label tebal
`Contoh Demo`. Isinya statis (file fixture), bukan data database — jadi tidak
pernah bercampur dengan akun nyata dan tidak bisa mencemari data produksi.

## Mengaktifkan / menonaktifkan

Satu variabel lingkungan:

```
NEXT_PUBLIC_DEMO_MODE=true    # aktif
NEXT_PUBLIC_DEMO_MODE=false   # nonaktif (atau kosongkan / hapus)
```

- Nilai apa pun selain `"true"` dianggap nonaktif, termasuk kosong dan `false`.
- Letakkan di `.env.local` (dev), atau di environment staging/CI.
- Di produksi **jangan** diisi `true`.
- Karena ini variabel `NEXT_PUBLIC_*`, ubah nilainya lalu jalankan ulang
  (`npm run dev` / `npm run build && npm start`) agar terbaca.

## Di mana konten demo muncul

Konten demo hanya muncul saat area tersebut **kosong** (belum ada data nyata),
dan hanya saat mode demo aktif. Bila akun sudah punya data nyata, bagian demo
disembunyikan.

| Halaman | Perilaku saat mode demo aktif |
| --- | --- |
| `/dashboard` | Pratinjau contoh muncul bila akun benar-benar kosong. |
| `/discover?tab=partner` | Bagian "Profil contoh" muncul di bawah hasil nyata. |
| `/discover?tab=kelompok` | Grid kelompok nyata, lalu bagian "Kelompok contoh". |
| `/discover?tab=mentor` | Grid mentor terverifikasi, lalu kartu "Mentor contoh". |
| `/groups` | Bagian "Kelompok contoh" muncul di bawah daftar kelompok publik. |
| `/groups/[groupId]` | Contoh agenda/checklist sesi bila kelompok belum punya sesi. |
| `/goals` | Kartu "Tujuan contoh" bila pengguna belum punya tujuan. |

Bila daftar nyata kosong, kartu demo tetap muncul lengkap dengan CTA
("Buat kelompok nyata" / "Buat profil mentor sungguhan" / "Buat tujuan"). Saat
mode demo nonaktif, halaman menampilkan empty state yang menjelaskan kondisi dan
menawarkan aksi yang relevan, tanpa konten contoh.

## Batasan keamanan

- **Tidak ada penulisan ke database.** Fixture hanya dirender oleh server
  component; tidak ada `insert` di mana pun.
- **Tidak menimpa data nyata.** Kartu demo dipisahkan dari daftar nyata dan
  selalu diberi label `Contoh Demo`.
- **Mentor demo tidak menerima pemesanan.** Tombol "Ajukan sesi" / "Kirim
  permintaan" hanya tampilan, tidak ada tautan ke alur booking, dan tidak ada
  aksi server yang menangani booking dari kartu demo.
- **Tidak mengklaim terverifikasi.** Kartu mentor demo menampilkan
  "Belum diajukan (contoh)" dan `Alert` peringatan bahwa itu bukan data nyata.
- Tidak ada berkas `.md` ini yang membuka akses baru; RLS tetap berlaku.

## Menambah / mengubah konten contoh

Semua fixture ada di `src/lib/demo/fixtures.ts`:

- `DEMO_PARTNERS` — profil partner contoh (inisial, topik, tujuan belajar,
  alasan kecocokan, ketersediaan).
- `DEMO_GROUPS` — nama, deskripsi, topik, sampul (`coverKey` dari allow-list
  sampul), jumlah anggota, dan agenda contoh.
- `DEMO_MENTORS` — keahlian, deskripsi singkat, topik, pengalaman, dan info
  layanan (mode, durasi, biaya contoh).
- `DEMO_GOALS` — judul, deskripsi, dan progres contoh (untuk kartu dan
  pratinjau ringkas).
- `DEMO_SESSIONS` — judul, agenda, dan checklist contoh.

Masing-masing punya konstanta `DEMO_*_DISCLAIMER` yang menjelaskan bahwa itu
hanya tampilan. Nilai `coverKey` harus salah satu dari kunci sampul yang
tersedia (`programming`, `mathematics`, `language`, `science`, `design`); jika
tidak, `getGroupCover()` otomatis memakai ilustrasi bawaan.
