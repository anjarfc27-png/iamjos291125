"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createJournalAction, updateJournalAction, } from "@/app/(admin)/admin/site-management/hosted-journals/actions";
import type { HostedJournal } from "../types";
import { validatePath, validateInitials } from "@/features/journals/lib/validation";

type Props = {
  journal?: HostedJournal;
  mode: "create" | "edit";
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function JournalEditForm({ journal, mode, onCancel, onSuccess, }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeLocale, setActiveLocale] = useState('en_US');

  const [pathError, setPathError] = useState<string | null>(null);
  const [initialsError, setInitialsError] = useState<string | null>(null);

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lowerValue = value.toLowerCase();
    const error = validatePath(lowerValue);
    setPathError(error);
  };

  const handleInitialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    const error = validateInitials(value);
    setInitialsError(error);
  };

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [primaryLocales, setPrimaryLocales] = useState<string[]>([]);
  const [localeData, setLocaleData] = useState<Record<string, { title: string; description: string }>>({
    'en_US': { title: '', description: '' },
    'es_ES': { title: '', description: '' },
    'id_ID': { title: '', description: '' },
  });

  const availableLocales = [
    { code: 'en_US', label: 'English' },
    { code: 'es_ES', label: 'Español (España)' },
    { code: 'id_ID', label: 'Bahasa Indonesia' },
  ];

  const translations: Record<string, Record<string, string>> = {
    en_US: { journalTitle: 'Journal title', journalInitials: 'Journal initials', journalAbbreviation: 'Journal Abbreviation', journalDescription: 'Journal description', path: 'Path', pathHint: 'A unique path for the journal URL', languages: 'Languages', primaryLocale: 'Primary locale', enable: 'Enable', enableHint: 'Enable this journal to appear publicly on the site', cancel: 'Cancel', create: 'Create', save: 'Save', titlePlaceholder: 'e.g., Journal of Software Documentation', initialsPlaceholder: 'e.g., JSD', abbreviationPlaceholder: 'e.g., J Softw Doc', descriptionPlaceholder: 'Describe the focus and scope of this journal...', pathPlaceholder: 'e.g., public-knowledge', },
    es_ES: { journalTitle: 'Título de la revista', journalInitials: 'Iniciales de la revista', journalAbbreviation: 'Abreviatura de la revista', journalDescription: 'Descripción de la revista', path: 'Ruta', pathHint: 'Una ruta única para la URL de la revista', languages: 'Idiomas', primaryLocale: 'Idioma principal', enable: 'Habilitar', enableHint: 'Habilitar esta revista para que aparezca públicamente en el sitio', cancel: 'Cancelar', create: 'Crear', save: 'Guardar', titlePlaceholder: 'ej., Revista de Documentación de Software', initialsPlaceholder: 'ej., RDS', abbreviationPlaceholder: 'ej., Rev Doc Soft', descriptionPlaceholder: 'Describa el enfoque y alcance de esta revista...', pathPlaceholder: 'ej., conocimiento-publico', },
    id_ID: { journalTitle: 'Judul jurnal', journalInitials: 'Inisial jurnal', journalAbbreviation: 'Singkatan jurnal', journalDescription: 'Deskripsi jurnal', path: 'Path', pathHint: 'Path unik untuk URL jurnal', languages: 'Bahasa', primaryLocale: 'Bahasa utama', enable: 'Aktifkan', enableHint: 'Aktifkan jurnal ini agar muncul secara publik di situs', cancel: 'Batal', create: 'Buat', save: 'Simpan', titlePlaceholder: 'contoh: Jurnal Dokumentasi Perangkat Lunak', initialsPlaceholder: 'contoh: JDP', abbreviationPlaceholder: 'contoh: J Dok PL', descriptionPlaceholder: 'Jelaskan fokus dan cakupan jurnal ini...', pathPlaceholder: 'contoh: pengetahuan-umum', },
  };

  const t = (key: string) => translations[activeLocale]?.[key] || translations['en_US'][key];

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      const newLangs = selectedLanguages.filter(l => l !== lang);
      setSelectedLanguages(newLangs);
      if (primaryLocales.includes(lang)) {
        setPrimaryLocales(primaryLocales.filter(l => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const togglePrimaryLocale = (lang: string) => {
    if (primaryLocales.includes(lang)) {
      setPrimaryLocales(primaryLocales.filter(l => l !== lang));
    } else {
      setPrimaryLocales([...primaryLocales, lang]);
    }
  };

  const updateLocaleData = (locale: string, field: 'title' | 'description', value: string) => {
    setLocaleData(prev => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [field]: value
      }
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    let title = "";
    let description: string | null = null;

    // Always get title and description from formData first, as the inputs have name attributes
    title = (formData.get("title") as string | null)?.trim() ?? "";
    description = (formData.get("description") as string | null)?.trim() ?? null;

    // Fallback to localeData only if formData is empty (though required attribute on input should prevent this for title)
    if (mode === "create" && !title) {
      const mainLocale = (primaryLocales.length > 0 ? primaryLocales[0] : activeLocale) || 'en_US';
      title = localeData[mainLocale]?.title?.trim() || '';
      if (!title) {
        const anyLocale = Object.keys(localeData).find(k => localeData[k]?.title?.trim());
        if (anyLocale) {
          title = localeData[anyLocale]?.title?.trim() || '';
        }
      }
      if (!description) {
        description = localeData[mainLocale]?.description?.trim() || null;
      }
    }
    const initials = (formData.get("initials") as string | null)?.trim() ?? "";
    const abbreviation = (formData.get("abbreviation") as string | null)?.trim() ?? "";
    const publisher = (formData.get("publisher") as string | null)?.trim() ?? "";
    const issnOnline = (formData.get("issnOnline") as string | null)?.trim() ?? "";
    const issnPrint = (formData.get("issnPrint") as string | null)?.trim() ?? "";
    const path = (formData.get("path") as string | null)?.trim() ?? "";
    const isPublic = formData.get("is_public") === "on";

    startTransition(async () => {
      const result = mode === "create"
        ? await createJournalAction({ title, initials, abbreviation, publisher, issnOnline, issnPrint, path, description, isPublic, })
        : await updateJournalAction({ id: journal?.id ?? "", title, initials, abbreviation, path, description, isPublic, });

      if (!result.success) {
        setError(result.message || "An error occurred");
        return;
      }

      setError(null);

      if (mode === "create" && result.journalId) {
        router.push(`/admin/journals/${result.journalId}/settings/wizard`);
      } else {
        router.refresh();
        onSuccess?.();
      }
    });
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {mode === 'create' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {availableLocales.map(locale => (
              <button key={locale.code} type="button" onClick={() => setActiveLocale(locale.code)}
                style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', borderBottom: activeLocale === locale.code ? '2px solid #006798' : '2px solid transparent', color: activeLocale === locale.code ? '#006798' : '#6b7280', fontWeight: activeLocale === locale.code ? 600 : 400, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px' }}>
                {locale.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="journal-title">{t('journalTitle')} <span className="text-[#b91c1c]">*</span></Label>
          <Input id="journal-title" name="title" defaultValue={journal?.name} placeholder={t('titlePlaceholder')} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="journal-initials">{t('journalInitials')} <span className="text-[#b91c1c]">*</span></Label>
          <Input id="journal-initials" name="initials" defaultValue={journal?.initials} onChange={handleInitialsChange} placeholder={t('initialsPlaceholder')} required maxLength={16} />
          {initialsError && <p className="text-sm text-red-600">{initialsError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="journal-abbreviation">{t('journalAbbreviation')}</Label>
          <Input id="journal-abbreviation" name="abbreviation" defaultValue={journal?.abbreviation} placeholder={t('abbreviationPlaceholder')} maxLength={32} />
        </div>

        <div className="space-y-2 md:col-span-4">
          <Label htmlFor="journal-description">{t('journalDescription')}</Label>
          <textarea id="journal-description" name="description" defaultValue={journal?.description ?? ''} className="w-full p-2 border rounded" rows={4} placeholder={t('descriptionPlaceholder')} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="journal-publisher">Publisher</Label>
          <Input id="journal-publisher" name="publisher" defaultValue={journal?.publisher ?? ''} placeholder="Organization or institution name" maxLength={128} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="journal-issn-online">ISSN (Online)</Label>
          <Input id="journal-issn-online" name="issnOnline" defaultValue={journal?.issnOnline ?? ''} placeholder="e.g., 1234-5678" maxLength={32} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="journal-issn-print">ISSN (Print)</Label>
          <Input id="journal-issn-print" name="issnPrint" defaultValue={journal?.issnPrint ?? ''} placeholder="e.g., 1234-5678" maxLength={32} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="journal-path">{t('path')} <span className="text-[#b91c1c]">*</span></Label>
          <Input id="journal-path" name="path" defaultValue={journal?.path} onChange={handlePathChange} placeholder={t('pathPlaceholder')} required />
          <p className="text-xs text-gray-500">{t('pathHint')}</p>
          {pathError && <p className="text-sm text-red-600">{pathError}</p>}
        </div>

        <div className="md:col-span-2">
          <fieldset className={`border border-[var(--border)] rounded-md p-3 bg-white`}>
            <legend className="px-2 text-sm font-medium text-[var(--foreground)]">{t('enable')}</legend>
            <label className="flex items-center gap-2 text-sm text-[var(--foreground)] cursor-pointer">
              <input
                type="checkbox"
                name="is_public"
                defaultChecked={journal?.isPublic ?? true}
                className="h-4 w-4 rounded border border-[var(--border)] text-[#006798] focus:ring-[#006798]"
              />
              {t('enableHint')}
            </label>
          </fieldset>
        </div>
      </div>

      {error && <FormMessage tone="error">{error}</FormMessage>}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>{t('cancel')}</Button>
        <Button type="submit" loading={isPending}>{mode === "create" ? t('create') : t('save')}</Button>
      </div>
    </form>
  );
}
