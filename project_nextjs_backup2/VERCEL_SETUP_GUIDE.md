# 📘 Panduan Lengkap Setup Vercel Deployment

## 🎯 Jawaban Singkat

1. **Root Directory**: Hanya folder `project_nextjs` ✅
2. **Build & Output Settings**: Tidak perlu di-centang semua, biarkan default ✅
3. **Environment Variables**: 3 variabel (lihat di bawah) ✅

---

## 📁 1. ROOT DIRECTORY (Folder yang di-deploy)

### ✅ Yang Benar:
- **Root Directory**: `project_nextjs`
- **JANGAN** deploy semua folder (jangan root `ojsclone`)

### Cara Setting di Vercel:

1. Setelah import project dari GitHub
2. Di halaman **"Configure Project"**
3. Cari bagian **"Root Directory"**
4. Klik **"Edit"** atau **"Override"**
5. Ketik: `project_nextjs`
6. Klik **"Continue"**

**Visual Guide:**
```
Root Directory: [project_nextjs]  ← Ketik ini
```

---

## ⚙️ 2. BUILD & OUTPUT SETTINGS

### ✅ Setting yang Benar:

**Framework Preset:**
- Pilih: **"Next.js"** (otomatis terdeteksi)

**Build Command:**
- Biarkan default: `npm run build` atau `next build`
- ✅ Jangan ubah kecuali ada kebutuhan khusus

**Output Directory:**
- Biarkan **KOSONG** (Next.js otomatis menggunakan `.next`)
- ❌ Jangan isi apapun di sini

**Install Command:**
- Biarkan default: `npm install` atau `yarn install`
- ✅ Tidak perlu diubah

**Development Command:**
- Biarkan default: `next dev`
- ✅ Tidak perlu diubah

### ❌ Yang TIDAK Perlu Di-centang:
- ❌ "Override" untuk Build Command (kecuali ada masalah)
- ❌ "Override" untuk Output Directory
- ❌ "Override" untuk Install Command

**Kesimpulan:** Biarkan semua default, Vercel sudah otomatis detect Next.js! ✅

---

## 🔐 3. ENVIRONMENT VARIABLES

### ✅ 3 Environment Variables yang WAJIB:

Tambahkan **3 variabel** berikut di Vercel:

### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: https://abcjyjmaaiutnnadwftz.supabase.co
       (ganti dengan URL Supabase project Anda)
Environment: ✅ Production ✅ Preview ✅ Development
```

### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       (ganti dengan anon key dari Supabase)
Environment: ✅ Production ✅ Preview ✅ Development
```

### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
Name:  SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       (ganti dengan service_role key dari Supabase)
Environment: ✅ Production ✅ Preview ✅ Development
```

---

## 📝 Cara Menambahkan Environment Variables di Vercel

### Langkah Detail:

1. **Login ke Vercel Dashboard**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub account

2. **Pilih Project**
   - Klik project Anda (atau import project baru)

3. **Buka Settings**
   - Klik tab **"Settings"** di bagian atas
   - Scroll ke bawah, klik **"Environment Variables"** di sidebar kiri

4. **Tambah Variable Pertama**
   - Klik tombol **"Add New"**
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: URL Supabase Anda (contoh: `https://abcjyjmaaiutnnadwftz.supabase.co`)
   - **Environment**: Centang semua (Production, Preview, Development)
   - Klik **"Save"**

5. **Tambah Variable Kedua**
   - Klik tombol **"Add New"** lagi
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Anon key dari Supabase
   - **Environment**: Centang semua
   - Klik **"Save"**

6. **Tambah Variable Ketiga**
   - Klik tombol **"Add New"** lagi
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Service Role key dari Supabase
   - **Environment**: Centang semua
   - Klik **"Save"**

---

## 🔑 Cara Mendapatkan Supabase Keys

### Langkah-langkah:

