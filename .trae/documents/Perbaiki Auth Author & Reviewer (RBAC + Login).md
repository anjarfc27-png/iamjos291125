## Diagnosa Cepat
- Password login hardcode tidak cocok dengan data seeding:
  - Seeder `src/app/api/test-users/route.ts:15` menyimpan password `"password"`.
  - Login `src/app/api/auth/login/route.ts:131` memeriksa `"password123"` → menyebabkan Author/Reviewer gagal login.
- Guard client `withAuth` mengalihkan ke rute yang tidak ada bila role tidak cocok:
  - `src/lib/auth-client.tsx:34` redirect ke `"/dashboard"` (rute tidak ada) → terlihat seperti tombol/halaman error.
- Navigasi root tidak konsisten:
  - Reviewer sudah redirect ke `/reviewer/dashboard` (`src/app/(reviewer)/reviewer/page.tsx:7`).
  - Author layout menautkan header/menu ke `/author` (tidak ada halaman root), bukan `/author/dashboard` (`src/app/(author)/layout.tsx:37,107`).

## Rencana Perbaikan
1. Selaraskan verifikasi password di login.
   - Ubah `src/app/api/auth/login/route.ts` agar memeriksa `password === userData.password` (tanpa hash untuk sekarang) → kompatibel dengan seed `"password"`.
   - Opsional: nanti ganti ke hashing bcrypt.
2. Perbaiki perilaku redirect saat role tidak cocok di `withAuth`.
   - Ganti redirect ke rute valid: `"/unauthorized"` (atau fallback ke halaman home `"/"`).
   - Tampilkan halaman sederhana bergaya OJS: “Anda tidak memiliki akses ke halaman ini”.
3. Normalkan navigasi Author & Reviewer.
   - Author: ubah item “Dashboard” dan header link ke `"/author/dashboard"` agar klik bekerja.
   - Reviewer: sudah ke `"/reviewer/dashboard"` (OK).
4. Verifikasi RBAC dari sumber data.
   - Pastikan user Author memiliki `role_path: "author"` dan Reviewer `"reviewer"` dari `user_account_roles`.
   - Jika belum, jalankan endpoint seeding `GET /api/test-users` (sudah ada) untuk membuat akun:
     - `author@example.com` (Author), `reviewer@example.com` (Reviewer) dengan password `password`.
5. Uji alur lengkap.
   - Login sebagai Author → akses `/author/dashboard`, `/author/submissions`, dll. Pastikan tidak terlempar ke rute invalid.
   - Login sebagai Reviewer → akses `/reviewer/dashboard`, `/reviewer/assignments`, dll.
   - Coba akses halaman role lain dengan akun yang tidak sesuai → harus dialihkan ke `"/unauthorized"`.

## Hasil yang Diharapkan
- Author/Reviewer bisa login dengan kredensial seed dan mengakses halaman perannya.
- Klik menu “Dashboard” bekerja karena rute valid.
- Saat role tidak cocok, ditunjukkan halaman unauthorized yang jelas, bukan rute kosong.

## Implementasi Setelah Disetujui
- Update login route (cek password ke `userData.password`).
- Update `withAuth` untuk redirect yang benar.
- Update tautan di `src/app/(author)/layout.tsx` ke `/author/dashboard`.
- Tambahkan halaman `/unauthorized` sederhana bergaya OJS jika belum ada.
- Jalankan verifikasi manual di dev server dan koreksi jika ada issue kecil.