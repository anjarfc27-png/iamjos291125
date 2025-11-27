## Kontrak Sistem OJS PKP 3.3 untuk Project Next.js + Supabase

Dokumen ini merangkum **role**, **tabel inti**, **workflow**, dan **permission garis besar** OJS 3.3 sebagaimana diimplementasikan di project ini. Tujuannya menjadi referensi tunggal saat menyamakan fitur/flow dengan OJS asli.

### 1. Role Resmi dan Mapping

- **Site-level**
  - Site Administrator → akses penuh ke seluruh site (`/admin`, semua jurnal).
- **Journal-level (per context/journal)**
  - Journal Manager (Manager)
  - Editor
  - Section Editor
  - Guest Editor
  - Copyeditor
  - Layout Editor
  - Proofreader
  - Reviewer
  - Author
  - Reader
  - Subscription Manager

Di database OJS:

- Role direpresentasikan via:
  - `user_groups(role_id, context_id, ...)`
  - `user_group_settings`
  - `user_user_groups(user_id, user_group_id)`

Di project Next.js:

- Site-level helper: `user_account_roles` (role_path `admin`, `manager`, dll.) untuk akses global.
- Journal-level: memakai **tabel OJS**:
  - `user_groups.role_id` untuk tipe role (menggunakan kode OJS: manager/editor 16, section_editor 17, reviewer 4096, author 65536, dll.).
  - `user_groups.context_id` mengacu ke `journals.id`.
  - `user_user_groups` mengaitkan user ke `user_groups`.

Modul izin utama: `src/lib/permissions.ts`:

- `getCurrentUser` mengembalikan user + `user_account_roles` (site/global).
- `hasUserSiteRole(userId, "admin")` → cek role site-level.
- `hasUserJournalRole(userId, journalId, rolePaths[])` → mapping `role_path` ke `role_id` OJS lalu cek di `user_user_groups.user_groups`.

### 2. Tabel Inti & Struktur Data (Ringkasan)

Mengacu ke `supabase/migrations/001_ojs_schema.sql` sebagai **schema OJS utama**.

- **Users & Settings**
  - `users(id uuid, username, email, password, ...)`
  - `user_settings(user_id, setting_name, setting_value, setting_type, locale)`
- **Journals / Contexts**
  - `journals(id uuid, path, enabled, primary_locale, ...)`
  - `journal_settings(journal_id, setting_name, setting_value, setting_type, locale)`
- **Roles & User Groups**
  - `user_groups(id, context_id, role_id, is_default, show_title, permit_self_registration, permit_metadata_edit, recommend_only, ...)`
  - `user_group_settings(user_group_id, setting_name, setting_value, setting_type, locale)`
  - `user_user_groups(user_id, user_group_id, created_at)`
- **Submissions & Publications**
  - `submissions(id, context_id, stage_id, status, current_publication_id, date_submitted, date_last_activity, ...)`
  - `publications(id, submission_id, version, status, primary_locale, date_published, ...)`
  - `publication_settings(publication_id, setting_name, setting_value, setting_type, locale)`
- **Files & Production**
  - `submission_files` (+ tipe file OJS 3.3: submission/review/attachment/final/production_ready/public, dll.)
  - `submission_galleys` dan terkait (galley untuk publikasi).
- **Review & Workflow**
  - `review_rounds` (tiap ronde review per submission/stage).
  - `review_assignments` (penugasan reviewer).
  - `edit_decisions` (keputusan editor per ronde/stage).
- **Queries / Discussions**
  - `queries`, `query_participants`, `query_notifications`, `query_settings` (diskusi internal per submission).
- **Issues & Scheduling**
  - `issues`, `issue_settings`, tabel relasi issue ↔ publikasi/submission.

Project ini juga memiliki schema tambahan di `supabase/migrations/202511170001_ojs_core.sql` untuk:

- `site_settings`, `site_information`, `site_languages`, `site_navigation`, `site_bulk_emails`, `site_appearance`, `site_plugins`
- Plus beberapa helper untuk integrasi UI iamJOS.

Schema tersebut berfungsi sebagai **wrapper/konfigurasi site** dan tetap konsisten secara konsep dengan OJS (yang menyimpan konfigurasi site dalam tabel settings).

### 3. Workflow & State Machine

Workflow mengikuti OJS 3.3:

