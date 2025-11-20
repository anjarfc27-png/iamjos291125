## Peran yang Sudah Ada
- Admin (Site Administration)
- Editor/Section editor (Editorial)
- Author
- Reviewer

## Peran yang Belum Ada
- Manager (Journal Manager)
- Copyeditor
- Proofreader
- Layout Editor
- Subscription Manager
- Reader

## Rencana Melengkapi Halaman per Peran
1. Buat skeleton halaman dan layout sesuai OJS klasik untuk setiap peran di atas.
2. Tambah guard `withAuth` dengan `role_path` yang sesuai (manager, copyeditor, proofreader, layout-editor, subscription-manager, reader).
3. Struktur rute:
   - Manager: `/manager/dashboard`, `/manager/journals`, `/manager/users`, `/manager/settings`
   - Copyeditor: `/copyeditor/dashboard`, `/copyeditor/assignments`, `/copyeditor/completed`
   - Proofreader: `/proofreader/dashboard`, `/proofreader/assignments`, `/proofreader/completed`
   - Layout Editor: `/layout-editor/dashboard`, `/layout-editor/assignments`, `/layout-editor/completed`
   - Subscription Manager: `/subscription-manager/dashboard`, `/subscription-manager/subscriptions`
   - Reader: `/reader/dashboard` (opsional, fokus akses konten)
4. Samakan gaya UI (warna, tipografi, panel, breadcrumb, tombol teks) dengan OJS klasik.
5. Verifikasi end-to-end: login peran terkait, akses dashboard, tidak ada 404 atau blank.

Konfirmasi untuk lanjut implementasi skeleton halaman dan guard per peran di atas.