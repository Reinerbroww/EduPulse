# Menyiapkan Akun Moderator (Uji)

EduPulse **tidak** punya tombol "jadikan saya moderator" di antarmuka. Peran moderator
disimpan di klaim JWT `app_metadata.role`, dan hanya Supabase Admin API (dengan
service-role key) yang boleh menulisnya. Jadi promosi akun adalah tindakan ops
yang disengaja oleh pemilik proyek — tidak pernah otomatis dan tidak pernah dari
browser.

Nilai yang dikenali aplikasi (lihat `public.is_moderator()`): `moderator` dan `admin`.
Selain itu dianggap pengguna biasa.

## Cara mempromosikan akun uji

1. **Siapkan kunci service role** (rahasia server).
   Supabase Dashboard → Project Settings → API → `service_role`.
   Jangan commit, jangan tempel ke chat, jangan taruh di kode klien atau
   `NEXT_PUBLIC_*`.

2. **Tentukan akun target** — UUID akun atau alamat email-nya. Contoh:
   `moderator.uji@example.com`.

3. **Jalankan skrip dari terminal tepercaya** (node, bukan browser):

   ```powershell
   # PowerShell
   $env:SUPABASE_SERVICE_ROLE_KEY='<service-role-key>'
   npm run set-moderator -- moderator.uji@example.com --role moderator
   Remove-Item Env:\SUPABASE_SERVICE_ROLE_KEY   # bersihkan setelah selesai
   ```

   ```bash
   # Bash
   SUPABASE_SERVICE_ROLE_KEY='<service-role-key>' node scripts/set-moderator.mjs <user-id> --role moderator
   ```

   Periksa dulu tanpa mengubah apa pun (butuh kunci yang valid):

   ```powershell
   npm run set-moderator -- <user-id> --role moderator --dry-run
   ```

4. **Minta akun tersebut login ulang** (atau refresh sesi) supaya klaim peran baru
   masuk ke JWT. Sesi lama masih membawa klaim lama sampai token diperbarui.

5. **Verifikasi**:
   - Dengan akun moderator: halaman `/moderator` terbuka dan daftar verifikasi
     mentor bisa dibaca.
   - Dengan akun biasa: `/moderator` menolak (RLS + guard peran), dan pengguna
     tidak bisa mengubah `verification_status` dirinya sendiri menjadi `verified`.

## Mencabut peran

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY='<service-role-key>'
npm run set-moderator -- <user-id> --remove
```

## Yang dilakukan skrip

- Memvalidasi argumen: target wajib, `--role` ∈ {`moderator`, `admin`} atau `--remove`.
- Membaca `NEXT_PUBLIC_SUPABASE_URL` (atau `SUPABASE_URL`) dan
  `SUPABASE_SERVICE_ROLE_KEY` dari lingkungan / `.env.local`.
- Membaca `app_metadata` akun saat ini lewat Admin API, **mempertahankan** semua
  kunci lain, lalu hanya menambah/menghapus `role`.
- Mengirim `PUT /auth/v1/admin/users/<id>` dengan `app_metadata` yang sudah digabung.
- Mencetak ringkasan `app_metadata` sebelum/sesudah. **Kunci rahasia tidak pernah
  dicetak.**

## Jaminan keamanan

- Tanpa kunci service role valid, skrip berhenti dengan pesan jelas (tidak ada
  perubahan).
- Skrip tidak dijalankan otomatis dan tidak bisa dipanggil dari browser.
- Tidak ada jalur RLS/kebijakan yang dilonggarkan; RLS tetap menolak akun biasa.
- `mentor_profiles.user_id` tetap tidak bisa diubah; pengguna tidak dapat
  menyetel `verification_status` miliknya sendiri menjadi `verified` — itu hanya
  bisa lewat RPC `review_mentor_verification` milik moderator.
