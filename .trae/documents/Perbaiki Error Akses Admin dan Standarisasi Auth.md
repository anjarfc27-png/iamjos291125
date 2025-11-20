## Diagnosa Awal
- Tinjau implementasi auth dan role di `src/lib/auth.ts` untuk memastikan `role_path` yang valid (contoh: 'Site admin' dipetakan ke `admin`).
- Audit gating di `src/app/(admin)/layout.tsx` untuk memastikan logika proteksi tidak memicu redirect/hydration mismatch.
- Audit penggunaan `withAuth` di seluruh halaman admin dan pastikan konsisten memakai role yang benar.

## Perbaikan Role & Guard
- Standarkan role admin: gunakan hanya `admin` (hapus referensi `site_admin` yang tidak ada di mapping).
- Perbarui `withAuth` pemakaannya di halaman admin menjadi `withAuth(Component, 'admin')` atau `hasAnyRole` bila diperlukan.
- Sesuaikan `AdminLayout`:
  - Tampilkan loader ketika `loading` dari `AuthContext` masih true.
  - Gunakan `useEffect` untuk redirect saat user tidak login atau tidak punya role `admin`.
  - Render konten hanya jika lolos guard; hindari return "Loading..." yang persistent agar tidak terjadi mismatch.

## Konsistensi Halaman Admin
- Verifikasi semua link sidebar admin di `src/app/(admin)/layout.tsx` menuju rute yang tersedia:
  - `/admin` → `src/app/(admin)/admin/page.tsx`
  - `/admin/site-management` → `src/app/(admin)/admin/site-management/page.tsx`
  - `/admin/users` → `src/app/(admin)/admin/users/page.tsx`
  - `/admin/site-settings/site-setup` → `src/app/(admin)/admin/site-settings/site-setup/page.tsx`
  - `/admin/statistics` → `src/app/(admin)/admin/statistics/page.tsx`
- Pastikan halaman yang Server Component (mis. settings) tidak memakai client-only HOC; jika perlu, balut halaman client kecil yang memuat form dan pakai `withAuth`.

## API Guard (Server-side)
- Pastikan semua route API admin memakai `withAuth` server-side di `src/lib/auth.ts` dengan `requiredRole: 'admin'` untuk mencegah 403 tidak konsisten dari client.

## Pengujian
- Jalankan aplikasi dan uji akses:
  - Login sebagai user non-admin → mencoba akses `/admin` harus redirect ke `/dashboard`.
  - Login sebagai admin → akses semua halaman admin tidak error (403/404 hilang).
- Cek konsol dan network untuk memastikan tidak ada 401/403 dari API admin.

## Deliverables
- Pembaruan guard di `AdminLayout` dan konsolidasi role `admin`.
- Penyeragaman `withAuth` di semua halaman admin.
- Validasi manual rute admin agar tidak 404.

Konfirmasi untuk melanjutkan implementasi perbaikan di atas.