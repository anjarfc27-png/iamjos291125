# Implementasi Sistem I18n (Internationalization)

**Status**: ✅ **DASAR SUDAH DIIMPLEMENTASIKAN**

---

## ✅ YANG SUDAH DIIMPLEMENTASIKAN

### 1. Sistem I18n Core ✅

**Files yang dibuat**:
- `src/lib/i18n/config.ts` - Konfigurasi locales (en, id)
- `src/lib/i18n/messages/en.ts` - English translations
- `src/lib/i18n/messages/id.ts` - Indonesian translations
- `src/lib/i18n/messages/index.ts` - Messages index dengan helper functions
- `src/contexts/I18nContext.tsx` - I18n Context Provider

**Fitur**:
- ✅ Context API untuk manage locale state
- ✅ LocalStorage untuk persist locale preference
- ✅ Browser language detection
- ✅ Translation function `t(key, params)`
- ✅ Parameter replacement dalam translations

### 2. Language Switcher ✅

**Files yang dibuat**:
- `src/components/admin/language-switcher.tsx` - Language switcher component

**Fitur**:
- ✅ Dropdown untuk pilih bahasa (English / Bahasa Indonesia)
- ✅ Update locale dan reload page
- ✅ Visual indicator untuk active locale

### 3. Integration ✅

**Files yang diupdate**:
- `src/app/providers.tsx` - Added I18nProvider
- `src/app/(admin)/layout.tsx` - Added LanguageSwitcher
- `src/app/(admin)/admin/page.tsx` - Using i18n for all texts
- `src/app/(admin)/admin/site-settings/site-setup/settings/page.tsx` - Using i18n

**Fitur**:
- ✅ Provider di root level (AppProviders)
- ✅ Language switcher di admin layout
- ✅ Admin index page sudah menggunakan i18n
- ✅ Site settings page sudah menggunakan i18n

---

## 📝 TRANSLATIONS YANG SUDAH DIBUAT

### English (en.ts)
- ✅ `common.*` - Common UI elements (save, cancel, delete, etc.)
- ✅ `admin.*` - Site Administration texts
- ✅ `siteSettings.*` - Site Settings texts
- ✅ `hostedJournals.*` - Hosted Journals texts
- ✅ `wizard.*` - Journal Settings Wizard texts
- ✅ `systemInfo.*` - System Information texts
- ✅ `languages.*` - Languages settings texts
- ✅ `messages.*` - Form messages

### Indonesian (id.ts)
- ✅ Semua translations dalam bahasa Indonesia
- ✅ Konsisten dengan OJS PKP 3.3 terminologi

---

## 🔧 CARA PENGGUNAAN

### Di Client Components

```tsx
'use client';

import { useI18n } from '@/contexts/I18nContext';

export function MyComponent() {
  const { t, locale, setLocale } = useI18n();
  
  return (
    <div>
      <h1>{t('admin.siteAdministration')}</h1>
      <button onClick={() => setLocale('id')}>Switch to Indonesian</button>
      <button onClick={() => setLocale('en')}>Switch to English</button>
    </div>
  );
}
```

### Di Server Components

Untuk server components, perlu menggunakan client component wrapper atau pass locale dari parent.

---

## 📋 YANG MASIH PERLU DILAKUKAN

### Prioritas 1 - Update Komponen Utama

1. **Admin Pages** - Update semua teks hardcoded:
   - [ ] Hosted Journals page
   - [ ] Site Settings pages (appearance, theme, setup, etc.)
   - [ ] System Information page
   - [ ] Journal Settings Wizard
   - [ ] System functions pages

2. **Site Settings Forms**:
   - [ ] Settings form (sudah sebagian)
   - [ ] Information form
   - [ ] Appearance forms
   - [ ] Language settings page

### Prioritas 2 - Update Komponen Lain

3. **Other Admin Features**:
   - [ ] Users management
   - [ ] Statistics pages
   - [ ] All admin system functions

4. **Navigation & Layout**:
   - [ ] Admin layout sidebar navigation
   - [ ] Breadcrumbs
   - [ ] Error messages
   - [ ] Success messages

### Prioritas 3 - Complete Coverage

5. **All Other Pages**:
   - [ ] Editor pages
   - [ ] Author pages
   - [ ] Reviewer pages
   - [ ] Public pages

---

## 📝 MENAMBAHKAN TRANSLATIONS BARU

### 1. Tambahkan ke English (en.ts)

```typescript
export const en = {
  // ... existing translations
  myFeature: {
    title: 'My Feature',
    description: 'Description of my feature',
    button: 'Click Me',
  },
};
```

### 2. Tambahkan ke Indonesian (id.ts)

```typescript
export const id = {
  // ... existing translations
  myFeature: {
    title: 'Fitur Saya',
    description: 'Deskripsi fitur saya',
    button: 'Klik Saya',
  },
};
```

### 3. Gunakan di Component

```tsx
const { t } = useI18n();
<h1>{t('myFeature.title')}</h1>
<p>{t('myFeature.description')}</p>
<button>{t('myFeature.button')}</button>
```

### 4. Dengan Parameters

```typescript
// In translations
deleteConfirmMessage: 'Delete journal {name}?',

// In component
t('hostedJournals.deleteConfirmMessage', { name: journal.name })
```

---

## 🎯 GOAL

**Goal**: Semua teks di aplikasi harus menggunakan i18n, sehingga:
- ✅ Jika bahasa English dipilih, SEMUA teks dalam bahasa English
- ✅ Jika bahasa Indonesia dipilih, SEMUA teks dalam bahasa Indonesia
- ✅ Tidak ada campuran bahasa (mixed language)

---

## 📊 STATUS IMPLEMENTASI

### Completed ✅
- [x] I18n system core
- [x] Language switcher component
- [x] English translations (dasar)
- [x] Indonesian translations (dasar)
- [x] Admin index page
- [x] Site settings settings page (partial)

### In Progress ⚠️
- [ ] Update semua admin pages
- [ ] Update semua site settings pages
- [ ] Update wizard pages

### Pending ❌
- [ ] Update editor pages
- [ ] Update author pages
- [ ] Update reviewer pages
- [ ] Update public pages

---

**Next Steps**: Update semua komponen untuk menggunakan `t()` function dari `useI18n()` hook.

