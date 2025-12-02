# Setup Environment Variables

## Quick Setup

File `env.local` sudah disertakan dalam repository untuk kemudahan setup project.

### Setelah Clone Project

1. File `env.local` sudah tersedia di root project
2. Tidak perlu membuat file baru, langsung jalankan:
   ```bash
   npm install
   npm run dev
   ```

### Jika File env.local Tidak Ada

Jika file `env.local` tidak ada setelah clone:

1. Buat file `env.local` di root project
2. Isi dengan format berikut:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (sensitive!)

## Security Note

⚠️ File `env.local` berisi credentials. Pastikan repository Anda private atau credentials sudah di-rotate jika repository public.








