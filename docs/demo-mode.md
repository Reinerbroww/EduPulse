# Mode Demo

EduPulse punya dua lapis mode demo:

1. **Data demo interaktif (disarankan untuk review).** `npm run seed-demo`
   menulis akun, tujuan, kelompok, sesi, booking, dan permintaan belajar ke
   database demo/staging. Semua bisa dipakai end-to-end: login, ajukan partner,
   booking mentor, update progres, dan mengelola sesi.
2. **Kartu contoh statis.** Fixture di `src/lib/demo/fixtures.ts` tetap dipakai
   sebagai fallback saat suatu area masih kosong. Kartu ini hanya tampilan dan
   tidak pernah ditulis ke database.

Jangan aktifkan mode demo di produksi.

## 1. Data demo interaktif

### Prasyarat environment

Tambahkan ke `.env.local` (atau environment staging):

```
NEXT_PUBLIC_DEMO_MODE=true
DEMO_SEED_ENABLED=true
DEMO_SEED_CONFIRM=seed-edupulse-demo
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@<host>:5432/postgres
```

- `NEXT_PUBLIC_DEMO_MODE=true` juga membuat UI menampilkan banner mode demo.
- `DEMO_SEED_ENABLED` dan `DEMO_SEED_CONFIRM` adalah gerbang khusus script.
- Script menolak berjalan bila `NODE_ENV` atau `VERCEL_ENV` bernilai
  `production`.
- `DATABASE_URL` boleh memakai direct connection atau Supabase pooler. Bila
  host `db.<project-ref>.supabase.co` tidak bisa di-resolve dari mesinmu, pakai
  pooler (`aws-0-<region>.pooler.supabase.com:5432`) dengan user
  `postgres.<project-ref>`.
- Script tidak membutuhkan `SUPABASE_SERVICE_ROLE_KEY`. Akun demo dibuat lewat
  SQL langsung ke `auth.users` dan `auth.identities`.

### Perintah

```
npm run seed-demo    # hapus data demo lama, lalu buat ulang dari nol
npm run reset-demo   # hapus semua data demo
```

Seed bersifat idempotent: data demo sebelumnya dihapus lebih dulu, lalu dibuat
ulang dengan ID dan jadwal yang deterministik (relatif terhadap tanggal seed).

### Akun demo

Semua akun memakai password yang sama: `DemoEduPulse2026!`.

| Email | Nama | Peran |
| --- | --- | --- |
| `demo.rani@demo.edupulse.test` | Demo — Rani | Mentor Python |
| `demo.bagus@demo.edupulse.test` | Demo — Bagus | Mentor Matematika |
| `demo.lia@demo.edupulse.test` | Demo — Lia | Pelajar utama |
| `demo.dimas@demo.edupulse.test` | Demo — Dimas | Pelajar/partner |
| `demo.ayu@demo.edupulse.test` | Demo — Ayu | Owner kelompok speaking |
| `demo.nadia@demo.edupulse.test` | Demo — Nadia | Owner kelompok Python |
| `demo.reza@demo.edupulse.test` | Demo — Reza | Pelajar/partner |

Saran alur review:

- Login sebagai **Demo — Lia** untuk dashboard, sesi mendatang, tujuan, dan
  permintaan belajar.
- Login sebagai **Demo — Rani** atau **Demo — Bagus** untuk sisi mentor, layanan,
  slot, dan booking.
- Login sebagai **Demo — Nadia** atau **Demo — Ayu** untuk mengelola kelompok
  dan sesi kelompok.

### Isi data demo

- 7 akun dengan profil, topik, dan waktu luang.
- 5 tujuan belajar dengan dukungan `partner`, `group`, dan/atau `mentor`.
- 3 kelompok beserta anggota.
- 3 sesi: dua sesi kelompok dan satu sesi partner tanpa kelompok.
- 3 booking mentoring dengan status `pending`, `confirmed`, dan `completed`.
- 3 permintaan partner, update progres tujuan, catatan sesi, checklist, feedback,
  dan ringkasan mentoring.

### Keamanan seed/reset

- Hanya menyentuh akun dengan domain `@demo.edupulse.test`.
- Hanya menghapus baris demo yang cocok dengan ID demo, relasi akun demo, atau
  nama berprefix `Demo — `.
- Tidak menghapus akun, tujuan, kelompok, atau sesi pengguna nyata.
- Data turunan (anggota, checklist, catatan, feedback, booking) dihapus sebelum
  akun demo agar tidak melanggar foreign key.

## 2. Kartu contoh statis

Kartu statis hanya muncul saat area terkait kosong dan `NEXT_PUBLIC_DEMO_MODE`
aktif. Bila data nyata sudah ada, bagian statis disembunyikan agar tidak
duplikat dengan data demo interaktif.

| Halaman | Perilaku saat mode demo aktif |
| --- | --- |
| `/dashboard` | Pratinjau contoh muncul bila akun benar-benar kosong. |
| `/discover?tab=partner` | Kartu "Partner contoh" muncul bila tidak ada kandidat. |
| `/discover?tab=kelompok` | Kartu "Kelompok contoh" muncul bila belum ada kelompok. |
| `/discover?tab=mentor` | Kartu "Mentor contoh" muncul bila belum ada mentor. |
| `/groups` | Bagian "Kelompok contoh" muncul di bawah daftar kelompok publik. |
| `/groups/[groupId]` | Contoh agenda/checklist sesi bila kelompok belum punya sesi. |
| `/goals` | Kartu "Tujuan contoh" bila pengguna belum punya tujuan. |

Semua kartu statis diberi label `Contoh Demo`. Mentor contoh tidak menerima
pemesanan nyata dan tidak mengklaim terverifikasi.

## Mengaktifkan / menonaktifkan

```
NEXT_PUBLIC_DEMO_MODE=true    # aktif
NEXT_PUBLIC_DEMO_MODE=false   # nonaktif (atau kosongkan / hapus)
```

- Nilai apa pun selain `"true"` dianggap nonaktif, termasuk kosong dan `false`.
- Letakkan di `.env.local` (dev), atau di environment staging/CI.
- Karena ini variabel `NEXT_PUBLIC_*`, ubah nilainya lalu jalankan ulang
  (`npm run dev` / `npm run build && npm start`) agar terbaca.

## Menambah / mengubah konten contoh statis

Semua fixture ada di `src/lib/demo/fixtures.ts`:

- `DEMO_PARTNERS` — profil partner contoh.
- `DEMO_GROUPS` — kelompok dan agenda contoh.
- `DEMO_MENTORS` — mentor dan layanan contoh.
- `DEMO_GOALS` — tujuan dan progres contoh.
- `DEMO_SESSIONS` — agenda dan checklist contoh.

Masing-masing punya konstanta `DEMO_*_DISCLAIMER`. Nilai `coverKey` harus salah
satu dari kunci sampul yang tersedia (`programming`, `mathematics`, `language`,
`science`, `design`); jika tidak, `getGroupCover()` memakai ilustrasi bawaan.
