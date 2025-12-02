## OJS 3.3 Gap Checklist – Project Next.js + Supabase

Ringkasan perbedaan (✅ sudah setara, ⚠ sebagian, ❌ belum) antara OJS PKP 3.3 dan project ini, disusun per domain utama.

### 1. Site Admin (berdasarkan `SITE_ADMIN_AUDIT.md`)

**Main Operations (AdminHandler)**  
- ✅ `/admin` (index) – struktur & link utama sudah mirip.  
- ✅ `/admin/contexts` → `/admin/site-management/hosted-journals`.  
- ⚠ `/admin/settings` → `/admin/site-settings/site-setup` (forms config/info perlu verifikasi kelengkapan).  
- ❌ `/admin/wizard/[journalId]` – Journal Settings Wizard belum ada.  
- ⚠ `/admin/systemInfo` → `/admin/system/system-information` (kurang version history & phpinfo page).  
- ❌ `/admin/phpinfo` – belum ada halaman.  
- ✅ `/admin/expireSessions`, `/admin/clearTemplateCache`, `/admin/clearDataCache`, `/admin/clearScheduledTaskLogFiles`.  
- ❌ Download scheduled task log file – endpoint masih belum ada.

**Site Settings Tabs**  
- Setup:
  - ⚠ Settings (FORM_SITE_CONFIG) – ada route, isi form perlu verifikasi.  
  - ⚠ Info (FORM_SITE_INFO) – ada route, isi form perlu verifikasi.  
  - ✅ Languages, Navigation Menus, Bulk Emails.  
- Appearance:
  - ❌ Theme (FORM_THEME).  
  - ❌ Appearance Setup (FORM_SITE_APPEARANCE).  
- Plugins:
  - ⚠ Installed Plugins – ada struktur, perlu cek fungsi manajemen.  
  - ❌ Plugin Gallery – belum ada.

**System Information**  
- ✅ OJS/version info dasar, konfigurasi, server info.  
- ❌ Version history.  
- ❌ PHP info page (extended).

**Status Site Admin**: ⚠ Sekitar 75% – perlu Wizard, Appearance tab, version check warning, beberapa tools tambahan.

---

### 2. Editor Role & Workflow (berdasarkan `EDITOR_ROLE_COMPREHENSIVE_AUDIT_FINAL.md`)

**Editor Decisions & Workflow**  
- ✅ Semua konstanta keputusan utama (accept/decline/revisions/resubmit/new round/send to production/revert decline/recommendations) sudah cocok dengan OJS dan terhubung ke `saveEditorDecision`.  
- ✅ Workflow stage (submission, review, copyediting, production) dan tombol keputusan dasar di setiap stage sudah lengkap.  
- ✅ Aksi copyediting lanjutan (request author copyedit) dan produksi (send to issue) kini mengikuti jalur resmi (API `workflow` + Issue assignment).  
- ⚠ Schedule/publish masih perlu disatukan dengan Issue tab dan galley workflow penuh. Rujuk `EDITOR_DECISION_MAPPING_2025.md` & `REVIEW_ROUND_CHECKLIST.md` untuk langkah uji manual.

**Frontend Workflow Pages**  
- ✅ Editor dashboard dengan queue (My Queue, Unassigned, All Active, Archives).  
- ✅ Submission detail dengan tabs Summary, Review, Copyediting, Production, Publication.  
- ✅ Komponen utama: workflow-tabs, workflow-stage-view, workflow-header, progress bar, decision modals.  
- ⚠ Halaman tambahan (Announcements, Issues Management, Statistics, Tools, Users & Roles) belum diaudit satu-per-satu terhadap OJS.

