## Diagnosis
- Error: "column journals.title does not exist" saat memuat Hosted Journals.
- Kode melakukan `select("id, title, path, description, is_public")` pada tabel `journals` di beberapa tempat.
- Artinya skema Supabase `journals` tidak memiliki kolom `title` (mungkin menggunakan `name`/`journal_title`).

## Quick Fix (Kode)
- Ubah query menjadi `select("*")` lalu mapping dengan fallback sehingga tidak memanggil kolom yang tidak ada:
  - `name: row.title || row.name || row.journal_title`
  - `path: row.path || row.slug || row.journal_path`
  - `description: row.description || row.desc || null`
  - `isPublic: row.is_public ?? row.public ?? true`
- Lokasi yang perlu diubah:
  - `src/app/(admin)/admin/site-management/hosted-journals/page.tsx`
  - `src/features/journals/data.ts`
  - `src/components/admin/top-bar.tsx`
  - `src/app/api/journals/[journalId]/settings/route.ts` (bagian select `title, description`)

## Long-Term Fix (Skema DB)
- Standarisasi tabel `journals` agar cocok dengan kode (supaya query spesifik kolom kembali aman):
  - Tambah/rename kolom:
    - `title TEXT NOT NULL`
    - `path TEXT NOT NULL UNIQUE`
    - `description TEXT NULL`
    - `is_public BOOLEAN NOT NULL DEFAULT TRUE`
    - `context_settings JSONB NOT NULL DEFAULT '{}'`
    - `created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()`
  - Migrasi data lama (contoh):
    - `UPDATE journals SET title = COALESCE(title, name, journal_title);`
    - `UPDATE journals SET path = COALESCE(path, slug, journal_path);`
    - `UPDATE journals SET is_public = COALESCE(is_public, public, TRUE);`
- Jalankan di Supabase SQL Editor, kemudian verifikasi.

## Verifikasi
- Buka `/admin/site-management/hosted-journals` → tidak ada pesan error merah.
- Top bar menampilkan daftar konteks jika lebih dari satu jurnal.
- Aksi Create/Update/Delete jurnal berfungsi.

Konfirmasi untuk menerapkan quick fix di kode sekarang, lalu saya berikan skrip SQL migrasi untuk standarisasi skema Supabase agar stabil jangka panjang.