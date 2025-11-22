<!-- aa972ce2-ab27-42d3-93fd-78bfe7e945b8 d27d4cb8-4ff4-4132-b9cf-2720e2d7d67d -->
# Fitur Editor yang Belum Ada/Belum Berfungsi (OJS 3.3)

## ❌ FITUR YANG BELUM ADA (Tidak Ada Implementasinya)

### 1. Dashboard Statistics - Tidak Berfungsi

- **Lokasi**: `src/app/(editor)/editor/dashboard/page.tsx` (baris 92, 122, 152, 182)
- **Masalah**: Semua statistik menampilkan "--" (hardcoded)
- **OJS 3.3**: Dashboard menampilkan data real-time dari database
- **Status**: ❌ BELUM BERFUNGSI - Fungsi `getEditorDashboardStats()` ada tapi tidak dipanggil
- **Perlu**: Panggil `getEditorDashboardStats()` dan integrasikan dengan database

### 2. Review Forms System - Tidak Ada

- **Lokasi**: `src/app/(editor)/editor/settings/workflow/page.tsx` (baris 850-920)
- **Masalah**: 
- UI ada tapi hanya dummy data
- Tidak ada CRUD operations (create, edit, delete)
- Tidak ada review form builder
- Tidak ada integrasi dengan reviewer assignment
- **OJS 3.3**: Review forms management, builder dengan elements, assignment, submission
- **Status**: ❌ BELUM ADA - Hanya UI placeholder
- **Database**: Tabel sudah ada di schema
- **Perlu**: API endpoints, builder component, integrasi assignment, submission untuk reviewer

### 3. Email Notifications - Tidak Ada

- **Lokasi**: Semua editorial decisions
- **Masalah**: Editorial decisions tidak mengirim email otomatis
- **OJS 3.3**: Setiap decision mengirim email ke author, templates dapat diedit
- **Status**: ❌ BELUM ADA
- **Perlu**: Email service, templates system, integrasi di setiap decision

### 4. Issue Management - Tidak Berfungsi

- **Lokasi**: `src/app/(editor)/editor/issues/page.tsx`
- **Masalah**: Hanya dummy data, tidak ada CRUD operations
- **OJS 3.3**: Create/edit/delete issues, assign articles, scheduling
- **Status**: ❌ BELUM BERFUNGSI - Hanya UI dengan dummy data
- **Perlu**: API endpoints, creation/edit form, integrasi dengan publication tab

### 5. Publication Tab - Tidak Lengkap

- **Lokasi**: `src/features/editor/components/publication/publication-tab.tsx`
- **Masalah**: Publish/unpublish perlu verifikasi, issue assignment belum lengkap
- **OJS 3.3**: Create version, publish/unpublish, assign to issue, schedule
- **Status**: ⚠️ PARTIAL - UI ada, functionality perlu verifikasi

### 6. Settings - Banyak Fitur Belum Berfungsi

- **Workflow Settings**:
- ❌ Metadata fields - Hanya dummy, tidak ada CRUD
- ❌ Components - Hanya dummy, tidak ada CRUD
- ❌ Submission checklist - Hanya dummy, tidak ada CRUD
- ❌ Review forms - Hanya dummy (sudah disebutkan di #2)
- ❌ Library files - Hanya dummy, tidak ada upload/download
- ❌ Email templates - Hanya dummy, tidak ada edit
- ⚠️ Review setup - Form ada tapi tidak ada save
- ⚠️ Reviewer guidance - Form ada tapi tidak ada save
- **Access Settings**:
- ❌ Users management - Hanya dummy, tidak ada CRUD
- ❌ Roles management - Hanya dummy, tidak ada CRUD
- ⚠️ Site access - Form ada tapi tidak ada save

### 7. Submission List - Tidak Berfungsi dengan Baik

- **Lokasi**: `src/app/(editor)/editor/page.tsx`
- **Masalah**: Masih fallback ke dummy data
- **Status**: ⚠️ PARTIAL - Ada query database tapi fallback ke dummy

### 8. Editorial Assistant Role - Tidak Ada

- **OJS 3.3**: ROLE_ID_ASSISTANT (0x00001001)
- **Status**: ❌ BELUM ADA

## ⚠️ FITUR YANG ADA TAPI BELUM BERFUNGSI PENUH

1. **Dashboard Statistics** - Fungsi ada tapi tidak dipanggil
2. **Workflow Settings Save** - Form ada tapi tidak tersimpan
3. **Access Settings Save** - Form ada tapi tidak tersimpan
4. **Submission Data** - Masih banyak fallback ke dummy data

## 📋 PRIORITAS PERBAIKAN (Mulai dari Terendah)

### ✅ MULAI DARI PRIORITAS RENDAH (Tidak Perlu Real Data)

**Fase 1: Settings Save Functionality** (Tidak perlu real data, hanya UI/UX)

1. **Workflow Settings - Save Functionality**

- Review Setup form - Tambahkan save handler (simpan ke state/localStorage untuk sementara)
- Reviewer Guidance form - Tambahkan save handler
- Email Setup form - Tambahkan save handler
- Author Guidelines form - Tambahkan save handler

2. **Access Settings - Save Functionality**

- Site Access Options form - Tambahkan save handler
- Registration Options - Tambahkan save handler
- Login Options - Tambahkan save handler
- Security Options - Tambahkan save handler

**Fase 2: Editorial Assistant Role** (Jika diperlukan)

3. **Editorial Assistant Role Implementation**

- Tambahkan role `assistant` ke sistem roles
- Buat halaman dashboard untuk assistant
- Tambahkan routing dan layout

**Fase 3: UI/UX Improvements** (Tidak perlu real data)

4. **Form Validation & Feedback**

- Tambahkan validation untuk semua form settings
- Tambahkan success/error feedback messages
- Improve form UX dengan loading states

### ⏳ TUNGGU KEPUTUSAN TIM (Perlu Real Data)

**PRIORITAS TINGGI** (Setelah tim setuju real data):

- Dashboard Statistics - Fix agar menampilkan data real
- Review Forms System - Implementasi lengkap
- Email Notifications - Setup dan integrasi
- Issue Management - CRUD operations
- Settings CRUD Operations - Metadata, Components, Checklist, dll

**PRIORITAS SEDANG**:

- Publication Tab Completion
- Submission List - Pastikan tidak fallback dummy