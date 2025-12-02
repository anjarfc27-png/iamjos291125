// Supported locales - Mirip dengan OJS PKP 3.3
// Menambah lebih banyak bahasa untuk kompatibilitas
export const locales = ['en', 'id', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'pt', 'ru', 'it', 'ko', 'tr', 'vi', 'th', 'hi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'id'; // Default to Indonesian

export const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文 (简体)',
  ja: '日本語',
  ar: 'العربية',
  pt: 'Português',
  ru: 'Русский',
  it: 'Italiano',
  ko: '한국어',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  hi: 'हिन्दी',
};

// Locale storage key
export const LOCALE_STORAGE_KEY = 'ojs-locale';

