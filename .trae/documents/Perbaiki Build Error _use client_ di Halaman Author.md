## Diagnosa
- Error muncul karena ada `'use client'` kedua di tengah file `src/app/(author)/author/dashboard/page.tsx:114`.
- Next.js mensyaratkan `'use client'` berada tepat di baris pertama file sebelum ekspresi/import apa pun.
- Kemungkinan terjadi sisa merge/edit yang menambahkan literal `'use client'` di tengah file, serta cache build yang menyimpan state lama.

## Langkah Perbaikan
1. Audit dan bersihkan file:
   - Hapus baris `'use client'` di tengah file (`src/app/(author)/author/dashboard/page.tsx:114`).
   - Pastikan hanya ada satu `'use client'` di `src/app/(author)/author/dashboard/page.tsx:1`.
   - Pastikan semua `import` (termasuk `import { withAuth } from '@/lib/auth-client'`) berada setelah directive dan di bagian import atas file.
2. Bersihkan cache build:
   - Hentikan dev server yang aktif.
   - Hapus folder `'.next'` di proyek.
   - Jalankan ulang `npm run dev` pada port `3000`.
3. Verifikasi kompilasi:
   - Akses `http://localhost:3000/author/dashboard` dan pastikan status 200 serta tidak ada error build.
   - Jika belum login, halaman akan menampilkan form `login` (ini sesuai).
4. Uji login author:
   - Buka `http://localhost:3000/login` dan login dengan kredensial author.
   - Pastikan API `POST /api/auth/login` menerima payload JSON dan mengembalikan 200, kemudian redirect ke `/dashboard` atau rute sumber.
5. Cegah regresi:
   - Jalankan pencarian di repo untuk mendeteksi `'use client'` yang tidak berada di baris pertama di semua file `.tsx`.
   - Perbaiki jika ada kasus serupa (khususnya halaman di `(author)`, `(reviewer)`, `(editor)`).
   - Opsi: tambahkan aturan lint/codemod sederhana untuk memastikan `'use client'` hanya di baris pertama.

## Hasil Diharapkan
- Build bersih tanpa error `'use client'` di tengah file.
- Halaman `Author Dashboard` dapat dirender dan alur login berjalan normal.
- Tidak ada lagi error serupa di halaman lain.

Konfirmasi untuk menjalankan langkah-langkah di atas sekarang.