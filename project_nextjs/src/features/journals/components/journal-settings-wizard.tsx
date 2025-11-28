'use client';

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type JournalData = {
  id: string;
  name: string;
  path: string;
  description?: string;
  settings: any[];
};

type Props = {
  journalId: string;
  initialData: JournalData;
};

const TOP_TABS = [
  { id: 'journal-settings', label: 'Journal Settings' },
  { id: 'plugins', label: 'Plugins' },
  { id: 'users', label: 'Users' },
] as const;

const SIDEBAR_MENU = [
  { id: 'journal', label: 'Journal' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'languages', label: 'Languages' },
  { id: 'search-indexing', label: 'Search Indexing' },
  { id: 'restrict-bulk-emails', label: 'Restrict Bulk Emails' },
] as const;

export function JournalSettingsWizard({ journalId, initialData }: Props) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [activeTopTab, setActiveTopTab] = useState<typeof TOP_TABS[number]['id']>('journal-settings');
  const [activeSidebarItem, setActiveSidebarItem] = useState<typeof SIDEBAR_MENU[number]['id']>('journal');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    initials: '',
    abbreviation: '',
    description: initialData.description || '',
    path: initialData.path || '',
    isPublic: true,
    typography: 'noto-sans',
    theme: 'default',
    headerBgColor: '#1E6292',
    showJournalSummary: false,
    showHeaderBackground: false,
    primaryLanguage: 'en_US',
  });

  const [languageSettings, setLanguageSettings] = useState({
    en_US: { ui: true, forms: true, submissions: true },
    es_ES: { ui: false, forms: false, submissions: false },
    id_ID: { ui: false, forms: false, submissions: false },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: journalError } = await supabase.from('journals').update({
        path: formData.path,
        enabled: formData.isPublic,
        updated_at: new Date().toISOString(),
      }).eq('id', journalId);

      if (journalError) throw journalError;

      const settingsUpdates = [
        { setting_name: 'name', setting_value: formData.name },
        { setting_name: 'initials', setting_value: formData.initials },
        { setting_name: 'abbreviation', setting_value: formData.abbreviation },
        { setting_name: 'description', setting_value: formData.description },
      ];

      for (const setting of settingsUpdates) {
        if (setting.setting_value) {
          await supabase.from('journal_settings').upsert({
            journal_id: journalId,
            setting_name: setting.setting_name,
            setting_value: setting.setting_value,
            locale: '',
          }, { onConflict: 'journal_id,setting_name,locale' });
        }
      }

      alert('Settings saved successfully!');
      router.push('/admin/site-management/hosted-journals');
    } catch (error) {
      console.error('Error saving journal settings:', error);
      alert('Failed to save journal settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMainContent = () => {
    if (activeTopTab === 'plugins') {
      return <div className="p-6"><h2 className="text-lg font-semibold mb-4">Plugins</h2><p className="text-gray-600">Plugin management coming soon...</p></div>;
    }

    if (activeTopTab === 'users') {
      return <div className="p-6"><h2 className="text-lg font-semibold mb-4">Users</h2><p className="text-gray-600">User management coming soon...</p></div>;
    }

    switch (activeSidebarItem) {
      case 'journal':
        return <div className="p-6 space-y-6">
          <div className="space-y-2"><Label htmlFor="journal-title">Journal title <span className="text-[#b91c1c]">*</span></Label><Input id="journal-title" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="journal 1" required style={{ maxWidth: '500px' }} /></div>
          <div className="space-y-2"><Label htmlFor="journal-initials">Journal initials <span className="text-[#b91c1c]">*</span></Label><Input id="journal-initials" value={formData.initials} onChange={(e) => setFormData({ ...formData, initials: e.target.value })} placeholder="jnl1" maxLength={16} required style={{ maxWidth: '200px' }} /></div>
          <div className="space-y-2"><Label htmlFor="journal-abbreviation">Journal Abbreviation</Label><Input id="journal-abbreviation" value={formData.abbreviation} onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })} placeholder="jnl satu" maxLength={32} style={{ maxWidth: '500px' }} /></div>
          <div className="space-y-2"><Label htmlFor="journal-description">Journal description</Label><div style={{ border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff' }}><div style={{ borderBottom: '1px solid #d1d5db', padding: '0.5rem', display: 'flex', gap: '0.5rem' }}><button type="button" style={{ padding: '0.25rem 0.5rem', fontWeight: 'bold' }}>B</button><button type="button" style={{ padding: '0.25rem 0.5rem', fontStyle: 'italic' }}>I</button><button type="button" style={{ padding: '0.25rem 0.5rem' }}>x²</button><button type="button" style={{ padding: '0.25rem 0.5rem' }}>x₂</button><button type="button" style={{ padding: '0.25rem 0.5rem' }}>🔗</button></div><textarea id="journal-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={8} style={{ width: '100%', border: 'none', padding: '0.75rem', outline: 'none', resize: 'vertical' }} placeholder="ini adalah journal 1" /></div></div>
          <div className="space-y-2"><Label htmlFor="journal-path">Path <span className="text-[#b91c1c]">*</span></Label><Input id="journal-path" value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} placeholder="e.g., public-knowledge" required style={{ maxWidth: '500px' }} /><p className="text-sm text-gray-600">A unique path for the journal URL</p></div>
          <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#f8f9fa', maxWidth: '600px' }}><Label style={{ display: 'block', marginBottom: '1rem' }}>Enable</Label><label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} className="h-4 w-4 rounded border border-gray-300" />Enable this journal to appear publicly on the site</label></div>
        </div>;

      case 'appearance':
        return <div className="p-6 space-y-8">
          <div><h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Theme</h3><p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9375rem' }}>New themes may be installed from the Plugins tab at the top of this page.</p><select value={formData.theme} onChange={(e) => setFormData({ ...formData, theme: e.target.value })} style={{ width: '100%', maxWidth: '350px', height: '40px', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0 0.75rem', fontSize: '0.9375rem', background: 'white' }}><option value="default">Default Theme</option><option value="light">Light Theme</option><option value="dark">Dark Theme</option></select></div>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '1.5rem', background: '#fff' }}><h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Typography</h3><p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>Choose a font combination that suits this journal.</p><div className="space-y-3">{['noto-sans', 'noto-serif', 'noto-serif-sans', 'noto-sans-serif', 'lato', 'lora', 'lora-open-sans'].map(t => <label key={t} className="flex items-start gap-3 cursor-pointer"><input type="radio" name="typography" value={t} checked={formData.typography === t} onChange={(e) => setFormData({ ...formData, typography: e.target.value })} className="mt-1" style={{ width: '1.125rem', height: '1.125rem' }} /><div><strong>{t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('/')}:</strong></div></label>)}</div></div>
          <div><h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Colour</h3><p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9375rem' }}>Choose a colour for the header.</p><div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '1rem', background: 'white', maxWidth: '320px' }}><div style={{ width: '100%', height: '180px', background: `linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,1) 100%), linear-gradient(to right, rgba(128,128,128,1) 0%, ${formData.headerBgColor} 100%)`, borderRadius: '4px', marginBottom: '1rem' }} /><div style={{ width: '100%', height: '12px', background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)', borderRadius: '4px', marginBottom: '1rem' }} /><div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>{['#1E6292', '#006798', '#0d7ea2', '#00425a', '#003d5c', '#004d75', '#1a1a1a', '#333333', '#666666', '#999999'].map(color => <button key={color} type="button" onClick={() => setFormData({ ...formData, headerBgColor: color })} style={{ width: '24px', height: '24px', background: color, border: formData.headerBgColor === color ? '2px solid #000' : '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', padding: 0 }} />)}</div><Input type="text" value={formData.headerBgColor} onChange={(e) => setFormData({ ...formData, headerBgColor: e.target.value })} style={{ width: '100%', textAlign: 'center', fontFamily: 'monospace' }} /><p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>HEX</p></div></div>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '1.5rem', background: '#fff' }}><h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Journal Summary</h3><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={formData.showJournalSummary} onChange={(e) => setFormData({ ...formData, showJournalSummary: e.target.checked })} className="mt-1" style={{ width: '1.125rem', height: '1.125rem' }} /><span style={{ fontSize: '0.9375rem' }}>Show the journal summary on the homepage.</span></label></div>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '1.5rem', background: '#fff' }}><h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Header Background Image</h3><p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9375rem' }}>When a homepage image has been uploaded, display it in the background of the header instead of it's usual position on the homepage.</p><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={formData.showHeaderBackground} onChange={(e) => setFormData({ ...formData, showHeaderBackground: e.target.checked })} className="mt-1" style={{ width: '1.125rem', height: '1.125rem' }} /><span style={{ fontSize: '0.9375rem' }}>Show the homepage image as the header background.</span></label></div>
        </div>;

      case 'languages':
        const languages = [
          { code: 'en_US', label: 'English' },
          { code: 'es_ES', label: 'Español (España)' },
          { code: 'id_ID', label: 'Bahasa Indonesia' },
        ];

        return <div className="p-6">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Languages</h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Locale</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', width: '120px' }}>Primary locale</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', width: '80px' }}>UI</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', width: '80px' }}>Forms</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', width: '120px' }}>Submissions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => (
                <tr key={lang.code} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#006798', fontSize: '1.25rem' }}>▸</span>
                      <span style={{ fontSize: '0.9375rem' }}>{lang.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <input
                      type="radio"
                      name="primaryLanguage"
                      checked={formData.primaryLanguage === lang.code}
                      onChange={() => setFormData({ ...formData, primaryLanguage: lang.code })}
                      style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={languageSettings[lang.code as keyof typeof languageSettings]?.ui || false}
                      onChange={(e) => setLanguageSettings({
                        ...languageSettings,
                        [lang.code]: { ...languageSettings[lang.code as keyof typeof languageSettings], ui: e.target.checked }
                      })}
                      style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={languageSettings[lang.code as keyof typeof languageSettings]?.forms || false}
                      onChange={(e) => setLanguageSettings({
                        ...languageSettings,
                        [lang.code]: { ...languageSettings[lang.code as keyof typeof languageSettings], forms: e.target.checked }
                      })}
                      style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={languageSettings[lang.code as keyof typeof languageSettings]?.submissions || false}
                      onChange={(e) => setLanguageSettings({
                        ...languageSettings,
                        [lang.code]: { ...languageSettings[lang.code as keyof typeof languageSettings], submissions: e.target.checked }
                      })}
                      style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>;
      case 'search-indexing':
        return <div className="p-6"><h2 className="text-lg font-semibold mb-4">Search Indexing</h2><p className="text-gray-600">Search indexing settings coming soon...</p></div>;
      case 'restrict-bulk-emails':
        return <div className="p-6"><h2 className="text-lg font-semibold mb-4">Restrict Bulk Emails</h2><p className="text-gray-600">Bulk email settings coming soon...</p></div>;
      default:
        return null;
    }
  };

  return <div style={{ minHeight: '100vh', background: '#fff' }}><div style={{ background: '#e5e5e5', padding: '1rem 1.5rem', borderBottom: '1px solid #d1d5db' }}><h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Settings Wizard</h1><div style={{ display: 'flex', gap: '2rem', borderBottom: '2px solid #d1d5db' }}>{TOP_TABS.map(tab => <button key={tab.id} onClick={() => setActiveTopTab(tab.id)} style={{ padding: '0.75rem 0', background: 'transparent', border: 'none', borderBottom: activeTopTab === tab.id ? '3px solid #006798' : 'none', color: activeTopTab === tab.id ? '#006798' : '#6b7280', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', marginBottom: '-2px' }}>{tab.label}</button>)}</div></div><div style={{ display: 'flex' }}>{activeTopTab === 'journal-settings' && <div style={{ width: '220px', borderRight: '1px solid #e5e7eb', background: '#f9fafb', minHeight: 'calc(100vh - 140px)' }}><nav style={{ padding: '1rem 0' }}>{SIDEBAR_MENU.map(item => <button key={item.id} onClick={() => setActiveSidebarItem(item.id)} style={{ width: '100%', padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', borderLeft: activeSidebarItem === item.id ? '3px solid #006798' : '3px solid transparent', color: activeSidebarItem === item.id ? '#006798' : '#4b5563', fontWeight: activeSidebarItem === item.id ? '600' : '400', fontSize: '0.9375rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>{item.label}</button>)}</nav></div>}<div style={{ flex: 1 }}><form onSubmit={handleSubmit}>{renderMainContent()}<div style={{ borderTop: '1px solid #e5e7eb', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}><Button type="button" variant="secondary" onClick={() => router.push('/admin/site-management/hosted-journals')}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div></form></div></div></div>;
}
