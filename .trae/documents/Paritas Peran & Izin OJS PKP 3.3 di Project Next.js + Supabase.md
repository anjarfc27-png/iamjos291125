## Ringkasan
- Memastikan seluruh peran OJS 3.3, izin, dan alur UI/UX benar-benar sesuai.
- Mulai dari audit menyeluruh → penyesuaian roles helpers & enforcement → penyempurnaan UI/UX → penambahan halaman peran tambahan → uji fungsi.

## Pemetaan Roles (final)
- Site-wide: `admin` (Site Administrator).
- Journal-scoped: `manager`, `editor`, `section_editor`, `reviewer`, `author`, `reader`.
- Tambahan: `copyeditor`, `layout_editor`, `proofreader`, `subscription-manager`.
- Standarisasi key `role_path`: persis seperti di atas.

## Audit & Lokasi Perubahan
- Helpers/redirect: `src/lib/auth`, `src/lib/auth-redirect` → perkuat `hasRole`, prioritas redirect.
- Gating layout:
  - Admin: `src/app/(admin)/layout.tsx` (harus `admin`).
  - Editor: `src/app/(editor)/editor/layout.tsx` (izin editor/section_editor).
  - Reviewer/Reader/Subscription: gunakan `withAuth` dengan roles yang relevan.
- Server enforcement (cek session + roles):
  - Site Settings & Admin Functions: semua `src/app/(admin)/admin/system/*/actions.ts`, `site-settings/actions.ts` → wajib `admin`.
  - Hosted Journals: `hosted-journals/actions.ts` → `manager` boleh create/update; delete hanya `manager`/`admin`.
  - Workflow: `api/editor/submissions/*` → editor/section_editor.
  - Participants: `api/editor/submissions/[submissionId]/participants/route.ts` → editor/section_editor.
- Data:
  - Pastikan `user_account_roles` menyimpan role_path + `context_id` untuk role jurnal; null untuk site-wide.
  - Seed user groups konsisten (lihat `api/setup-journal`).

## UI/UX Paritas
- Admin top-bar & sidebar: konsisten biru OJS, breadcrumbs di Hosted Journals & semua tab.
- Hosted Journals: aksi Edit/Remove/Settings Wizard/Users lengkap (sudah ada, perkuat feedback & role gating).
- Site Settings:
  - Setup/Languages/Navigation/Plugins/Bulk Emails tersambung aksi server (sudah disambungkan, tambahkan validasi & helper teks mengacu dokumentasi).
- Tambahkan halaman minimal untuk:
  - Copyeditor: daftar tugas copyediting.
  - Layout Editor: tugas layout/galley.
  - Proofreader: tugas proofreading.
  - Subscription Manager: manajemen langganan.

## Validasi & Pengujian
- Unit test: helpers roles, server actions (izin benar/salah), redirection.
- E2E ringan: login tiap peran → akses area sesuai, tidak bocor izin.
- QA manual: Site Settings & Hosted Journals flow sesuai dokumentasi.

## Eksekusi Bertahap
1. Standarisasi roles & helpers + gating UI (Admin/Editor/Reviewer/Reader/Manager).
2. Enforcement peran di server actions & API.
3. Tambah halaman peran tambahan (copyeditor/layout/proofreader/subscription-manager).
4. Penyempurnaan UI/UX (breadcrumbs, aksesibilitas, editor navigation/sidebar).
5. Uji & perbaiki.

## Konfirmasi
- Jika setuju, saya mulai Tahap 1–2 untuk memastikan izin dan akses benar-benar sesuai, kemudian lanjut Tahap 3–4 dan uji menyeluruh.