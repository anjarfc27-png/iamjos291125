## Ringkasan Tujuan
- Samakan tampilan, alur UI/UX, fitur, dan fungsi backend halaman **Admin Site** dengan OJS PKP 3.3 asli.
- Terapkan pada project `project_nextjs` (Next.js 16, Tailwind 4, Supabase).

## Cakupan Fitur Admin yang Ditargetkan
1. **Site Settings**: judul/logo, tema/warna, footer HTML, kontak/support.
2. **Site Setup**: Languages, Navigation, Bulk Emails, Information.
3. **Hosted Journals**: daftar, tambah, edit, hapus, setelan konteks (name/initials/abbreviation/publisher/ISSN/focus-scope) & tema.
4. **Plugins (Site Plugins)**: daftar plugin, enable/disable (paritas UI; backend minimal toggle di tabel).
5. **System**: System Information, expire sessions, clear caches, clear template cache, clear scheduled tasks (paritas UI + endpoint admin untuk operasi terkait).

## Pemetaan ke Kode Saat Ini
- Struktur admin sudah ada: `src/app/(admin)/admin/site-settings/*`, `site-management/hosted-journals`, `site-setup/*`, `system/*`.
- Supabase client: `src/lib/supabase/*` menggunakan `env.ts`.
- Aksi server sudah tersedia untuk banyak fitur: `admin/site-settings/actions.ts`, `admin/site-management/hosted-journals/actions.ts`.

## Perbedaan dari OJS 3.3 Asli (PHP)
- OJS 3.3 berbasis PHP/Smarty; project kita SPA/Next.js. Paritas fokus pada **fungsi & UI/UX**, bukan teknologi.
- Data disimpan di Supabase; perlu **skema tabel** yang menampung setelan situs & jurnal sesuai model OJS.

## Rencana Implementasi UI/UX
1. **Navigasi & Layout**
- Header bar bergaya OJS: judul/branding, dropdown contexts, user menu; sidebar tab untuk Admin.
- Breadcrumbs konsisten & aksi tombol utama di kanan.
2. **Tema & Styling**
- Palet warna default OJS (biru tua), tipografi, spacing; komponen konsisten (`Button`, `Input`, `Dropdown`).
- Responsif & aksesibilitas: fokus state, aria-labels, kontrast.
3. **Halaman**
- Site Settings: formulir dan preview logo/warna.
- Site Setup: empat sub-tab lengkap (Settings/Information/Languages/Navigation/Bulk Emails) dengan validasi.
- Hosted Journals: grid/list dengan pencarian/sorting; dialog tambah/edit; halaman detail setelan.
- Plugins: daftar dengan toggle.
- System: kartu aksi + halaman detail informasi.

## Rencana Backend & Data
1. **Validasi Environment**
- Pastikan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` terisi.
2. **Skema Supabase (paritas minimal)**
- Tabel: `site_settings`, `site_appearance`, `site_information`, `site_languages`, `site_navigation`, `site_plugins`.
- Jurnal: `journals`, `journal_settings`, `journal_user_roles`, `site_appearance` (tema), `journal_bulk_email_roles`.
- System ops: tabel log opsional (untuk clear caches/scheduled tasks).
3. **Server Actions/Routes**
- Lengkapi `admin/site-settings/actions.ts` untuk semua tab.
- `admin/site-management/hosted-journals/actions.ts`: tambah edit hapus + setelan konteks & tema.
- API route tambahan untuk **plugins** dan **system** ops.
4. **Auth & Roles**
- Gunakan session Supabase; pastikan peran admin di `journal_user_roles`/`user_accounts` untuk akses.

## Migrasi Data dari OJS PHP 3.3
- Baca struktur di folder `ojs_php_asli_3.3`, petakan field penting ke tabel Supabase.
- Buat skrip migrasi (SQL) untuk seeding: users, journals, settings (ambil dari `dbscripts/xml/install.xml` & migrasi buatan kita di `supabase/migrations`).

## Pengujian & Verifikasi
- Unit test untuk aksi server & validasi zod.
- E2E ringan (playwright/cypress) untuk flow admin utama.
- Manual QA: jalur happy path & error handling.

## Langkah Implementasi Bertahap
1. Lengkapi tab **Site Settings** dan **Site Setup** (UI/aksi server) dengan validasi & feedback.
2. Perkaya **Hosted Journals** (CRUD penuh + detail konteks/tema).
3. Tambahkan **Plugins** page (UI + toggle Supabase).
4. Tambahkan **System** ops (UI + endpoint admin; placeholder aman jika tidak ada cache scheduler).
5. Refinement UI/UX: header, sidebar, breadcrumbs, responsif, aksesibilitas.
6. Migrasi/seed data awal agar paritas terlihat.

## Deliverables
- Halaman Admin dengan paritas OJS 3.3 (fitur inti), UI/UX rapi.
- Aksi server & API yang stabil di Supabase.
- Skrip migrasi/seed untuk data demo.

## Permintaan Konfirmasi
- Setuju dengan cakupan & urutan pengerjaan? Setelah konfirmasi, saya akan mulai mengimplementasikan tahap 1–2 lalu lanjut ke tahap berikutnya hingga seluruh paritas tercapai.