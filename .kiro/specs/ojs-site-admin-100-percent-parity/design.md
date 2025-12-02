# Design Document: OJS Site Admin 100% Parity

## Overview

Dokumen ini menjelaskan desain teknis untuk mencapai 100% parity dengan OJS PKP 3.3 Site Admin menggunakan Next.js 16.0.1 full-stack architecture. Desain ini memastikan bahwa setiap aspek dari UI, UX, workflow, dan business logic identik dengan OJS asli.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 App Router                    │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React 19)          │  Backend (Server Actions)   │
│  - Admin UI Components        │  - Business Logic           │
│  - PKP Theme System           │  - Database Operations      │
│  - Form Validation (Zod)     │  - File Management          │
│  - State Management (Zustand) │  - Email Service            │
├─────────────────────────────────────────────────────────────┤
│                     API Routes (REST)                        │
│  - /api/admin/*  - /api/journals/*  - /api/users/*         │
├─────────────────────────────────────────────────────────────┤
│                   Supabase PostgreSQL                        │
│  - OJS Schema Tables          │  - Helper Tables            │
│  - Row Level Security (RLS)   │  - Indexes & Constraints    │
├─────────────────────────────────────────────────────────────┤
│                   Supabase Storage                           │
│  - Journal Files  - User Uploads  - Plugin Files            │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: Next.js 16.0.1 with App Router
- **React Version**: 19.2.0 with Server Components
- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth + Custom Session Management
- **File Storage**: Supabase Storage with CDN
- **Styling**: Tailwind CSS 4 with PKP theme variables
- **UI Components**: Custom PKP components + Radix UI primitives
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: Zustand for client state, React Query for server state
- **Email**: Nodemailer with template engine
- **Background Jobs**: Vercel Cron / Custom scheduler

## Components and Interfaces

### 1. Admin Layout Component

```typescript
// src/app/(admin)/layout.tsx
interface AdminLayoutProps {
  children: React.ReactNode;
}

// Features:
// - PKP blue header (#002C40)
// - Site sidebar with navigation
// - Breadcrumb navigation
// - User menu with logout
// - Language switcher
// - Notification bell
```

### 2. Hosted Journals Management

```typescript
// src/features/admin/journals/types.ts
interface Journal {
  id: string;
  path: string;
  enabled: boolean;
  primary_locale: string;
  seq: number;
  settings: JournalSettings;
  created_at: Date;
  updated_at: Date;
}

interface JournalSettings {
  name: LocalizedString;
  description: LocalizedString;
  publisher: string;
  issn_print?: string;
  issn_online?: string;
  // ... other settings
}

// src/features/admin/journals/actions.ts
async function createJournal(data: CreateJournalInput): Promise<Journal>
async function updateJournal(id: string, data: UpdateJournalInput): Promise<Journal>
async function deleteJournal(id: string): Promise<void>
async function toggleJournalEnabled(id: string): Promise<Journal>
```

### 3. Journal Creation Wizard

```typescript
// src/features/admin/journals/wizard/types.ts
interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps>;
  validate: (data: any) => Promise<ValidationResult>;
}

interface JournalWizardData {
  // Step 1: Basic Information
  name: LocalizedString;
  path: string;
  description: LocalizedString;
  publisher: string;
  
  // Step 2: Theme & Appearance
  theme: string;
  primary_color: string;
  header_background: string;
  logo?: File;
  
  // Step 3: Search Indexing
  search_description: LocalizedString;
  keywords: string[];
  enable_oai: boolean;
  
  // Step 4: Initial Users
  manager_email: string;
  manager_name: string;
}
```

### 4. Site Settings Management

```typescript
// src/features/admin/settings/types.ts
interface SiteSettings {
  // Setup - Settings
  site_title: LocalizedString;
  redirect_url?: string;
  min_password_length: number;
  force_login: boolean;
  
  // Setup - Information
  about: LocalizedString;
  contact_name: string;
  contact_email: string;
  mailing_address: string;
  support_email: string;
  
  // Appearance
  theme: string;
  logo_url?: string;
  header_background: string;
  primary_color: string;
  custom_css?: string;
  
  // Plugins
  enabled_plugins: string[];
}

// src/features/admin/settings/actions.ts
async function getSiteSettings(): Promise<SiteSettings>
async function updateSiteSettings(data: Partial<SiteSettings>): Promise<void>
async function uploadSiteLogo(file: File): Promise<string>
```

### 5. User Management

```typescript
// src/features/admin/users/types.ts
interface AdminUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  country?: string;
  affiliation?: string;
  disabled: boolean;
  roles: UserRole[];
  last_login?: Date;
}

interface UserRole {
  journal_id: string;
  journal_name: string;
  user_group_id: string;
  role_name: string;
  role_id: number;
}

// src/features/admin/users/actions.ts
async function getUsers(filters: UserFilters): Promise<PaginatedUsers>
async function createUser(data: CreateUserInput): Promise<AdminUser>
async function updateUser(id: string, data: UpdateUserInput): Promise<AdminUser>
async function assignUserRole(userId: string, journalId: string, userGroupId: string): Promise<void>
async function removeUserRole(userId: string, journalId: string, userGroupId: string): Promise<void>
async function mergeUsers(sourceId: string, targetId: string): Promise<void>
async function disableUser(id: string): Promise<void>
```

### 6. Plugin Management

```typescript
// src/features/admin/plugins/types.ts
interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: LocalizedString;
  category: PluginCategory;
  enabled: boolean;
  settings?: PluginSettings;
  hooks: string[];
}

enum PluginCategory {
  GENERIC = 'generic',
  IMPORT_EXPORT = 'importexport',
  GATEWAY = 'gateway',
  THEME = 'theme',
  BLOCK = 'block',
  PAYMENT = 'payment',
  REPORT = 'report',
  METADATA = 'metadata',
  OAI_FORMAT = 'oaiformat',
  PUB_ID = 'pubid'
}

// src/features/admin/plugins/actions.ts
async function getInstalledPlugins(): Promise<Plugin[]>
async function getPluginGallery(): Promise<GalleryPlugin[]>
async function installPlugin(pluginId: string): Promise<Plugin>
async function enablePlugin(pluginId: string): Promise<void>
async function disablePlugin(pluginId: string): Promise<void>
async function configurePlugin(pluginId: string, settings: any): Promise<void>
async function deletePlugin(pluginId: string): Promise<void>
```

## Data Models

### Database Schema Alignment

Semua tabel harus 100% sesuai dengan OJS 3.3 schema:

```sql
-- Core tables yang HARUS identik
users, user_settings, user_groups, user_group_settings, user_user_groups
journals, journal_settings
submissions, publications, publication_settings
review_rounds, review_assignments
issues, issue_settings
sections, section_settings
email_templates, email_template_settings
navigation_menus, navigation_menu_items
plugins, plugin_settings
scheduled_tasks, scheduled_task_logs
```

### Settings Storage Pattern

OJS menggunakan EAV (Entity-Attribute-Value) pattern untuk settings:

```sql
-- Contoh: journal_settings
INSERT INTO journal_settings (journal_id, locale, setting_name, setting_value, setting_type)
VALUES 
  ('uuid', 'en_US', 'name', 'Journal of Example', 'string'),
  ('uuid', '', 'enabled', '1', 'bool'),
  ('uuid', '', 'primaryLocale', 'en_US', 'string');
```

Helper functions untuk settings:

```typescript
// src/lib/settings-helpers.ts
async function getJournalSetting(journalId: string, name: string, locale?: string): Promise<any>
async function setJournalSetting(journalId: string, name: string, value: any, locale?: string): Promise<void>
async function getLocalizedSetting(journalId: string, name: string): Promise<LocalizedString>
async function setLocalizedSetting(journalId: string, name: string, values: LocalizedString): Promise<void>
```

