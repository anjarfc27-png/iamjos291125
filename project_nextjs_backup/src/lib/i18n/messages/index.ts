import { en } from './en';
import { id } from './id';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { zh } from './zh';
import { ja } from './ja';
import { ar } from './ar';
import { pt } from './pt';
import { ru } from './ru';
import { it } from './it';
import { ko } from './ko';
import { tr } from './tr';
import { vi } from './vi';
import { th } from './th';
import { hi } from './hi';
import type { Locale } from '../config';

export const messages = {
  en,
  id,
  es,
  fr,
  de,
  zh,
  ja,
  ar,
  pt,
  ru,
  it,
  ko,
  tr,
  vi,
  th,
  hi,
} as const;

export type Messages = typeof en;

// Helper to get nested translation value
export function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return path if not found (for debugging)
    }
  }
  return typeof value === 'string' ? value : path;
}
