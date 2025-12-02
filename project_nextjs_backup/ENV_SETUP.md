# Environment Setup Guide

## Quick Start

File `env.local` sudah disertakan dalam repository untuk kemudahan setup. 

### Untuk Development Lokal

1. File `env.local` sudah tersedia di root project
2. Pastikan file tersebut ada sebelum menjalankan `npm run dev`
3. Jika file tidak ada, copy dari `.env.example` dan isi dengan nilai yang sesuai

### Untuk Production

⚠️ **PENTING**: Jangan gunakan credentials dari `env.local` untuk production!

1. Buat file `.env.local` baru dengan credentials production
2. Atau gunakan environment variables di hosting platform (Vercel, Railway, dll)

## Environment Variables

File `env.local` berisi:

- `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase project Anda
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key dari Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key dari Supabase dashboard (HARUS RAHASIA!)

## Keamanan

⚠️ **PERINGATAN**: File `env.local` berisi credentials sensitif. 
- Jangan share credentials ini ke publik
- Jika credentials ter-expose, segera rotate di Supabase dashboard
- Untuk production, gunakan environment variables yang aman

## Troubleshooting

Jika terjadi error "Supabase environment belum dikonfigurasi":
1. Pastikan file `env.local` ada di root project
2. Pastikan semua variabel sudah diisi dengan benar
3. Restart development server setelah mengubah file env








