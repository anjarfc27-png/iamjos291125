'use client';

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Props = {
  variant?: 'dark' | 'light';
};

export function LanguageSwitcher({ variant = 'dark' }: Props) {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const textColor = variant === 'dark' ? 'text-white' : 'text-gray-700';
  const hoverColor = variant === 'dark' ? 'hover:opacity-80' : 'hover:text-[var(--primary)]';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
      setIsOpen(false);
      // No need to reload - React will re-render with new locale
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 cursor-pointer transition-opacity",
          hoverColor
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className={cn("h-4 w-4", textColor)} />
        <span className={cn("text-base font-medium", textColor)} style={{ fontSize: '1rem' }}>
          {localeNames[locale]}
        </span>
        <ChevronDown className={cn("h-4 w-4", textColor)} />
      </button>
      {isOpen && (
        <div
          className={cn(
            "absolute z-[110] mt-2 min-w-[200px] rounded-md border border-[var(--border)] bg-white shadow-lg right-0"
          )}
          style={{ zIndex: 110 }}
        >
          <div className="border-b border-[var(--border)] last:border-b-0">
            {locales.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleLanguageChange(loc)}
                className={cn(
                  "w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)]",
                  locale === loc ? 'bg-gray-100 font-semibold' : ''
                )}
              >
                <Globe className="h-4 w-4" />
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

