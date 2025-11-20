## Tujuan
- Audit menyeluruh frontend dan backend dibanding OJS PKP 3.3 asli.
- Samakan fitur, alur, UI/UX, dan RBAC persis seperti OJS 3.3.
- Pastikan sistem berjalan normal (build, auth, role access, API).
- Lakukan refactoring total yang sistematis dan terstruktur.

## Referensi OJS 3.3
- Peran dan akses editorial (Site Admin, Journal Manager, Editor, Section Editor, Author, Reviewer, Copyeditor, Layout Editor, Proofreader, Reader) [OJS 3.x Roles Guide](https://openjournalsystems.com/ojs-3-user-guide/roles-in-ojs/) dan [User Guide](https://openjournalsystems.com/ojs-3-user-guide/). 
- Pengaturan Workflow (Submissions, Review, Copyediting, Production) & Users & Roles [Journal Publishing Guide](https://jps.library.utoronto.ca/index.php/pubguide/setting).

## Audit Frontend (Next.js)
- Pemetaan halaman terhadap OJS 3.3:
  - Dashboard & navigasi global: `src/app/dashboard/page.tsx`, `src/components/*` → cocokkan struktur menu OJS (Editorial, Settings, Tools, Issues, Announcements, Statistics, Users & Roles).
  - Editorial workspace: `src/app/(editor)/editor/*` → pastikan halaman: Submissions, single submission `[id]` dengan tab Workflow (Submission/Review/Copyediting/Production), Issues, Announcements, Users & Roles, Statistics, Tools.
  - Settings editor: `src/app/(editor)/editor/settings/*` → lengkapi halaman Workflow (file saat ini placeholder: `settings/workflow/page.tsx`), Website, Distribution mengikuti OJS.
  - Role redirects: `(manager|copyeditor|proofreader|layout-editor|subscription-manager|reader)/page.tsx` → validasi redirect & guard.
  - Auth pages: `(public)/login`, `register`, `forgot-password`, `reset-password` → selaraskan gaya dan alur OJS.
- UI/UX kesesuaian tema klasik OJS: warna, typografi, breadcrumb, tombol & tabel. Lakukan audit CSS utilitas yang dipakai dan perbaiki komponen agar konsisten.

## Audit Backend (API)
- Endpoints yang ada (`src/app/api/**/route.ts`):
  - Auth: `auth/login`, `auth/logout`, `auth/session` → verifikasi format sesi dan cookie.
  - Editor submission APIs: `editor/submissions/*` (metadata, workflow, files, participants, reviewers, review-rounds, activity) → pastikan skema dan alur sesuai OJS.
  - Journal settings: `journals/[journalId]/settings` (context, search/indexing, theme, bulk emails) → lengkapi bagian yang belum.
  - Users management: `admin/list-users`, `admin/journals/[journalId]/users`, `journals/[journalId]/users` → samakan model user groups/roles.
  - Setup: `setup-journal`, `grant-admin`, `resolve-identity`, `test-ojs-users` (seed).
- Konsistensi Next.js 16 handler signature: semua route dengan `params: Promise<...>`; perbaiki sisa handler yang belum sesuai.
- Middleware deprecations: migrasikan `src/middleware.ts` ke konfigurasi `proxy` sesuai Next 16.
- Supabase schema: cocokkan tabel `user_groups`, `user_group_settings`, `user_user_groups`, `journal_settings`, `submission_*` dengan mapping OJS; isi seed minimum.

## Gap Analysis & Perbaikan
- Lengkapi Settings • Workflow (Submissions, Review, Copyediting, Production): forms, toggles, review forms, email templates.
- Tambahkan Issue Management (membuat issue, scheduling, TOC, publish) selaras OJS.
- Tambahkan Subscription Manager functionalities (plans, subscribers, payments dummy) bila diperlukan.
- Perbaiki RBAC: map "Section editor" → path `editor` dan pastikan akses dibatasi ke section yang ditugaskan.
- Perbaiki build error TypeScript tersisa (contoh duplikasi variabel dan signature params). Pastikan semua route lulus tipe.
- Stabilkan login 500: audit `auth/login` implementasi, sesi cookie (`session-token`) dan integrasi `lib/db.ts`.

## Refactoring Total (Terstruktur)
- Arsitektur modul:
  - Pisah layer: `features/*` (domain), `services/*` (Supabase ops), `ui/*` (komponen), `pages/*` (routing), `lib/*` (infra, auth, env).
  - Service layer terketik (TypeScript) untuk setiap domain: Auth, Users & Roles, Journals, Submissions, Issues.
- RBAC & Guard:
  - Satu util `rbac.ts` untuk mapping user_group_name → role_path, cek akses stage.
  - Hapus duplikasi `getRolePath` di `lib/db.ts` dan `lib/auth.ts` → gunakan satu sumber.
- API konsistensi:
  - Satukan pola params (Promise), error handling, response DTO, validasi dengan `zod`.
  - Hindari logic berat di route; panggil service layer.
- UI komponen:
  - Buat komponen tabel, breadcrumb, filter, panel mengikuti OJS; gunakan satu Theme util.
  - Hilangkan inline styles; gunakan class util konsisten.
- Konfigurasi & Env:
  - Validasi env di startup; fail-fast bila `SUPABASE_SERVICE_ROLE_KEY` hilang.
- Logging & Error:
  - Logger sederhana untuk server (request id, route, status), dan boundary error UI.
- Testing:
  - Unit test untuk service layer.
  - Integration test API (mock Supabase).
  - E2E alur peran utama (Author submit → Section Editor review → Copyediting → Production → Publish Issue).

## Verifikasi Fungsional
- Seed akun & roles: `test-ojs-users` menghasilkan akun untuk semua peran.
- Jalankan dev & build; pastikan tidak ada TypeScript error.
- Uji akses:
  - Login tiap peran; akses route spesifik.
  - Editorial workflow berjalan: assign reviewer, ubah tahap, unggah file, log aktivitas.
  - Settings tersimpan & termuat kembali.

## Deliverables
- Kode tersinkron dengan OJS 3.3 fitur inti.
- Build sukses tanpa error; auth & RBAC stabil.
- Refactoring dengan struktur folder dan service layer baru.
- Dokumen ringkas perubahan (changelog internal dalam PR).

## Konfirmasi
Jika Anda setuju dengan rencana ini, saya akan mulai:
1) Menuntaskan perbaikan handler params & error login; 2) Melengkapi halaman Settings • Workflow; 3) Menambah Issue Management minimal; 4) Melakukan refactoring layer & RBAC; 5) Menulis tes dan verifikasi end-to-end.