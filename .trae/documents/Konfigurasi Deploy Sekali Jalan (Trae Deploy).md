## Tujuan
- Menyediakan konfigurasi Deploy sekali-klik untuk project Next.js (OJS Clone) di Trae.
- Memastikan build, start, environment variables, dan verifikasi pascadeploy berjalan otomatis.

## Konfigurasi Deploy
- Platform: Trae Deploy
- Node.js: LTS (>=18)
- Perintah:
  - Install: `npm ci`
  - Build: `npm run build`
  - Start: `npm run start`
- Port:
  - Gunakan env `PORT` dari Trae; Next.js akan mendengar di port itu saat `npm run start`.

## Environment Variables (Production)
- `NEXT_PUBLIC_SUPABASE_URL` (nilai URL Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (secret; jangan ditulis di kode)
- `NODE_ENV=production`
- (Opsional) `NEXT_TELEMETRY_DISABLED=1`

## Secret Management
- Tandai `SUPABASE_SERVICE_ROLE_KEY` sebagai secret di Trae.
- Jangan commit secrets ke repo.

## Health Check & Routing
- Health check: gunakan `/login` atau `/` sebagai endpoint cek kesiapan.
- (Opsional) jika Trae butuh endpoint khusus: rencanakan `/api/health` sederhana yang mengembalikan 200.

## Verifikasi Pascadeploy (Smoke Tests)
- `POST /api/auth/login` (payload JSON: email/password) → 200
- Halaman:
  - `/dashboard`
  - `/author/dashboard`
  - `/reviewer/dashboard`
  - `/admin`
- Cek cookie `session-token` terset; di HTTPS gunakan cookie `secure`.

## Observabilitas
- Aktifkan logs build & runtime di Trae.
- Tinjau warning "middleware deprecated" (tidak blokir); rencanakan migrasi ke `proxy` setelah deploy stabil.

## Rollback
- Simpan preset Deploy; jika build gagal, gunakan rollback ke versi sebelumnya dari Trae UI.

## Hasil
- Satu preset Deploy Trae dengan perintah, env vars, dan health check terkonfigurasi.
- Deploy bisa dijalankan sekali klik dengan verifikasi otomatis.

Konfirmasi: setelah disetujui, saya akan menyiapkan preset Deploy di Trae dengan variabel lingkungan dan perintah sesuai, lalu menjalankan verifikasi pascadeploy.