# Rencana Lengkap: OJS PKP 3.3 - 100% Parity dengan Next.js

**Tanggal**: 29 November 2025  
**Status**: Planning Phase  
**Target**: Production-Ready Clone

---

## 🎯 Tujuan Utama

Membuat clone 100% identik dari OJS PKP 3.3 menggunakan Next.js 16.0.1 full-stack yang mencakup:
- ✅ **UI/UX**: Identik pixel-perfect dengan OJS 3.3
- ✅ **Workflow**: Semua alur kerja sama persis
- ✅ **Logic**: Business logic identik
- ✅ **Fitur**: Semua fitur OJS tersedia
- ✅ **Database**: Schema 100% compatible
- ✅ **Production**: Siap deploy ke production

---

## 📋 Struktur Dokumen Spec

Saya telah membuat spec lengkap di folder `.kiro/specs/ojs-site-admin-100-percent-parity/`:

### 1. Requirements Document
**File**: `requirements.md` & `requirements-part2.md`

**Isi**:
- 15 Requirements utama dengan acceptance criteria lengkap
- Menggunakan format EARS (Easy Approach to Requirements Syntax)
- Setiap requirement memiliki user story dan 5-8 acceptance criteria
- Mencakup semua aspek Site Admin OJS 3.3

**Requirements Utama**:
1. Site Admin Dashboard
2. Hosted Journals Management
3. Site Settings - Setup Tab
4. Site Settings - Appearance Tab
5. Site Settings - Plugins Tab
6. Users Management
7. Statistics & Reports
8. System Information & Tools
9. Journal Settings Wizard
10. Scheduled Tasks Management
11. Email Templates Management
12. Site-wide Announcements
13. Import/Export Tools
14. Site Backup & Restore
15. Site Access & Security

### 2. Design Document
**File**: `design.md` & `design-part2.md`

**Isi**:
- Architecture diagram lengkap
- Technology stack detail
- Component interfaces (TypeScript)
- Data models dan database schema
- UI component library (PKP components)
- Workflow implementation
- Error handling strategy
- Testing strategy (unit, integration, property-based)

**Key Design Decisions**:
- Next.js 16.0.1 App Router dengan Server Actions
- Supabase PostgreSQL dengan schema OJS asli
- PKP theme system dengan Tailwind CSS 4
- Custom PKP components matching OJS exactly
- Settings menggunakan EAV pattern seperti OJS

### 3. Task List
**File**: `tasks.md`

**Isi**:
- 52 tasks utama dibagi dalam 12 phases
- Setiap task memiliki sub-tasks detail
- Referensi ke requirements yang dipenuhi
- Estimasi waktu per phase

**12 Phases**:
1. Database Schema & Core Infrastructure (2 minggu)
2. Admin Dashboard & Navigation (1 minggu)
3. Hosted Journals Management (2 minggu)
4. Site Settings - Setup Tab (1 minggu)
5. Site Settings - Appearance Tab (1 minggu)
6. Site Settings - Plugins Tab (1 minggu)
7. Users Management (2 minggu)
8. Statistics & Reports (1 minggu)
9. System Information & Tools (1 minggu)
10. Additional Features (2 minggu)
11. Testing & Quality Assurance (2 minggu)
12. Production Readiness (1 minggu)

**Total**: 16 minggu (4 bulan)

### 4. Roadmap
**File**: `ROADMAP.md`

**Isi**:
- Timeline lengkap dengan estimasi
- Priority levels (P0-P3)
- Success criteria
- Risk mitigation
- Resource requirements
- Monitoring & reporting plan

---

## 🚀 Cara Memulai

### Step 1: Review Spec Documents
```bash
# Baca semua dokumen spec
cd .kiro/specs/ojs-site-admin-100-percent-parity/

# Review requirements
cat requirements.md
cat requirements-part2.md

# Review design
cat design.md
cat design-part2.md

# Review tasks
cat tasks.md

# Review roadmap
cat ROADMAP.md
```

### Step 2: Approve Spec
Setelah review, konfirmasi bahwa:
- [ ] Requirements sudah lengkap dan akurat
- [ ] Design approach sudah tepat
- [ ] Task list sudah detail dan terstruktur
- [ ] Timeline realistis

