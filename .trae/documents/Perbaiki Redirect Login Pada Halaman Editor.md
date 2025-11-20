## Akar Masalah
- Layout editor (`src/app/(editor)/editor/layout.tsx`) memakai Supabase browser auth (`supabase.auth.getSession()` dan `user.app_metadata.roles`).
- Sistem login saat ini memakai cookie `session-token` dan endpoint `/api/auth/session`, bukan Supabase auth.
- Akibatnya, setelah login, layout editor selalu menganggap user tidak ada dan memaksa redirect ke `/login?source=/editor/dashboard`.

## Rencana Perbaikan
### Konsolidasi Mekanisme Auth di Client
1. Ganti pengecekan auth pada `EditorLayout` agar memakai `useAuth` dari `src/contexts/AuthContext.tsx`.
2. Logika:
   - Jika `loading` → tampilkan skeleton ringan.
   - Jika `!loading && !user` → `router.replace('/login?source=/editor')`.
   - Jika `user && !hasRole('editor')` → `router.replace('/dashboard')` atau `/unauthorized`.
   - Jika lolos, render layout seperti biasa.
3. Hapus ketergantungan ke `getSupabaseBrowserClient`, `supabase.auth.getSession()`, dan `user.app_metadata.roles` dari layout editor.

### Konsistensi Role
4. Pastikan mapping role konsisten ("Section editor" → `editor`) sudah berlaku di:
   - `src/lib/auth.ts`
   - `src/lib/db.ts`
   - `src/app/api/auth/login/route.ts`
   - Middleware (sudah diarahkan ke `editor`)

### Audit Penggunaan Supabase Auth di Area Editor
5. Cari dan ganti referensi lain yang memakai `supabase.auth.*` untuk otorisasi di folder `src/app/(editor)/**` agar menggunakan `useAuth` atau `withAuth` yang sama.

## Verifikasi
- Login sebagai `editor@example.com` dengan password yang aktif.
- Buka `/editor`; tidak lagi redirect ke `/login`.
- Navigasi ke sub-halaman editor (`/editor/submissions`, `/editor/issues`) tetap akses.
- Cek `/api/auth/session` mengembalikan user dengan `roles` berisi `editor`.

## Catatan
- Perubahan hanya menyentuh client-side guard di layout editor; middleware tetap aktif untuk proteksi server-side.
- Tidak ada perubahan ke skema DB; jika role belum terisi, perlu menjalankan seeding user/role sesuai endpoint yang tersedia.