**Backend Actions & API**  
- ✅ Server actions untuk decisions, participant assignment, reviewer assignment, production files, queries (berdasarkan audit).  
- ✅ API utama editor (`/api/editor/submissions/...`) untuk activity, files, metadata, participants, review rounds, reviewers, workflow.  
- ⚠ Area yang masih perlu real implementation penuh:
  - File download: API sudah ada secara struktur, perlu pastikan real file streaming.  
  - File upload: masih basic placeholder di beberapa tempat.  
  - Queries: server actions & API perlu pastikan benar-benar menyimpan ke tabel OJS queries (bukan dummy).

**Status Editor**: ✅ Core workflow ~95–98% selaras; beberapa API teknis (file streaming, upload, sebagian queries & publication operations) masih perlu pematangan.

---

### 3. Database & Roles (berdasarkan `001_ojs_schema.sql`, `202511170001_ojs_core.sql`, `SUPABASE_SETUP.md`)

**Schema Inti OJS (001_ojs_schema.sql)**  
- ✅ Tabel users, user_settings, journals, journal_settings sudah sesuai pola OJS.  
- ✅ Tabel user_groups, user_group_settings, user_user_groups ada – ini adalah model role/grup OJS 3.3.  
- ✅ Tabel submissions, publications, publication_settings, dll. sudah ada dan mengikuti desain OJS.  
- ⚠ Beberapa tabel domain lain (issues, review_assignments, queries, dsb.) perlu dicek satu-satu terhadap schema OJS referensi (nama kolom, tipe, constraint).

**Schema Tambahan / Helper (202511170001_ojs_core.sql)**  
- ✅ `site_settings`, `site_information`, `site_languages`, `site_navigation`, `site_bulk_emails`, `site_appearance`, `site_plugins` – wrapper konfigurasi site modern; konsep selaras dengan OJS tapi bentuk tabel lebih simpel.  
- ⚠ Duplikasi domain:
  - `public.journals` di sini memuat kolom tambahan (`title`, `description`, `is_public`, `context_settings`) yang tidak persis 1:1 dengan schema OJS di `001_ojs_schema.sql`.  
  - `journal_user_roles` adalah layer awal sebelum migrasi penuh ke `user_groups`/`user_user_groups`.

**User & Role Setup Lama (`SUPABASE_SETUP.md`)**  
- ⚠ Ada tabel `user_accounts` dan `user_account_roles` yang dipakai untuk dummy users / login awal.  
- Saat ini:
  - `user_account_roles` masih dipakai oleh `permissions.ts` untuk site-level roles (`admin`, dsb).  
  - Schema OJS (`users`, `user_groups`, `user_user_groups`) dipakai untuk role jurnal.

**Status Database/Roles**: ⚠ Secara garis besar schema OJS sudah ada; masih ada lapisan/tabel helper (user_accounts, journal_user_roles, public.journals versi lama) yang perlu dipastikan hanya menjadi kompatibilitas & tidak menggantikan logika OJS.

---

### 4. Permissions & Access Control (berdasarkan `src/lib/permissions.ts`)

- ✅ Site admin:
  - `requireSiteAdmin()` → cek `user_account_roles` dengan `role_path = 'admin'`, konteks global (context_id null).  
- ✅ Journal roles:
  - `requireJournalRole()` + `hasUserJournalRole()` → memakai `user_user_groups` dan `user_groups.role_id` yang dimapping ke konstanta role ID OJS (manager/editor 16, section_editor 17, reviewer 4096, author 65536, dll.).  
- ⚠ Belum ada satu modul pusat yang mendokumentasikan **semua** izin per aksi (mis. siapa boleh assign reviewer, siapa boleh lihat statistik, siapa boleh mengelola kontek, dsb); masih tersebar di API/komponen masing-masing.

**Status Permissions**: ⚠ Pondasi sudah OJS-correct; perlu dokumentasi & konsolidasi fungsi izin granular.

---

### 5. CRUD Entity Utama

- **Submissions & Files**
  - ✅ Grid submission, detail view, metadata editing, file grid, copy files, selection untuk decisions.  
  - ⚠ File upload/download belum 100% real lengkap (storage Supabase & streaming).
