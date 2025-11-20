## Prasyarat & Checklist
- Pastikan build di lokal bersih: `npm run build` berjalan tanpa error.
- Siapkan environment variables di platform produksi:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Pastikan hanya ada satu `'use client'` di baris pertama tiap file client component.
- `NODE_ENV=production` untuk mengaktifkan cookie `secure` di sesi.

## Opsi A — Deploy ke Vercel (direkomendasikan untuk Next.js)
- Hubungkan repo ke Vercel Dashboard.
- Tambahkan Environment Variables (Production): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Konfigurasi Build:
  - Framework: Next.js
  - Command: otomatis (Vercel akan memanggil `next build`).
- Deploy: klik Deploy; tunggu build selesai.
- Verifikasi URL produksi:
  - `/login` (form muncul)
  - `POST /api/auth/login` (respon 200)
  - `/dashboard`, `/author/dashboard`, `/reviewer/dashboard`, `/admin` (guard dan navigasi berjalan).

## Opsi B — Self-host di Windows (Node server)
- Di server produksi:
  - Install Node.js LTS.
  - Salin project (atau git clone).
  - Jalankan: `npm ci` → `npm run build` → `npm run start`.
- Set environment variables di sistem (PowerShell/Environment Variables) untuk `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Jalankan di belakang reverse proxy (opsional):
  - IIS/NGINX untuk SSL & domain; proxy ke port `3000`.
- Jadikan service (opsional):
  - Gunakan PM2 atau NSSM untuk menjalankan `npm run start` sebagai service.
- Verifikasi akses publik dan cookie `secure` di HTTPS.

## Opsi C — Docker (opsional)
- Buat Dockerfile Node 18, copy project, `npm ci`, `npm run build`, `npm run start`.
- Set environment variables di container.
- Jalankan di orchestrator (Docker Compose/Kubernetes) dengan reverse proxy untuk SSL.

## Pasca-Deploy: Uji End-to-End
- Uji login `author@example.com`/`password`.
- Buka `/author/dashboard`, `/reviewer/dashboard`, `/admin`.
- Perhatikan warning “middleware deprecated”; tidak blokir deploy, nanti kita migrasi ke `proxy`.

Konfirmasi opsi deploy yang Anda pilih (Vercel atau Self-host Windows/Docker), lalu saya bantu siapkan langkah rinci dan verifikasi produksi.