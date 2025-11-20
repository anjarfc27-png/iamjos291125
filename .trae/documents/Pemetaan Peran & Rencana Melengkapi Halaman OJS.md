## Status Saat Ini
- Autentikasi & RBAC: mapping peran aktif (Site admin, Manager, Editor/Section editor, Author, Reviewer, Reader, Subscription manager) di server; guard klien `withAuth` berjalan.
- Halaman yang sudah ada dan terjaga aksesnya:
  - Admin: Site Administration, Users, System tools, Site Settings, Site Management
  - Editor/Section editor: layout, dashboard, submissions
  - Author: dashboard, submissions, submission/new, profile, statistics, published, help
  - Reviewer: dashboard, assignments, completed, history, statistics, profile, help
- Perbaikan UX guard: tidak blank saat redirect (state loading/redirect ditampilkan).

## Gap yang Belum Lengkap
- Manager: belum ada halaman khusus (journal management ala OJS).
- Copyeditor, Proofreader, Layout Editor: belum ada dashboard/alur kerja khusus.
- Reader & Subscription manager: belum ada halaman manajemen/langganan sesuai OJS.
- Konsistensi gaya OJS klasik: beberapa halaman (terutama editor/reviewer) perlu dirapikan agar benar-benar identik.

## Rencana Implementasi
1. Stabilkan halaman Author dari error build:
   - Audit semua file untuk memastikan `'use client'` hanya di baris pertama.
   - Validasi SSR/CSR agar tidak ada import tersisip di tengah.
2. Lengkapi Reviewer secara fungsional:
   - Buat tabel penugasan (queue), detail review, aksi kirim rekomendasi.
   - Tambahkan filter (status, tanggal, jurnal) dan pagination.
3. Implementasi Manager (OJS klasik):
   - Dashboard manajemen jurnal, users per jurnal, settings (submission, review, publication).
   - Navigasi dan halaman sesuai struktur OJS 3.3.
4. Implementasi Copyeditor, Proofreader, Layout Editor:
   - Dashboard ringkas, daftar tugas per naskah, form tindakan sesuai peran.
   - Status badge & progress bar mengikuti OJS.
5. Subscription manager & Reader:
   - Halaman paket langganan, daftar langganan, riwayat pembayaran (mock dulu), akses konten untuk reader.
6. Konsistensi UI OJS klasik:
   - Samakan warna, tipografi, struktur panel, tombol teks (tanpa ikon modern), tabel, breadcrumb.
   - Terapkan konvensi yang sama di semua halaman per peran.
7. Verifikasi end-to-end:
   - Uji login untuk semua peran; pastikan guard dan redirect benar.
   - Uji rute dashboard masing-masing peran; tidak ada 404/blank.

Konfirmasi untuk menjalankan rencana di atas agar semua peran dan halaman OJS lengkap dan konsisten.