- **Issues & Publication**
  - ✅ Publication tab dengan tabs title/abstract, contributors, metadata, citations, identifiers, galleys, license, issue assignment.  
  - ⚠ Beberapa tab masih placeholder (citations, identifiers, license) meskipun struktur ada.  
  - ⚠ Logic publish/schedule/unpublish & create version perlu verifikasi penuh ke tabel OJS (publications, issues, issue_settings, dst.).
- **Journals / Hosted Journals**
  - ✅ Hosted journals list & create.  
  - ⚠ Edit journal & wizard per journal dari Site Admin belum penuh seperti OJS 3.3.
- **Users & Roles**
  - ✅ Site admin punya halaman `/admin/users` untuk manajemen user dasar.  
  - ⚠ Belum semua operasi role assignment/management mengikuti UI aslinya OJS (yang menggunakan grid user+role per jurnal).

**Status CRUD**: ⚠ Inti sudah ada, namun beberapa operasi lanjutan (publikasi, wizard journal, assignment role detail) perlu dilengkapi.

---

### 6. UI & Layout vs OJS 3.3

- ✅ Layout per role (admin, manager, editor, author, reviewer, dll.) sudah mengikuti struktur OJS: sidebar, header, breadcrumbs, tabel.  
- ✅ Banyak halaman (manager dashboard, admin hosted journals, editor workflow) sudah disesuaikan agar mirip tampilan OJS namun dengan tema iamJOS.  
- ✅ Navigasi Site Admin & Manager sekarang identik urutan/labelnya dengan OJS 3.3 (rujuk `NAVIGATION_AUDIT.md`).  
- ✅ Halaman Manager → Submissions sudah memakai layout tabel + filter ala OJS (safe area, baris filter, kolom stage/status/assignment).  
- ✅ Halaman Manager → Users & Roles juga diseragamkan (header bar, filter sederhana, tabel striping khas OJS).  
- ⚠ Beberapa halaman masih punya elemen modern/baru (cards/statistik tertentu, dashboard tambahan) yang tidak ada di OJS.  
- ⚠ Beberapa detail UI yang masih perlu disejajarkan:
  - Tata letak safe area di sejumlah halaman admin/manager.  
  - Struktur tabs di Site Settings (nested vs flat).  
  - Menus tertentu seperti Appearance/Plugins yang belum lengkap.

**Status UI**: ⚠ Sebagian besar sudah mirip, namun belum 100% identik di semua halaman & tabs.

---

### 7. Testing & Checklist

- ✅ Sudah ada beberapa audit komprehensif per role (Site Admin, Editor).  
- ⚠ Belum ada satu file checklist uji fungsional gabungan per role (Author, Reviewer, Editor, Manager, Site Admin, dsb.) yang siap dieksekusi manual/otomatis.  
- ⚠ Belum ada set test otomatis yang memverifikasi behavior kritis (decisions, publication, queries) terhadap schema OJS.

---

### Ringkasan Status Global

- **Site Admin**: ⚠ 70–80% – perlu Wizard, Appearance tab, beberapa tools & warning tambahan.  
- **Editor & Workflow**: ✅ ~95–98% – core flow sudah sangat dekat dengan OJS; sisanya adalah detail teknis API & beberapa operasi publication.  
- **Database & Roles**: ⚠ Pondasi OJS sudah ada, masih ada beberapa tabel helper/legacy yang perlu dikendalikan pemakaiannya.  
- **Permissions**: ⚠ Sudah memakai model OJS (user_groups/user_user_groups), perlu konsolidasi & dokumentasi izin per aksi.  
- **CRUD & Publikasi**: ⚠ Inti jalan, tapi issue publishing, wizard journal, dan role management detail belum sepenuhnya identik.  
- **UI**: ⚠ Layout mayoritas sudah mirip OJS 3.3, beberapa halaman/tabs masih perlu disejajarkan 100%.  