1. **Submission Stage** (`stage_id = 1` / `"submission"`)
   - Aksi:
     - Send to External Review (`SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW = 8`)
     - Accept (Skip Review) (`ACCEPT = 1`)
     - Initial Decline (`INITIAL_DECLINE = 9`)
     - Revert Decline (`REVERT_DECLINE = 17`)
2. **External Review Stage** (`stage_id = 3` / `"review"`)
   - Aksi:
     - Request Revisions (`PENDING_REVISIONS = 2`)
     - Resubmit for Review (`RESUBMIT = 3`)
     - New Review Round (`NEW_ROUND = 16`)
     - Accept (`ACCEPT = 1`)
     - Decline (`DECLINE = 4`)
     - Revert Decline (`REVERT_DECLINE = 17`)
3. **Editorial / Copyediting Stage** (`stage_id = 4` / `"copyediting"`)
   - Aksi:
     - Send to Production (`SEND_TO_PRODUCTION = 7`)
4. **Production Stage** (`stage_id = 5` / `"production"`)
   - Aksi:
     - Pengelolaan galleys (`submission_galleys`)
     - Penjadwalan publikasi (assignment ke `issues`)
     - Publish / Unpublish / Schedule pada `publications`.

Implementasi keputusan di project:

- Konstanta di:
  - `src/features/editor/types.ts`
  - `src/features/editor/constants/editor-decisions.ts`
- Server actions di:
  - `src/features/editor/actions/editor-decisions.ts`
    - `sendToExternalReview`, `acceptSubmission`, `declineSubmission`, `requestRevisions`, `resubmitForReview`, `sendToProduction`, `revertDecline`, `sendRecommendation`, dll.
- Workflow UI:
  - `workflow-tabs.tsx`, `workflow-stage-view.tsx`, `workflow-stage-actions.tsx`, `workflow-progress-bar.tsx`.

### 4. Permission Garis Besar per Role

Secara konsep mengikuti OJS:

- **Site Administrator**
  - Manage site: hosted journals, site settings, languages, plugins, system info, tools.
  - Tidak terikat pada satu journal/context.
- **Journal Manager**
  - Manage journal-level settings (context/workflow/distribution/website/access).
  - Kelola users & roles untuk jurnal tersebut (via `user_groups` dan `user_user_groups`).
  - Lihat seluruh submissions dalam jurnal.
- **Editor / Section Editor / Guest Editor**
  - Lihat & kelola submissions sesuai assignment dan role.
  - Membuat keputusan editorial (bergantung `recommend_only` / `permit_metadata_edit` di `user_groups`).
  - Mengelola review rounds, assign reviewer, memajukan artikel ke copyediting/production.
- **Copyeditor / Layout Editor / Proofreader**
  - Bekerja di stage copyediting/production pada submission yang di-assign.
  - Mengelola file copyedited, layout, proof.
- **Reviewer**
  - Mengakses assignment review yang aktif untuk submission tertentu.
  - Mengunggah review/attachment dan memberikan rekomendasi.
- **Author**
  - Submit artikel baru, melihat status submission milik sendiri.
- **Reader**
  - Mengakses konten terpublikasi (issues, articles).
- **Subscription Manager**
  - Mengelola subscription & access control terkait.

Di kode, pola izin:

- Site-level:
  - `requireSiteAdmin()` → butuh `user_account_roles` dengan `role_path = 'admin'` dan `context_id` null.
- Journal-level:
  - `requireJournalRole(journalId, ["manager", "editor", ...])`
    - Menggunakan `hasUserJournalRole()` untuk cek membership di `user_user_groups` + `user_groups.role_id` yang sesuai.
  - Site admin selalu boleh (`isAdmin` bypass) sebagaimana OJS.

### 5. Prinsip Implementasi di Project Ini

- **Database**:
  - Schema OJS utama di `001_ojs_schema.sql` digunakan sebagai sumber kebenaran (tabel, kolom, relasi).
  - Schema tambahan di `202511170001_ojs_core.sql` dipakai untuk konfigurasi site & helper modern tanpa mengubah makna domain OJS.
- **Backend/API**:
  - Semua aksi bisnis (keputusan editor, assignment reviewer, queries, file operations, publikasi) harus membaca/menulis tabel OJS yang sesuai.
  - Izin harus selalu melewati `permissions.ts` agar konsisten dengan role OJS.
- **Frontend/Workflow**:
  - Struktur halaman, tabs, dan alur sama dengan OJS 3.3.
  - Hanya tema (warna, font, logo iamJOS) yang dimodifikasi.


