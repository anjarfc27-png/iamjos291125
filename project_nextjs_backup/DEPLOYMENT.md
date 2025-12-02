# Panduan Deployment ke Vercel

## ⚠️ PENTING: Setup Database Terlebih Dahulu!

Sebelum deploy, pastikan Anda sudah:
1. ✅ Setup tabel di Supabase (lihat `SUPABASE_SETUP.md`)
2. ✅ Insert data dummy user (lihat `SUPABASE_SETUP.md`)
3. ✅ Test login di localhost dulu

## Environment Variables yang Diperlukan

Project ini memerlukan 3 environment variables dari Supabase:

1. **NEXT_PUBLIC_SUPABASE_URL** - URL Supabase project Anda
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Anon/Public key dari Supabase
3. **SUPABASE_SERVICE_ROLE_KEY** - Service Role key (RAHASIA, hanya untuk server-side)

## Cara Menambahkan Environment Variables di Vercel

### Langkah 1: Login ke Vercel Dashboard
1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub account Anda

### Langkah 2: Import Project
1. Klik **"Add New..."** → **"Project"**
2. Pilih repository GitHub Anda
3. Klik **"Import"**

### Langkah 3: Tambahkan Environment Variables
1. Setelah import, klik **"Settings"** di project Anda
2. Pilih tab **"Environment Variables"** di sidebar kiri
3. Tambahkan setiap variable satu per satu:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: URL Supabase Anda (contoh: `https://abcjyjmaaiutnnadwftz.supabase.co`)
   - Environment: Pilih semua (Production, Preview, Development)
   - Klik **"Save"**

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Anon key dari Supabase dashboard
   - Environment: Pilih semua (Production, Preview, Development)
   - Klik **"Save"**

   **Variable 3:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Service Role key dari Supabase dashboard
   - Environment: Pilih semua (Production, Preview, Development)
   - Klik **"Save"**

### Langkah 4: Deploy
1. Setelah semua environment variables ditambahkan
2. Klik **"Deployments"** tab
3. Klik **"Redeploy"** pada deployment terbaru (atau push commit baru ke GitHub)
4. Vercel akan otomatis rebuild dengan environment variables baru

## Cara Mendapatkan Supabase Keys

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka **Settings** → **API**
4. Copy:
   - **Project URL** → untuk `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → untuk `SUPABASE_SERVICE_ROLE_KEY` (RAHASIA!)

## Untuk Development Lokal

Buat file `.env.local` di root project (salin dari `env.local` yang sudah ada):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**PENTING:** 
- File `.env.local` sudah ada di `.gitignore`, jadi tidak akan ter-commit ke GitHub
- Jangan commit file `.env.local` ke repository!
- Service Role Key sangat sensitif, jangan pernah expose ke client-side

## Troubleshooting

Jika deployment gagal:
1. Pastikan semua 3 environment variables sudah ditambahkan
2. Pastikan tidak ada typo pada nama variable
3. Pastikan value sudah benar (copy-paste dari Supabase dashboard)
4. Cek build logs di Vercel untuk error detail