### Step 3: Mulai Implementation
Setelah approval, kita mulai dari Phase 1:

```bash
# Phase 1: Database Schema & Core Infrastructure
# Task 1: Complete database schema alignment
# - Add missing OJS tables
# - Verify existing tables
# - Add indexes
# - Create migrations
```

---

## 📊 Status Saat Ini vs Target

### Database Schema
- **Saat Ini**: ~80% (tabel inti ada, beberapa tabel kurang)
- **Target**: 100% (semua tabel OJS 3.3 ada)
- **Gap**: queries, edit_decisions, stage_assignments, dll.

### Site Admin Features
- **Saat Ini**: ~75% (dashboard, journals, basic settings)
- **Target**: 100% (semua fitur OJS 3.3)
- **Gap**: wizard, plugins, advanced settings, tools

### UI/UX Parity
- **Saat Ini**: ~70% (layout mirip, beberapa detail beda)
- **Target**: 100% (pixel-perfect match)
- **Gap**: spacing, colors, fonts, interactions

### Workflow & Logic
- **Saat Ini**: ~75% (core workflow ada)
- **Target**: 100% (semua workflow identik)
- **Gap**: validation, error handling, edge cases

---

## 🎨 UI/UX Requirements

### Warna PKP Theme (Harus Exact Match)
```css
/* Primary Colors */
--pkp-primary: #1E6292;
--pkp-primary-dark: #003B5C;
--pkp-header-bg: #002C40;

/* Secondary Colors */
--pkp-secondary: #006798;
--pkp-accent: #E5E5E5;

/* Background */
--pkp-bg-light: #EAEDEE;
--pkp-bg-white: #FFFFFF;

/* Text */
--pkp-text-dark: #000000;
--pkp-text-light: #666666;

/* Borders */
--pkp-border: #D0D0D0;
```

### Typography (Harus Exact Match)
```css
/* Font Family */
font-family: "Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Font Sizes */
--text-xs: 11px;
--text-sm: 12px;
--text-base: 14px;
--text-lg: 16px;
--text-xl: 18px;
--text-2xl: 24px;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing (Harus Exact Match)
```css
/* Padding */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;

/* Border Radius */
--radius-sm: 3px;
--radius-md: 4px;
--radius-lg: 6px;
```

---

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 16.0.1
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom PKP + Radix UI
- **Forms**: React Hook Form + Zod
- **State**: Zustand + React Query
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20+
- **Database**: Supabase (PostgreSQL 15+)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth + bcryptjs
- **Email**: Nodemailer
- **Jobs**: Vercel Cron

### Development
- **Language**: TypeScript 5
- **Testing**: Jest + React Testing Library
- **E2E**: Playwright
- **Linting**: ESLint 9
- **Formatting**: Prettier

---

## 📝 Next Actions

### Untuk Anda (User)
1. **Review semua dokumen spec** di `.kiro/specs/ojs-site-admin-100-percent-parity/`
2. **Berikan feedback** jika ada yang perlu diubah
3. **Approve spec** jika sudah sesuai
4. **Tentukan prioritas** (apakah ikut urutan atau ada yang lebih urgent)

### Untuk Saya (AI Assistant)
Setelah Anda approve, saya akan:
1. **Mulai Phase 1**: Database schema alignment
2. **Implementasi task by task** sesuai urutan
3. **Testing setiap feature** sebelum lanjut
4. **Verifikasi parity** dengan OJS 3.3 reference

---

## 📞 Questions?

Jika ada pertanyaan tentang:
- **Requirements**: Apakah ada fitur yang kurang?
- **Design**: Apakah approach sudah tepat?
- **Tasks**: Apakah urutan sudah optimal?
- **Timeline**: Apakah estimasi realistis?

Silakan tanyakan sebelum kita mulai implementasi!

---

## ✅ Checklist Approval

Sebelum mulai implementasi, pastikan:
- [ ] Semua requirements sudah dibaca dan dipahami
- [ ] Design approach sudah disetujui
- [ ] Task list sudah direview
- [ ] Timeline sudah disepakati
- [ ] Priority sudah ditentukan
- [ ] Resources sudah siap (database, storage, dll.)

**Setelah checklist ini complete, kita siap mulai coding! 🚀**
