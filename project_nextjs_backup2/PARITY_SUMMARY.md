# Ringkasan Paritas iamJOS vs OJS 3.3 (PKP)

## Area yang sudah paralel dengan OJS 3.3
- **Layout & navigasi per role**  
  - Site Admin: top bar “Open Journal Systems”, sidebar administrasi (Hosted Journals, Site Settings, Users, Statistics, System).  
  - Journal Manager: sidebar jurnal (Dashboard, Submissions, Issues, Announcements, Users, Tools, Statistics) dengan header biru gelap PKP.  
  - Editor / Section Editor: dashboard dengan queue tabs (Tasks, My Queue, Unassigned, All Active, Archives) dan workflow actions utama.  
  - Author: dashboard, new submission, daftar submission, published, statistik, profil, help.  
  - Reviewer: dashboard assignments, completed, history, statistics, profil, help.  
  - Reader: browse journals, search, reading list, profil.

- **Workflow editorial & submissions**  
  - Entri submission, assignment ke reviewer, review rounds, keputusan editorial (`send_to_review`, `pending_revisions`, `accept`, `decline`, `new_review_round`, `send_to_production`, `send_to_issue`, dll.).  
  - Logging aktivitas di `submission_activity_logs` untuk keputusan dan perpindahan stage.  
  - Integrasi issue/section di tab Publication → Issue dan penjadwalan publikasi.

- **Issues, settings, dan users/roles**  
  - Daftar issues (`issues` + `issue_settings`) dengan status, tahun, volume, number, published.  
  - Editor/Manager dapat mengaitkan submission ke issue dan menjadwalkan publikasi.  
  - Pengaturan jurnal (context, search/indexing, theme, restrictBulkEmails) via API `api/journals/[journalId]/settings`.  
  - Manajemen user jurnal via `user_groups` / `user_user_groups` dan endpoint `api/journals/[journalId]/users`, selaras dengan role OJS (manager, section editor, reviewer, author, reader, assistant).

- **Theme & komponen PKP**  
  - Header biru gelap (`#002C40`), sidebar biru, background konten abu‑abu muda (`#eaedee`), konten putih: dikonsolidasikan di `src/lib/theme.ts`.  
  - Tabel, tabs, dan tombol memakai komponen PKP (`PkpTable`, `PkpTabs`, `PkpButton`, `PkpSelect`, dst.) dengan styling mendekati OJS 3.3.  
  - Layout header/sidebar per role sudah memakai pola yang sama seperti OJS (Open Journal Systems dropdown, language switcher, notifikasi, user menu).

## Area yang disederhanakan atau berbeda
- **Autentikasi & password**  
  - Password dummy disimpan plaintext (`password123`) di `user_accounts` untuk kemudahan development, bukan skema hashing OJS production.  
  - Supabase Auth dipakai sebagai provider login; backend OJS asli memakai mekanisme sendiri.

- **Plugin & fitur lanjutan**  
  - Sistem plugin, scheduled tasks, beberapa fitur langganan (`subscription-manager`) dan sebagian besar plugin OJS belum direplikasi penuh.  
  - Beberapa halaman sistem admin hanya menyediakan tampilan ringkas/informasi, belum semua aksi maintenance berat.

- **Multi‑journal & peran lanjutan**  
  - Seed menambahkan dua jurnal demo dan peran dasar, namun assignment kombinasi role per jurnal lebih difokuskan ke alur umum (manager/editor/author/reviewer), tidak semua variasi ekstrem.  
  - Self‑registration dan beberapa opsi granular di `user_groups` disederhanakan ke default yang aman.

- **UI detail & i18n**  
  - Teks, icon, dan jarak antar elemen mengikuti OJS 3.3 sebisa mungkin, namun tidak semua string 100% identik; beberapa label disesuaikan agar lebih jelas.  
  - Dukungan multi‑bahasa ada melalui konteks i18n, tetapi konten terjemahan belum selengkap paket bahasa resmi OJS.

## Catatan penggunaan
- Untuk pengujian manual editor/manager/author/reviewer/reader dan multi‑role, gunakan checklist di `MULTI_ROLE_MANUAL_CHECKLIST.md`.  
- Untuk setup & seed Supabase (user dummy + jurnal demo), ikuti panduan di `SUPABASE_SETUP.md` dan jalankan `supabase-seed.sql` di SQL Editor Supabase.



