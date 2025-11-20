## Ringkasan Masalah
- Anda diarahkan ke `/unauthorized` saat akses admin karena guard role pada `src/middleware.ts:69–75` mengalihkan user yang tidak memiliki role yang sesuai.
- Middleware mengandalkan `getCurrentUser` dan role `role_path`, tetapi akun uji tampaknya belum memiliki role admin di database (`user_account_roles`) sehingga selalu tidak lolos.
- Tidak ada halaman `/unauthorized` di app (hasil pencarian tidak ditemukan), sehingga pengalaman buruk.
- Terdapat campuran dua pendekatan auth (Supabase app_metadata vs session-cookie + tabel `user_accounts/user_account_roles`) yang menyebabkan inkonsistensi.

## Rencana Perbaikan Teknis
### 1) Konsolidasi Auth & Role
- Jadikan sumber kebenaran auth: session-cookie + tabel `user_accounts` dan `user_account_roles`.
- Gunakan pemetaan role OJS yang sudah ada (`'Site admin' → 'admin'`) di `src/app/api/auth/login/route.ts:74–89` dan `src/lib/db.ts:245–259`.
- Hapus ketergantungan pada label `site_admin` berbasis app_metadata (rute `src/app/api/grant-admin/route.ts`).

### 2) Seed Test Accounts & Roles (Bukti Nyata)
- Tambahkan rute server `GET /api/test-users` untuk memasukkan akun:
  - `admin@example.com` (role: Site admin)
  - `editor@example.com` (role: Editor)
  - `author@example.com` (role: Author)
  - `reviewer@example.com` (role: Reviewer)
- Rute akan:
  - Upsert ke `user_accounts` dengan password sederhana `password` (sesuai `src/app/api/auth/login/route.ts:131`).
  - Upsert role ke `user_account_roles` agar middleware dan halaman admin mengenali role.

### 3) Halaman Unauthorized
- Tambahkan page client `/unauthorized` dengan UI yang menjelaskan:
  - Kenapa akses ditolak
  - Tautan kembali ke `/dashboard`
  - Petunjuk untuk login sebagai admin

### 4) Middleware & Navigasi
- Pertahankan `src/middleware.ts` (walau Next memberi peringatan proxy) agar bukti proteksi route tetap ada.
- Perbaiki pengalaman dengan menambahkan halaman `/unauthorized` sehingga tidak blank.
- Verifikasi guard di `AdminLayout` dan `withAuth` hanya menggunakan role `'admin'` secara konsisten agar tidak ambigu.

### 5) Validasi End-to-End (Bukti)
- Jalankan aplikasi di `http://localhost:3001`.
- Login:
  - `admin@example.com / password` → akses `/admin` berhasil, tidak dialihkan ke `/unauthorized`.
  - Akun non-admin → dialihkan ke `/dashboard` atau `/unauthorized` sesuai guard.
- Tunjukkan log hasil `GET /api/auth/session` yang memuat `user.roles` (server auth) dan bukti navigasi admin.

### 6) Pemulihan File Lama
- Tidak akan menghapus file apa pun.
- Pulihkan/rekonstruksi file yang diperlukan untuk bukti implementasi: rute seed test users dan halaman `/unauthorized`.

## Output yang Anda Terima
- Akses admin berfungsi dengan akun uji.
- Middleware proteksi route aktif dan dibuktikan.
- Halaman `/unauthorized` informatif.
- Dokumentasi singkat titik bukti (tautan halaman yang bisa Anda buka) dan referensi kode yang relevan.

Mohon konfirmasi untuk saya lanjut implementasi langkah-langkah di atas secara langsung.