1. **Login ke Supabase Dashboard**
   - Buka [app.supabase.com](https://app.supabase.com)
   - Login dengan account Anda

2. **Pilih Project**
   - Pilih project Supabase Anda

3. **Buka Settings → API**
   - Klik **"Settings"** (ikon gear) di sidebar kiri
   - Klik **"API"** di menu Settings

4. **Copy Keys**
   - **Project URL** → Copy untuk `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Copy untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Copy untuk `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ **PENTING**: Service Role key sangat sensitif! Jangan expose ke client-side!

---

## ✅ Checklist Sebelum Deploy

Sebelum deploy, pastikan:

- [ ] ✅ Root Directory sudah di-set ke `project_nextjs`
- [ ] ✅ Build Command: `npm run build` (default)
- [ ] ✅ Output Directory: **KOSONG** (biarkan default)
- [ ] ✅ Environment Variable 1: `NEXT_PUBLIC_SUPABASE_URL` sudah ditambahkan
- [ ] ✅ Environment Variable 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah ditambahkan
- [ ] ✅ Environment Variable 3: `SUPABASE_SERVICE_ROLE_KEY` sudah ditambahkan
- [ ] ✅ Semua environment variables sudah di-set untuk Production, Preview, dan Development
- [ ] ✅ Database Supabase sudah di-setup (tabel sudah dibuat)
- [ ] ✅ Data dummy user sudah di-insert ke database

---

## 🚀 Setelah Setup, Deploy

1. **Klik "Deploy"** di halaman configure project
2. Atau jika sudah pernah deploy, klik **"Redeploy"** di tab Deployments
3. Tunggu build selesai (biasanya 2-5 menit)
4. Cek hasil di URL yang diberikan Vercel

---

## 🐛 Troubleshooting

### Error: "Build failed"
- ✅ Pastikan Root Directory sudah benar: `project_nextjs`
- ✅ Pastikan semua 3 environment variables sudah ditambahkan
- ✅ Cek build logs di Vercel untuk detail error

### Error: "Environment variables not found"
- ✅ Pastikan nama variable **persis** sama (case-sensitive):
  - `NEXT_PUBLIC_SUPABASE_URL` (huruf besar semua)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Pastikan sudah di-set untuk environment yang benar (Production/Preview/Development)

### Error: "Cannot connect to Supabase"
- ✅ Pastikan URL Supabase sudah benar
- ✅ Pastikan keys sudah benar (copy-paste dari Supabase dashboard)
- ✅ Pastikan Supabase project masih aktif

### Build sukses tapi aplikasi error
- ✅ Cek browser console untuk error detail
- ✅ Pastikan database sudah di-setup dengan benar
- ✅ Pastikan data dummy user sudah di-insert

---

## 📸 Visual Guide (Ringkasan)

```
┌─────────────────────────────────────┐
│  VERCEL PROJECT SETTINGS            │
├─────────────────────────────────────┤
│                                     │
│  Root Directory:                   │
│  [project_nextjs]  ← Ketik ini     │
│                                     │
│  Framework Preset:                  │
│  [Next.js]  ← Auto-detect          │
│                                     │
│  Build Command:                     │
│  [npm run build]  ← Default        │
│                                     │
│  Output Directory:                  │
│  []  ← KOSONG, biarkan default     │
│                                     │
│  Install Command:                   │
│  [npm install]  ← Default           │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ENVIRONMENT VARIABLES              │
├─────────────────────────────────────┤
│                                     │
│  1. NEXT_PUBLIC_SUPABASE_URL       │
│     Value: https://xxx.supabase.co │
│     ✅ Production ✅ Preview ✅ Dev │
│                                     │
│  2. NEXT_PUBLIC_SUPABASE_ANON_KEY  │
│     Value: eyJhbGciOiJIUzI1NiIs... │
│     ✅ Production ✅ Preview ✅ Dev │
│                                     │
│  3. SUPABASE_SERVICE_ROLE_KEY      │
│     Value: eyJhbGciOiJIUzI1NiIs... │
│     ✅ Production ✅ Preview ✅ Dev │
│                                     │
└─────────────────────────────────────┘
```

---

## 💡 Tips

1. **Jangan commit `.env.local`** ke GitHub (sudah ada di `.gitignore`)
2. **Service Role Key** sangat sensitif, jangan pernah expose ke client-side
3. **Root Directory** harus tepat: `project_nextjs` (bukan `project_nextjs/` dengan slash di akhir)
4. Setelah menambah environment variables, **redeploy** project agar perubahan ter-apply

---

## 📞 Butuh Bantuan?

Jika masih ada masalah:
1. Cek build logs di Vercel Dashboard → Deployments → Klik deployment terbaru
2. Cek browser console untuk error detail
3. Pastikan semua checklist di atas sudah dilakukan

---

**Selamat Deploy! 🚀**

