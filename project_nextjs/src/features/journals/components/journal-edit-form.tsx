"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createJournalAction, updateJournalAction, } from "@/app/(admin)/admin/site-management/hosted-journals/actions";
import type { HostedJournal } from "../types";

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

    if (mode === "create") {
      const mainLocale = primaryLocales[0] || 'en_US';
      title = localeData[mainLocale]?.title?.trim() || '';
      description = localeData[mainLocale]?.description?.trim() || null;
    } else {
      title = (formData.get("title") as string | null)?.trim() ?? "";
      description = (formData.get("description") as string | null)?.trim() ?? null;
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
        setError(result.message);
        return;
      }

      setError(null);

      // Redirect to Settings Wizard for newly created journal
      if (mode === "create" && result.journalId) {
        router.push(`/journals/${result.journalId}/settings/wizard`);
      } else {
        router.refresh();
        onSuccess?.();
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {mode === 'create' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
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

      <div className="space-y-2">
        <Label htmlFor="journal-title">{t('journalTitle')} <span className="text-[#b91c1c]">*</span></Label>
        <Input id="journal-title" name="title" value={mode === 'create' ? (localeData[activeLocale]?.title || '') : undefined}
          defaultValue={mode === 'edit' ? (journal?.name ?? '') : undefined}
          onChange={mode === 'create' ? ((e) => updateLocaleData(activeLocale, 'title', e.target.value)) : undefined}
          placeholder={t('titlePlaceholder')} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="journal-initials">{t('journalInitials')} <span className="text-[#b91c1c]">*</span></Label>
        <Input id="journal-initials" name="initials" defaultValue={journal?.initials ?? ""} placeholder={t('initialsPlaceholder')} maxLength={16} required style={{ maxWidth: '200px' }} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="journal-abbreviation">{t('journalAbbreviation')}</Label>
        <Input id="journal-abbreviation" name="abbreviation" defaultValue={journal?.abbreviation ?? ""} placeholder={t('abbreviationPlaceholder')} maxLength={32} />
      </div>

      {mode === 'create' && (
        <div className="space-y-2">
          <Label htmlFor="journal-publisher">Publisher</Label>
          <Input id="journal-publisher" name="publisher" placeholder="Publisher name" maxLength={128} />
        </div>
      )}

      {mode === 'create' && (
        <div className="space-y-2">
          <Label htmlFor="journal-issn-online">ISSN (Online)</Label>
          <Input id="journal-issn-online" name="issnOnline" placeholder="e.g., 1234-5678" maxLength={32} style={{ maxWidth: '200px' }} />
        </div>
      )}

      {mode === 'create' && (
        <div className="space-y-2">
          <Label htmlFor="journal-issn-print">ISSN (Print)</Label>
          <Input id="journal-issn-print" name="issnPrint" placeholder="e.g., 1234-5678" maxLength={32} style={{ maxWidth: '200px' }} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="journal-description">{t('journalDescription')}</Label>
        <div className="border border-[var(--border)] rounded-md bg-white overflow-hidden">
          <div className="flex items-center gap-1 border-b border-[var(--border)] p-1 bg-gray-50">
            <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm font-bold w-8 h-8 flex items-center justify-center">B</button>
            <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm italic w-8 h-8 flex items-center justify-center">I</button>
            <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm w-8 h-8 flex items-center justify-center">x²</button>
            <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm w-8 h-8 flex items-center justify-center">x₂</button>
            <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm w-8 h-8 flex items-center justify-center">🔗</button>
          </div>
          <textarea
            id="journal-description"
            name="description"
            rows={6}
            value={mode === 'create' ? (localeData[activeLocale]?.description || '') : undefined}
            defaultValue={mode === 'edit' ? (journal?.description ?? '') : undefined}
            onChange={mode === 'create' ? ((e) => updateLocaleData(activeLocale, 'description', e.target.value)) : undefined}
            className="w-full p-3 text-sm outline-none border-none resize-y min-h-[150px]"
            placeholder={t('descriptionPlaceholder')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="journal-path">{t('path')} <span className="text-[#b91c1c]">*</span></Label>
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#006798]">
          <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm bg-gray-50 border-r border-gray-300 px-3">
            http://localhost/ojs/
          </span>
          <input
            type="text"
            id="journal-path"
            name="path"
            defaultValue={journal?.path ?? ""}
            className="block flex-1 border-0 bg-transparent py-2 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 outline-none"
            placeholder={t('pathPlaceholder')}
            required
          />
        </div>
        <p className="text-sm text-[var(--muted)]">{t('pathHint')}</p>
      </div>

      {mode === 'create' && (
        <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#f8f9fa' }}>
          <Label style={{ display: 'block', marginBottom: '1rem' }}>{t('languages')} <span className="text-[#b91c1c]">*</span></Label>
          {availableLocales.map(locale => (
            <div key={locale.code} style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedLanguages.includes(locale.code)}
                  onChange={() => toggleLanguage(locale.code)}
                  style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.9375rem' }}>{locale.label}</span>
              </label>
            </div>
          ))}
        </div>
      )}

      {mode === 'create' && (
        <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#f8f9fa' }}>
          <Label style={{ display: 'block', marginBottom: '1rem' }}>{t('primaryLocale')} <span className="text-[#b91c1c]">*</span></Label>
          {availableLocales.map(locale => (
            <div key={locale.code} style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={primaryLocales.includes(locale.code)}
                  onChange={() => togglePrimaryLocale(locale.code)}
                  style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.9375rem' }}>{locale.label}</span>
              </label>
            </div>
          ))}
        </div>
      )}

      <fieldset className="border border-[var(--border)] rounded-md p-4 bg-white">
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

      {error && <FormMessage tone="error">{error}</FormMessage>}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>{t('cancel')}</Button>
        <Button type="submit" loading={isPending}>{mode === "create" ? t('create') : t('save')}</Button>
      </div>
    </form>
  );
}
