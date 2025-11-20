## Target Deploy
- Workspace: `d:\ojsclone\project_nextjs`
- Framework: Next.js 16 (Turbopack, production)

## Konfigurasi Deploy
- Working directory: `d:\ojsclone\project_nextjs`
- Node version: LTS (≥ 18)
- Commands:
  - Install: `npm ci`
  - Build: `npm run build`
  - Start: `npm run start`
- Port:
  - Gunakan env `PORT` yang disediakan Trae (Next.js akan listen otomatis saat `npm run start`).

## Environment Variables (Production)
- `NEXT_PUBLIC_SUPABASE_URL` → URL instance Supabase Anda
- `SUPABASE_SERVICE_ROLE_KEY` → kunci service role Supabase (mark as secret)
- `NODE_ENV=production`
- (Opsional) `NEXT_TELEMETRY_DISABLED=1`

## Health Check & Routing
- Health check endpoint: `/login` atau `/` (keduanya cepat dan ringan)
- Trae akan menandai deployment siap saat endpoint merespons 200

## Langkah One‑Click di Trae
1. Klik `Deploy` → `New Deployment`
2. Pilih project dan set Working Directory ke `d:\ojsclone\project_nextjs`
3. Isi Commands (Install/Build/Start) seperti di atas
4. Tambahkan Environment Variables (pastikan `SUPABASE_SERVICE_ROLE_KEY` sebagai secret)
5. Jalankan Deploy dan pantau logs build sampai status `Ready`

## Verifikasi Pascadeploy
- API: `POST /api/auth/login` (JSON `{"email":"author@example.com","password":"password"}`) → status 200
- Halaman: `/login`, `/dashboard`, `/author/dashboard`, `/reviewer/dashboard`, `/admin`
- Cek cookie `session-token` terset; untuk HTTPS gunakan cookie `secure`

## Catatan
- Warning "middleware deprecated" tidak menghalangi deploy; migrasi ke `proxy` bisa dilakukan setelah produksi stabil.

Konfirmasi: jika setuju, saya akan menyiapkan preset Deploy Trae dengan direktori `project_nextjs`, sehingga Anda bisa deploy sekali klik.