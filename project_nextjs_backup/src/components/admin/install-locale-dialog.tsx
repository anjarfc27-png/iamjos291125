"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { LOCALE_MAP, type LocaleInfo } from "@/lib/locales";

// Daftar bahasa populer di dunia
const POPULAR_LOCALES: LocaleInfo[] = [
  LOCALE_MAP.en,
  LOCALE_MAP.zh,
  LOCALE_MAP.es,
  LOCALE_MAP.hi,
  LOCALE_MAP.ar,
  LOCALE_MAP.pt,
  LOCALE_MAP.ru,
  LOCALE_MAP.ja,
  LOCALE_MAP.de,
  LOCALE_MAP.fr,
  LOCALE_MAP.ko,
  LOCALE_MAP.it,
  LOCALE_MAP.tr,
  LOCALE_MAP.vi,
  LOCALE_MAP.pl,
  LOCALE_MAP.nl,
  LOCALE_MAP.th,
  LOCALE_MAP.id,
  LOCALE_MAP.he,
  LOCALE_MAP.sv,
  LOCALE_MAP.cs,
  LOCALE_MAP.ro,
  LOCALE_MAP.hu,
  LOCALE_MAP.fi,
  LOCALE_MAP.da,
  LOCALE_MAP.no,
  LOCALE_MAP.el,
  LOCALE_MAP.uk,
  LOCALE_MAP.ms,
  LOCALE_MAP.bg,
  LOCALE_MAP.hr,
  LOCALE_MAP.sk,
  LOCALE_MAP.sl,
  LOCALE_MAP.sr,
  LOCALE_MAP.lt,
  LOCALE_MAP.lv,
  LOCALE_MAP.et,
  LOCALE_MAP.is,
  LOCALE_MAP.ga,
  LOCALE_MAP.mt,
  LOCALE_MAP.ca,
  LOCALE_MAP.eu,
  LOCALE_MAP.gl,
  LOCALE_MAP.fa,
  LOCALE_MAP.ur,
  LOCALE_MAP.bn,
  LOCALE_MAP.ta,
  LOCALE_MAP.te,
  LOCALE_MAP.ml,
  LOCALE_MAP.kn,
  LOCALE_MAP.gu,
  LOCALE_MAP.pa,
  LOCALE_MAP.mr,
  LOCALE_MAP.ne,
  LOCALE_MAP.si,
  LOCALE_MAP.my,
  LOCALE_MAP.km,
  LOCALE_MAP.lo,
  LOCALE_MAP.ka,
  LOCALE_MAP.am,
  LOCALE_MAP.sw,
  LOCALE_MAP.zu,
  LOCALE_MAP.af,
  LOCALE_MAP.sq,
  LOCALE_MAP.mk,
  LOCALE_MAP.be,
  LOCALE_MAP.az,
  LOCALE_MAP.kk,
  LOCALE_MAP.ky,
  LOCALE_MAP.uz,
  LOCALE_MAP.mn,
  LOCALE_MAP.hy,
].filter(Boolean);

type Props = {
  installedLocales: string[];
  onInstall: (localeCode: string) => Promise<{ ok: boolean; message?: string }>;
};

export function InstallLocaleDialog({ installedLocales, onInstall }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const installedSet = new Set(installedLocales);
  const availableLocales = POPULAR_LOCALES.filter((locale) => !installedSet.has(locale.code));
  const filteredLocales = availableLocales.filter(
    (locale) =>
      locale.label.toLowerCase().includes(search.toLowerCase()) ||
      locale.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      locale.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInstall = (localeCode: string) => {
    startTransition(async () => {
      setFeedback(null);
      const result = await onInstall(localeCode);
      if (result.ok) {
        setFeedback({ tone: "success", message: "Bahasa berhasil diinstall." });
        setTimeout(() => {
          setIsOpen(false);
          setSearch("");
          setFeedback(null);
          router.refresh();
        }, 1000);
      } else {
        setFeedback({ tone: "error", message: result.message ?? "Gagal menginstall bahasa." });
      }
    });
  };

  return (
    <>
      <Button variant="secondary" type="button" onClick={() => setIsOpen(true)}>
        Install Locale
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsOpen(false)}>
          <div
            className="w-full max-w-2xl rounded-lg border border-[var(--border)] bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Install Locale</h3>
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsOpen(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Cari bahasa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
                />

                {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}

                <div className="max-h-96 overflow-y-auto rounded-md border border-[var(--border)] bg-white">
                  {filteredLocales.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                      {search ? "Tidak ada bahasa yang ditemukan." : "Semua bahasa populer sudah terinstall."}
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {filteredLocales.map((locale) => (
                        <button
                          key={locale.code}
                          type="button"
                          onClick={() => handleInstall(locale.code)}
                          disabled={isPending}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--surface-muted)] disabled:opacity-50"
                        >
                          <div className="font-semibold text-[var(--foreground)]">{locale.label}</div>
                          <div className="text-xs text-[var(--muted)]">{locale.nativeName}</div>
                          <div className="mt-1 text-xs text-[var(--muted)]">Code: {locale.code}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary" type="button" onClick={() => setIsOpen(false)} disabled={isPending}>
                    Tutup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

