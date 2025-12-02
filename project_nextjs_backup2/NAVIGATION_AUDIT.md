# Audit Navigasi Admin & Manager (OJS PKP 3.3 vs Next.js)

Dokumen ini mencatat struktur menu/side-bar bawaan OJS 3.3 dan kondisi implementasi di project ini. Tujuannya memastikan urutan, label, dan cakupan item navigasi **identik** sehingga user lintas role (Site Administrator & Journal Manager) mendapatkan pengalaman yang sama seperti di OJS asli.

## 1. Site Administrator ( `/admin` )

| Urutan | Menu OJS 3.3 | Rute Referensi | Status Implementasi Next.js | Catatan |
| --- | --- | --- | --- | --- |
| 1 | Dashboard | `/admin` | ✅ | Halaman ringkasan & version warning |
| 2 | Hosted Journals | `/admin/contexts` | ✅ (`/admin/site-management/hosted-journals`) | Sudah link ke wizard |
| 3 | Site Settings | `/admin/settings` | ✅ | Submenu sekarang mengikuti struktur Setup / Appearance / Plugins |
| 4 | Users | `/admin/users` | ✅ | Tetap tersedia sebagai halaman khusus |
| 5 | Statistics | `/admin/statistics` | ✅ | Statistik site-level |
| 6 | Administrative Functions | `/admin/system/*` | ✅ | Submenu: System Info, Expire Sessions, Clear Cache, Clear Template Cache, Clear Scheduled Tasks |

### Submenu Site Settings
- **Setup**: Settings, Information, Languages, Navigation, Bulk Emails
- **Appearance**: Theme (redirect) & Setup
- **Plugins**: Installed Plugins, Plugin Gallery

Semua item diatas kini tampil di sidebar dengan urutan yang sama seperti OJS 3.3.

## 2. Journal Manager ( `/manager` )

| Urutan | Menu OJS 3.3 (Editor/Manager UI) | Rute Referensi | Status Implementasi Next.js | Catatan |
| --- | --- | --- | --- | --- |
| 1 | Dashboard | `/dashboard` | ✅ (`/manager`) | Dashboard khusus manager |
| 2 | Submissions | `/submissions` | ✅ (`/manager/submissions`) | Menggunakan komponen manager |
| 3 | Issues | `/issues` | ✅ (`/manager/issues`) | Re-export halaman Editor Issues |
| 4 | Announcements | `/announcements` | ✅ (`/manager/announcements`) | Re-export halaman Editor Announcements |
| 5 | Settings (Context/Website/Workflow/Distribution/Access) | `/settings/*` | ✅ | Semua sub-tab tersedia via `/manager/settings/<tab>` |
| 6 | Users & Roles | `/users` | ✅ (`/manager/users-roles`) | Re-export halaman Editor Users & Roles |
| 7 | Tools | `/tools` | ✅ (`/manager/tools`) | Re-export halaman Editor Tools |
| 8 | Statistics (Editorial/Publications/Users) | `/statistics/*` | ✅ | Sub-halaman di bawah `/manager/statistics/...` |

### Catatan Implementasi Manager
- Item **Settings** dan **Statistics** memakai submenu collapsible seperti OJS.
- Semua halaman Manager baru untuk Issues/Announcements/Tools/Settings*/Statistics* merupakan re-export dari halaman Editor agar perilaku konsisten.
- Sidebar Manager kini menggunakan struktur & teks terjemahan yang sama dengan `editor.navigation.*`, sehingga translator tidak perlu entry baru.

## 3. Ringkasan Gap
- ✅ Struktur navigasi Admin & Manager kini match dengan OJS 3.3 (urutan + terminologi).
- ⚠ Konten di balik beberapa halaman masih dummy (issues, announcements, plugins). Itu akan ditangani di todo lain (page-parity, CRUD).
- ✅ Dokumen ini menjadi referensi ketika menambah role/section baru—pastikan setiap perubahan diperbarui di sini.

