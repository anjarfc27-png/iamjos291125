// Mapping locale code ke label dan native name
export type LocaleInfo = {
  code: string;
  label: string;
  nativeName: string;
};

export const LOCALE_MAP: Record<string, LocaleInfo> = {
  en: { code: "en", label: "English", nativeName: "English" },
  zh: { code: "zh", label: "Chinese (Simplified)", nativeName: "中文 (简体)" },
  es: { code: "es", label: "Spanish", nativeName: "Español" },
  hi: { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
  ar: { code: "ar", label: "Arabic", nativeName: "العربية" },
  pt: { code: "pt", label: "Portuguese", nativeName: "Português" },
  ru: { code: "ru", label: "Russian", nativeName: "Русский" },
  ja: { code: "ja", label: "Japanese", nativeName: "日本語" },
  de: { code: "de", label: "German", nativeName: "Deutsch" },
  fr: { code: "fr", label: "French", nativeName: "Français" },
  ko: { code: "ko", label: "Korean", nativeName: "한국어" },
  it: { code: "it", label: "Italian", nativeName: "Italiano" },
  tr: { code: "tr", label: "Turkish", nativeName: "Türkçe" },
  vi: { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt" },
  pl: { code: "pl", label: "Polish", nativeName: "Polski" },
  nl: { code: "nl", label: "Dutch", nativeName: "Nederlands" },
  th: { code: "th", label: "Thai", nativeName: "ไทย" },
  id: { code: "id", label: "Indonesian", nativeName: "Bahasa Indonesia" },
  he: { code: "he", label: "Hebrew", nativeName: "עברית" },
  sv: { code: "sv", label: "Swedish", nativeName: "Svenska" },
  cs: { code: "cs", label: "Czech", nativeName: "Čeština" },
  ro: { code: "ro", label: "Romanian", nativeName: "Română" },
  hu: { code: "hu", label: "Hungarian", nativeName: "Magyar" },
  fi: { code: "fi", label: "Finnish", nativeName: "Suomi" },
  da: { code: "da", label: "Danish", nativeName: "Dansk" },
  no: { code: "no", label: "Norwegian", nativeName: "Norsk" },
  el: { code: "el", label: "Greek", nativeName: "Ελληνικά" },
  uk: { code: "uk", label: "Ukrainian", nativeName: "Українська" },
  ms: { code: "ms", label: "Malay", nativeName: "Bahasa Melayu" },
  bg: { code: "bg", label: "Bulgarian", nativeName: "Български" },
  hr: { code: "hr", label: "Croatian", nativeName: "Hrvatski" },
  sk: { code: "sk", label: "Slovak", nativeName: "Slovenčina" },
  sl: { code: "sl", label: "Slovenian", nativeName: "Slovenščina" },
  sr: { code: "sr", label: "Serbian", nativeName: "Српски" },
  lt: { code: "lt", label: "Lithuanian", nativeName: "Lietuvių" },
  lv: { code: "lv", label: "Latvian", nativeName: "Latviešu" },
  et: { code: "et", label: "Estonian", nativeName: "Eesti" },
  is: { code: "is", label: "Icelandic", nativeName: "Íslenska" },
  ga: { code: "ga", label: "Irish", nativeName: "Gaeilge" },
  mt: { code: "mt", label: "Maltese", nativeName: "Malti" },
  ca: { code: "ca", label: "Catalan", nativeName: "Català" },
  eu: { code: "eu", label: "Basque", nativeName: "Euskara" },
  gl: { code: "gl", label: "Galician", nativeName: "Galego" },
  fa: { code: "fa", label: "Persian", nativeName: "فارسی" },
  ur: { code: "ur", label: "Urdu", nativeName: "اردو" },
  bn: { code: "bn", label: "Bengali", nativeName: "বাংলা" },
  ta: { code: "ta", label: "Tamil", nativeName: "தமிழ்" },
  te: { code: "te", label: "Telugu", nativeName: "తెలుగు" },
  ml: { code: "ml", label: "Malayalam", nativeName: "മലയാളം" },
  kn: { code: "kn", label: "Kannada", nativeName: "ಕನ್ನಡ" },
  gu: { code: "gu", label: "Gujarati", nativeName: "ગુજરાતી" },
  pa: { code: "pa", label: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  mr: { code: "mr", label: "Marathi", nativeName: "मराठी" },
  ne: { code: "ne", label: "Nepali", nativeName: "नेपाली" },
  si: { code: "si", label: "Sinhala", nativeName: "සිංහල" },
  my: { code: "my", label: "Myanmar", nativeName: "မြန်မာ" },
  km: { code: "km", label: "Khmer", nativeName: "ខ្មែរ" },
  lo: { code: "lo", label: "Lao", nativeName: "ລາວ" },
  ka: { code: "ka", label: "Georgian", nativeName: "ქართული" },
  am: { code: "am", label: "Amharic", nativeName: "አማርኛ" },
  sw: { code: "sw", label: "Swahili", nativeName: "Kiswahili" },
  zu: { code: "zu", label: "Zulu", nativeName: "isiZulu" },
  af: { code: "af", label: "Afrikaans", nativeName: "Afrikaans" },
  sq: { code: "sq", label: "Albanian", nativeName: "Shqip" },
  mk: { code: "mk", label: "Macedonian", nativeName: "Македонски" },
  be: { code: "be", label: "Belarusian", nativeName: "Беларуская" },
  az: { code: "az", label: "Azerbaijani", nativeName: "Azərbaycan" },
  kk: { code: "kk", label: "Kazakh", nativeName: "Қазақ" },
  ky: { code: "ky", label: "Kyrgyz", nativeName: "Кыргызча" },
  uz: { code: "uz", label: "Uzbek", nativeName: "Oʻzbek" },
  mn: { code: "mn", label: "Mongolian", nativeName: "Монгол" },
  hy: { code: "hy", label: "Armenian", nativeName: "Հայերեն" },
};

export function getLocaleInfo(code: string): LocaleInfo | null {
  return LOCALE_MAP[code] ?? null;
}

export function getLocaleLabel(code: string): string {
  return LOCALE_MAP[code]?.label ?? code.toUpperCase();
}

export function getLocaleNativeName(code: string): string {
  return LOCALE_MAP[code]?.nativeName ?? code.toUpperCase();
}





