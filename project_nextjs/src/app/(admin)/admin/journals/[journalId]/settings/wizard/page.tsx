'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WizardHeader } from '@/features/admin/components/wizard-header';
import { PkpInput } from '@/components/ui/pkp-input';
import { PkpCheckbox } from '@/components/ui/pkp-checkbox';
import { Button } from '@/components/ui/button';
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb';

export default function JournalWizardPage() {
    const params = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'settings' | 'plugins' | 'users'>('settings');
    const [activeSection, setActiveSection] = useState<'journal' | 'appearance' | 'languages' | 'indexing' | 'emails' | 'installed' | 'gallery'>('journal');
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: 'Journal of Public Knowledge',
        initials: 'JPK',
        abbreviation: 'JPK',
        description: '',
        path: 'publicknowledge',
        isPublic: true,
        theme: 'Default Theme',
        typography: 'Noto Sans',
        headerColor: '#006798',
        showSummary: false,
        showHeaderImage: false,
        searchDescription: '',
        customTags: '',
        disableBulkEmails: [] as string[],
        primaryLocale: 'en_US',
        locales: [
            { code: 'en_US', name: 'English', ui: true, forms: true, submissions: true },
            { code: 'fr_CA', name: 'Français (Canada)', ui: true, forms: true, submissions: true },
            { code: 'ar', name: 'العربية', ui: true, forms: true, submissions: true },
        ]
    });

    const pathPrefix = typeof window !== 'undefined' ? `${window.location.origin}/index.php/` : '.../index.php/';

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-[#eaedee] flex flex-col">
            <WizardHeader journalName={formData.title} />

            <div className="flex-1 px-4 py-6">
                <div className="max-w-7xl mx-auto flex flex-col">

                    {/* Top Tabs */}
                    {/* Top Tabs */}
                    <div className="flex border-b border-gray-200" style={{ marginBottom: '-1px' }}>
                        <button
                            onClick={() => { setActiveTab('settings'); setActiveSection('journal'); }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                backgroundColor: activeTab === 'settings' ? '#ffffff' : 'transparent',
                                color: activeTab === 'settings' ? '#333333' : '#006798',
                                borderTop: activeTab === 'settings' ? '4px solid #006798' : '4px solid transparent',
                                borderLeft: activeTab === 'settings' ? '1px solid #e5e5e5' : '1px solid transparent',
                                borderRight: activeTab === 'settings' ? '1px solid #e5e5e5' : '1px solid transparent',
                                borderBottom: activeTab === 'settings' ? '1px solid #ffffff' : 'none',
                                marginBottom: '-1px',
                                borderTopLeftRadius: '4px',
                                borderTopRightRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Journal Settings
                        </button>
                        <button
                            onClick={() => { setActiveTab('plugins'); setActiveSection('installed'); }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                backgroundColor: activeTab === 'plugins' ? '#ffffff' : 'transparent',
                                color: activeTab === 'plugins' ? '#333333' : '#006798',
                                borderTop: activeTab === 'plugins' ? '4px solid #006798' : '4px solid transparent',
                                borderLeft: activeTab === 'plugins' ? '1px solid #e5e5e5' : '1px solid transparent',
                                borderRight: activeTab === 'plugins' ? '1px solid #e5e5e5' : '1px solid transparent',
                                borderBottom: activeTab === 'plugins' ? '1px solid #ffffff' : 'none',
                                marginBottom: '-1px',
                                borderTopLeftRadius: '4px',
                                borderTopRightRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Plugins
                        </button>
                        <button
                            onClick={() => { setActiveTab('users'); setActiveSection('users' as any); }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                backgroundColor: activeTab === 'users' ? '#ffffff' : 'transparent',
                                color: activeTab === 'users' ? '#333333' : '#006798',
                                borderTop: activeTab === 'users' ? '4px solid #006798' : '4px solid transparent',
                                borderLeft: activeTab === 'users' ? '1px solid #e5e5e5' : '1px solid transparent',
                                borderRight: activeTab === 'users' ? '1px solid #e5e5e5' : '1px solid transparent',
                                borderBottom: activeTab === 'users' ? '1px solid #ffffff' : 'none',
                                marginBottom: '-1px',
                                borderTopLeftRadius: '4px',
                                borderTopRightRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Users
                        </button>
                    </div>

                    <div className="bg-white border border-gray-200 shadow-sm rounded-b-lg rounded-tr-lg min-h-[500px] flex flex-col relative z-10">
                        {activeTab === 'settings' && (
                            <div className="flex flex-1">
                                {/* Sidebar Navigation */}
                                <div className="w-64 border-r border-gray-200 p-4 bg-gray-50/50">
                                    <nav className="flex flex-col gap-1">
                                        {[
                                            { id: 'journal', label: 'Masthead' },
                                            { id: 'appearance', label: 'Contact' },
                                            { id: 'languages', label: 'Sections' },
                                            { id: 'indexing', label: 'Categories' },
                                            { id: 'emails', label: 'Publisher' },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveSection(item.id as any)}
                                                className={`text-left px-3 py-2 text-sm rounded transition-colors ${activeSection === item.id
                                                    ? 'bg-[#e6f3f8] text-[#006798] font-semibold border-l-4 border-[#006798]'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 p-8">
                                    <h2 className="text-2xl font-bold text-[#002C40] mb-6">
                                        {activeSection === 'journal' && 'Masthead'}
                                        {activeSection === 'appearance' && 'Contact'}
                                        {activeSection === 'languages' && 'Sections'}
                                        {activeSection === 'indexing' && 'Categories'}
                                        {activeSection === 'emails' && 'Publisher'}
                                    </h2>

                                    <form onSubmit={handleSave} className="space-y-6 w-full">
                                        {activeSection === 'journal' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Journal Name <span className="text-red-600">*</span>
                                                    </label>
                                                    <PkpInput
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        The name of your journal.
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Journal Initials <span className="text-red-600">*</span>
                                                    </label>
                                                    <PkpInput
                                                        value={formData.initials}
                                                        onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Journal Abbreviation <span className="text-red-600">*</span>
                                                    </label>
                                                    <PkpInput
                                                        value={formData.abbreviation}
                                                        onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Journal Summary
                                                    </label>
                                                    <textarea
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#006798] focus:ring-1 focus:ring-[#006798] h-32"
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    />
                                                </div>

                                                <div className="relative">
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Path <span className="text-red-600">*</span>
                                                    </label>
                                                    <div className="relative flex items-center">
                                                        <div className="absolute left-3 text-gray-500 text-sm select-none pointer-events-none">
                                                            {pathPrefix}
                                                        </div>
                                                        <PkpInput
                                                            value={formData.path}
                                                            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                                            required
                                                            style={{ paddingLeft: `${pathPrefix.length * 7 + 10}px` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 pt-4 mt-4">
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Enable
                                                    </label>
                                                    <div className="border border-[#e5e5e5] rounded p-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <PkpCheckbox
                                                                checked={formData.isPublic}
                                                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                                            />
                                                            <span className="text-sm text-gray-700">
                                                                Enable this journal to appear publicly on the site
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {activeSection === 'appearance' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Theme
                                                    </label>
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        New themes may be installed from the Plugins tab at the top of this page.
                                                    </p>
                                                    <select
                                                        className="w-full max-w-md p-2 border border-[#e5e5e5] rounded text-sm bg-white"
                                                        value={formData.theme}
                                                        onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                                                    >
                                                        <option>Default Theme</option>
                                                    </select>
                                                </div>

                                                <div className="border border-[#e5e5e5] rounded p-4">
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Typography
                                                    </label>
                                                    <p className="text-sm text-gray-700 mb-4">
                                                        Choose a font combination that suits this journal.
                                                    </p>
                                                    <div className="space-y-3">
                                                        {[
                                                            "Noto Sans: A digital-native font designed by Google for extensive language support.",
                                                            "Noto Serif: A serif variant of Google's digital-native font.",
                                                            "Noto Serif/Noto Sans: A complementary pairing with serif headings and sans-serif body text.",
                                                            "Noto Sans/Noto Serif: A complementary pairing with sans-serif headings and serif body text.",
                                                            "Lato: A popular modern sans-serif font.",
                                                            "Lora: A wide-set serif font good for reading online.",
                                                            "Lora/Open Sans: A complimentary pairing with serif headings and sans-serif body text."
                                                        ].map((option, idx) => (
                                                            <label key={idx} className="flex items-start gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="typography"
                                                                    className="mt-1"
                                                                    checked={formData.typography === option.split(':')[0]}
                                                                    onChange={() => setFormData({ ...formData, typography: option.split(':')[0] })}
                                                                />
                                                                <span className="text-sm text-gray-700">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Colour
                                                    </label>
                                                    <p className="text-sm text-gray-700 mb-2">Choose a colour for the header.</p>
                                                    <div className="border border-[#e5e5e5] p-4 rounded inline-block bg-white">
                                                        <div className="w-48 h-24 bg-gradient-to-br from-gray-200 to-gray-400 mb-2 relative rounded overflow-hidden">
                                                            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${formData.headerColor}, transparent)` }}></div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="color"
                                                                value={formData.headerColor}
                                                                onChange={(e) => setFormData({ ...formData, headerColor: e.target.value })}
                                                                className="h-8 w-8 p-0 border-0"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={formData.headerColor}
                                                                onChange={(e) => setFormData({ ...formData, headerColor: e.target.value })}
                                                                className="border border-[#e5e5e5] px-2 py-1 text-sm w-24"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 pt-4">
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Journal Summary
                                                    </label>
                                                    <div className="border border-[#e5e5e5] rounded p-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <PkpCheckbox
                                                                checked={formData.showSummary}
                                                                onChange={(e) => setFormData({ ...formData, showSummary: e.target.checked })}
                                                            />
                                                            <span className="text-sm text-gray-700">Show the journal summary on the homepage.</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 pt-4">
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2">
                                                        Header Background Image
                                                    </label>
                                                    <div className="border border-[#e5e5e5] rounded p-4">
                                                        <p className="text-sm text-gray-700 mb-3">
                                                            When a homepage image has been uploaded, display it in the background of the header instead of it's usual position on the homepage.
                                                        </p>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <PkpCheckbox
                                                                checked={formData.showHeaderImage}
                                                                onChange={(e) => setFormData({ ...formData, showHeaderImage: e.target.checked })}
                                                            />
                                                            <span className="text-sm text-gray-700">Show the homepage image as the header background.</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {activeSection === 'languages' && (
                                            <div className="border border-[#e5e5e5] rounded">
                                                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50">
                                                    <h3 className="font-bold text-[#002C40]">Languages</h3>
                                                </div>
                                                <table className="w-full text-sm text-left">
                                                    <thead>
                                                        <tr className="border-b border-[#e5e5e5] text-gray-500">
                                                            <th className="p-3 font-normal">Locale</th>
                                                            <th className="p-3 font-normal text-center">Primary locale</th>
                                                            <th className="p-3 font-normal text-center">UI</th>
                                                            <th className="p-3 font-normal text-center">Forms</th>
                                                            <th className="p-3 font-normal text-center">Submissions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.locales.map((locale) => (
                                                            <tr key={locale.code} className="border-b border-[#e5e5e5] last:border-0">
                                                                <td className="p-3 flex items-center gap-2">
                                                                    <span className="text-[#006798] cursor-pointer">▶</span> {locale.name}
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    <input
                                                                        type="radio"
                                                                        name="primaryLocale"
                                                                        checked={formData.primaryLocale === locale.code}
                                                                        onChange={() => setFormData({ ...formData, primaryLocale: locale.code })}
                                                                    />
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={locale.ui}
                                                                        disabled={locale.code === 'en_US'}
                                                                        onChange={(e) => {
                                                                            const newLocales = formData.locales.map(l =>
                                                                                l.code === locale.code ? { ...l, ui: e.target.checked } : l
                                                                            );
                                                                            setFormData({ ...formData, locales: newLocales });
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={locale.forms}
                                                                        disabled={locale.code === 'en_US'}
                                                                        onChange={(e) => {
                                                                            const newLocales = formData.locales.map(l =>
                                                                                l.code === locale.code ? { ...l, forms: e.target.checked } : l
                                                                            );
                                                                            setFormData({ ...formData, locales: newLocales });
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={locale.submissions}
                                                                        disabled={locale.code === 'en_US'}
                                                                        onChange={(e) => {
                                                                            const newLocales = formData.locales.map(l =>
                                                                                l.code === locale.code ? { ...l, submissions: e.target.checked } : l
                                                                            );
                                                                            setFormData({ ...formData, locales: newLocales });
                                                                        }}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {activeSection === 'indexing' && (
                                            <>
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-bold text-[#002C40] mb-2">Search Indexing</h3>
                                                    <p className="text-sm text-gray-700 mb-4">
                                                        Help search engines like Google discover and display your site. You are encouraged to submit your <a href="#" className="text-[#006798] underline">sitemap</a>.
                                                    </p>
                                                </div>

                                                <div className="mb-6">
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2 flex items-center gap-1">
                                                        Description
                                                        <span className="text-gray-400 cursor-help" title="Description for search engines">?</span>
                                                    </label>
                                                    <PkpInput
                                                        value={formData.searchDescription}
                                                        onChange={(e) => setFormData({ ...formData, searchDescription: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-[#002C40] mb-2 flex items-center gap-1">
                                                        Custom Tags
                                                        <span className="text-gray-400 cursor-help" title="Custom meta tags">?</span>
                                                    </label>
                                                    <textarea
                                                        className="w-full p-2 border border-[#e5e5e5] rounded text-sm focus:outline-none focus:border-[#006798] transition-colors"
                                                        rows={6}
                                                        value={formData.customTags}
                                                        onChange={(e) => setFormData({ ...formData, customTags: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {activeSection === 'emails' && (
                                            <div className="border border-[#e5e5e5] rounded p-4">
                                                <h3 className="font-bold text-[#002C40] mb-4 border-b border-[#e5e5e5] pb-2">Disable Roles</h3>
                                                <p className="text-sm text-gray-700 mb-4">
                                                    A journal manager will be unable to send bulk emails to any of the roles selected below. Use this setting to limit abuse of the email notification feature. For example, it may be safer to disable bulk emails to readers, authors, or other large user groups that have not consented to receive such emails.
                                                </p>
                                                <p className="text-sm text-gray-700 mb-6">
                                                    The bulk email feature can be disabled completely for this journal in <a href="#" className="text-[#006798] underline">Admin {'>'} Site Settings</a>.
                                                </p>

                                                <div className="space-y-2">
                                                    {[
                                                        "Journal manager", "Journal editor", "Production editor", "Section editor",
                                                        "Guest editor", "Copyeditor", "Designer", "Funding coordinator", "Indexer",
                                                        "Layout Editor", "Marketing and sales coordinator", "Proofreader", "Author",
                                                        "Translator", "Reviewer", "Reader", "Subscription Manager"
                                                    ].map((role) => (
                                                        <label key={role} className="flex items-center gap-2 cursor-pointer">
                                                            <PkpCheckbox
                                                                checked={formData.disableBulkEmails.includes(role)}
                                                                onChange={(e) => {
                                                                    const newRoles = e.target.checked
                                                                        ? [...formData.disableBulkEmails, role]
                                                                        : formData.disableBulkEmails.filter(r => r !== role);
                                                                    setFormData({ ...formData, disableBulkEmails: newRoles });
                                                                }}
                                                            />
                                                            <span className="text-sm text-gray-700">{role}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Save Button */}
                                        <div className="flex justify-end pt-4 border-t border-gray-200">
                                            <Button
                                                type="submit"
                                                disabled={saving}
                                                className="bg-[#006798] hover:bg-[#005a87] text-white font-semibold px-4 py-2 rounded shadow-sm"
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'plugins' && (
                            <div className="w-full">
                                {/* Plugin Sub-tabs */}
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveSection('installed' as any)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 'bold',
                                            backgroundColor: activeSection === 'installed' ? '#ffffff' : 'transparent',
                                            color: activeSection === 'installed' ? '#666666' : '#006798',
                                            borderTop: activeSection === 'installed' ? '4px solid #006798' : '4px solid transparent',
                                            borderLeft: activeSection === 'installed' ? '1px solid #e5e5e5' : 'none',
                                            borderRight: activeSection === 'installed' ? '1px solid #e5e5e5' : 'none',
                                            borderBottom: activeSection === 'installed' ? '1px solid #ffffff' : 'none',
                                            marginRight: '0.25rem',
                                            marginBottom: '-1px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        Installed Plugins
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('gallery' as any)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 'bold',
                                            backgroundColor: activeSection === 'gallery' ? '#ffffff' : 'transparent',
                                            color: activeSection === 'gallery' ? '#666666' : '#006798',
                                            borderTop: activeSection === 'gallery' ? '4px solid #006798' : '4px solid transparent',
                                            borderLeft: activeSection === 'gallery' ? '1px solid #e5e5e5' : 'none',
                                            borderRight: activeSection === 'gallery' ? '1px solid #e5e5e5' : 'none',
                                            borderBottom: activeSection === 'gallery' ? '1px solid #ffffff' : 'none',
                                            marginBottom: '-1px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        Plugin Gallery
                                    </button>
                                </div>

                                {/* Plugin Content */}
                                {activeSection === 'installed' && (
                                    <div className="px-6 py-4 w-full">
                                        {/* Header with Search and Upload */}
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-bold text-[#002C40]">Plugins</h2>
                                            <div className="flex gap-2">
                                                <button className="px-4 py-2 text-sm font-semibold text-[#006798] border border-[#006798] rounded hover:bg-[#006798] hover:text-white transition-colors">
                                                    🔍 Search
                                                </button>
                                                <button className="px-4 py-2 text-sm font-semibold text-white bg-[#006798] border border-[#006798] rounded hover:bg-[#005a87] transition-colors">
                                                    Upload A New Plugin
                                                </button>
                                            </div>
                                        </div>

                                        {/* Plugin Table Headers */}
                                        <div className="grid gap-6 pb-2 border-b border-gray-200 mb-3" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                            <div className="text-sm text-gray-600">Name</div>
                                            <div className="text-sm text-gray-600">Description</div>
                                            <div className="text-sm text-gray-600 text-center">Enabled</div>
                                        </div>

                                        {/* Metadata Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Metadata Plugins (1)
                                            </h3>
                                            <div className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                <div className="flex items-start">
                                                    <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                    <span className="text-sm">Dublin Core 1.1 meta-data</span>
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    Contributes Dublin Core version 1.1 schemas and application adapters.
                                                </div>
                                                <div className="flex justify-center">
                                                    <input type="checkbox" disabled className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Authorization Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Authorization Plugins (0)
                                            </h3>
                                            <div className="px-4 py-6 text-center text-sm italic text-gray-500">
                                                No Items
                                            </div>
                                        </div>

                                        {/* Block Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Block Plugins (6)
                                            </h3>
                                            {[
                                                { name: 'Browse Block', desc: 'This plugin provides sidebar "browse" tools.', enabled: false },
                                                { name: '"Developed By" Block', desc: 'This plugin provides sidebar "Developed By" information.', enabled: false },
                                                { name: 'Information Block', desc: 'This plugin provides sidebar information link.', enabled: true },
                                                { name: 'Language Toggle Block', desc: 'This plugin provides the sidebar language toggler.', enabled: true },
                                                { name: '"Make a Submission" Block', desc: 'This plugin provides a sidebar block with a "Make a Submission" link.', enabled: false },
                                                { name: 'Subscription Block', desc: 'This plugin provides sidebar subscription information.', enabled: true },
                                            ].map((plugin, idx) => (
                                                <div key={idx} className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                    <div className="flex items-start">
                                                        <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                        <span className="text-sm">{plugin.name}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">{plugin.desc}</div>
                                                    <div className="flex justify-center">
                                                        <input type="checkbox" checked={plugin.enabled} onChange={() => { }} className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Gateway Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Gateway Plugins (1)
                                            </h3>
                                            <div className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                <div className="flex items-start">
                                                    <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                    <span className="text-sm">Resolver Plugin</span>
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    This plugin resolves issues and articles based on citation information.
                                                </div>
                                                <div className="flex justify-center">
                                                    <input type="checkbox" checked onChange={() => { }} className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Generic Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Generic Plugins (19)
                                            </h3>
                                            {[
                                                { name: 'Acron Plugin', desc: 'This plugin attempts to reduce the dependence of the application on periodic scheduling tools such as \'cron.\'', enabled: true },
                                                { name: 'Announcement Feed Plugin', desc: 'This plugin produces RSS/Atom web syndication feeds for journal announcements.', enabled: false },
                                                { name: 'Citation Style Language', desc: 'Allow readers to get a published article\'s citation in one of several formats supported by the Citation Style Language.', enabled: false },
                                                { name: 'Custom Block Manager', desc: 'This Plugin lets you manage (add, edit and delete) custom sidebar blocks.', enabled: false },
                                                { name: 'DRIVER', desc: 'The DRIVER plugin extends the OAI-PMH interface according to the DRIVER Guidelines 2.0, helping OJS journals to become DRIVER compliant.', enabled: false },
                                                { name: 'Dublin Core Indexing Plugin', desc: 'This plugin embeds Dublin Core meta tags in article views for indexing purposes.', enabled: true },
                                                { name: 'Google Analytics Plugin', desc: 'Integrate OJS with Google Analytics, Google\'s web site traffic analysis application.', enabled: false },
                                                { name: 'Google Scholar Indexing Plugin', desc: 'This plugin enables indexing of published content in Google Scholar.', enabled: true },
                                                { name: 'HTML Article Galley', desc: 'This plugin provides rendering support for HTML Article Galleys.', enabled: true },
                                                { name: 'eLife Lens Article Viewer', desc: 'This plugin provides rendering support for JATS XML galleys using eLife Lens.', enabled: true },
                                                { name: 'ORCID Profile Plugin', desc: 'Allows for the import of user profile information from ORCID.', enabled: false },
                                                { name: 'PDF.JS PDF Viewer', desc: 'This plugin uses the pdf.js PDF viewer to embed PDFs on the article and issue galley view pages.', enabled: true },
                                                { name: 'Recommend Articles by Author', desc: 'This plugin inserts a list of articles by the same author on the article abstract page.', enabled: false },
                                                { name: 'Recommend Similar Articles', desc: 'This plugin adds a list of similar articles to the article abstract page.', enabled: false },
                                                { name: 'Static Pages Plugin', desc: 'This plugin allows Static Content Management.', enabled: false },
                                                { name: 'TinyMCE Plugin', desc: 'This plugin enables WYSIWYG editing of textareas using the TinyMCE content editor.', enabled: false },
                                                { name: 'Usage event', desc: 'Creates a hook that provides usage event in a defined format.', enabled: false },
                                                { name: 'Usage Statistics', desc: 'Present data objects usage statistics.', enabled: false },
                                                { name: 'Web Feed Plugin', desc: 'This plugin produces RSS/Atom web syndication feeds for the current issue.', enabled: true },
                                            ].map((plugin, idx) => (
                                                <div key={idx} className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                    <div className="flex items-start">
                                                        <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                        <span className="text-sm">{plugin.name}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">{plugin.desc}</div>
                                                    <div className="flex justify-center">
                                                        <input type="checkbox" checked={plugin.enabled} onChange={() => { }} className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Import/Export Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Import/Export Plugins (6)
                                            </h3>
                                            {[
                                                { name: 'CrossRef XML Export Plugin', desc: 'Export article metadata in CrossRef XML format.' },
                                                { name: 'DOAJ Export Plugin', desc: 'Export Journal for DOAJ.' },
                                                { name: 'DataCite Export/Registration Plugin', desc: 'Export or register issue, article, galley and supplementary file metadata in DataCite format.' },
                                                { name: 'Native XML Plugin', desc: 'Import and export articles and issues in OJS\'s native XML format.' },
                                                { name: 'PubMed XML Export Plugin', desc: 'Export article metadata in PubMed XML format for indexing in MEDLINE.' },
                                                { name: 'Users XML Plugin', desc: 'Import and export users' },
                                            ].map((plugin, idx) => (
                                                <div key={idx} className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                    <div className="flex items-start">
                                                        <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                        <span className="text-sm">{plugin.name}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">{plugin.desc}</div>
                                                    <div className="flex justify-center">
                                                        <input type="checkbox" disabled className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* OAI Metadata Format Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                OAI Metadata Format Plugins (4)
                                            </h3>
                                            {[
                                                { name: 'DC Metadata Format', desc: 'Structures metadata in a way that is consistent with the Dublin Core format.' },
                                                { name: 'MARC Metadata Format', desc: 'Structures metadata in a way that is consistent with the MARC format.' },
                                                { name: 'MARC21 Metadata Format', desc: 'Structures metadata in a way that is consistent with the MARC21 format.' },
                                                { name: 'RFC1807 Metadata Format', desc: 'Structures metadata in a way that is consistent with the RFC1807 format.' },
                                            ].map((plugin, idx) => (
                                                <div key={idx} className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                    <div className="flex items-start">
                                                        <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                        <span className="text-sm">{plugin.name}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">{plugin.desc}</div>
                                                    <div className="flex justify-center">
                                                        <input type="checkbox" disabled className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Payment Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Payment Plugins (2)
                                            </h3>
                                            {[
                                                { name: 'Manual Fee Payment', desc: "The manager will manually record receipt of a user's payment (outside of this software).", enabled: false },
                                                { name: 'Paypal Fee Payment', desc: 'Payments will be processed using the PayPal service.', enabled: false },
                                            ].map((plugin, idx) => (
                                                <div key={idx} className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                    <div className="flex items-start">
                                                        <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                        <span className="text-sm">{plugin.name}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">{plugin.desc}</div>
                                                    <div className="flex justify-center">
                                                        <input type="checkbox" checked={plugin.enabled} onChange={() => { }} className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Public Identifier Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Public Identifier Plugins (2)
                                            </h3>
                                            {[
                                                { name: 'DOI', desc: 'This plugin enables the assignment of the Digital Object Identifiers to issues, articles and galleys in OJS.', enabled: false },
                                                { name: 'URN', desc: 'This plugin enables the assignment of the Uniform Resource Names to the issues, articles and galleys in OJS.', enabled: false },
                                            ].map((plugin, idx) => (
                                                <div key={idx} className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                    <div className="flex items-start">
                                                        <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                        <span className="text-sm">{plugin.name}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">{plugin.desc}</div>
                                                    <div className="flex justify-center">
                                                        <input type="checkbox" checked={plugin.enabled} onChange={() => { }} className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Report Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Report Plugins (6)
                                            </h3>
                                            {[
                                                { name: 'Articles Report', desc: 'This plugin implements a CSV report containing a list of articles and their info.', enabled: true },
                                                { name: 'COUNTER Reports', desc: 'The COUNTER plugin allows reporting on journal activity, using the COUNTER standard. These reports alone do not make a journal COUNTER compliant. To offer COUNTER compliance, review the requirements at the Project COUNTER website.', enabled: true, isHtml: true },
                                                { name: 'Review Report', desc: 'This plugin implements a CSV report containing a list of review assignments for a journal.', enabled: true },
                                                { name: 'Subscriptions Report', desc: 'This plugin implements a CSV report containing a list of subscriptions and their info.', enabled: true },
                                                { name: 'View Report', desc: 'This plugin implements a CSV report describing readership for each article.', enabled: true },
                                                { name: 'PKP Usage statistics report', desc: 'PKP Default usage statistics report (COUNTER ready)', enabled: true },
                                            ].map((plugin, idx) => (
                                                <div key={idx} className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                    <div className="flex items-start">
                                                        <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                        <span className="text-sm">{plugin.name}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">
                                                        {plugin.isHtml ? (
                                                            <>
                                                                The COUNTER plugin allows reporting on journal activity, using the <a href="#" className="text-[#006798] underline">COUNTER standard</a>. These reports alone do not make a journal COUNTER compliant. To offer COUNTER compliance, review the requirements at the Project COUNTER website.
                                                            </>
                                                        ) : plugin.desc}
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <input type="checkbox" checked={plugin.enabled} onChange={() => { }} className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Theme Plugins */}
                                        <div className="mb-4">
                                            <h3 className="bg-gray-100 px-4 py-2 font-bold text-[#002C40] text-sm border-t border-b border-gray-200">
                                                Theme Plugins (1)
                                            </h3>
                                            {[
                                                { name: 'Default Theme', desc: 'This theme implements the default theme.', enabled: true },
                                            ].map((plugin, idx) => (
                                                <div key={idx} className="grid gap-6 px-4 py-3 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '20% 70% 10%' }}>
                                                    <div className="flex items-start">
                                                        <span className="text-[#006798] mr-2 cursor-pointer">▶</span>
                                                        <span className="text-sm">{plugin.name}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">{plugin.desc}</div>
                                                    <div className="flex justify-center">
                                                        <input type="checkbox" checked={plugin.enabled} onChange={() => { }} className="w-4 h-4 accent-red-600" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'gallery' && (
                                    <div className="px-6 py-4 w-full">
                                        {/* Header with Search */}
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-bold text-[#002C40]">Plugin Gallery</h2>
                                            <button className="px-4 py-2 text-sm font-semibold text-[#006798] border border-[#006798] rounded hover:bg-[#006798] hover:text-white transition-colors">
                                                🔍 Search
                                            </button>
                                        </div>

                                        {/* Plugin Gallery Table Headers */}
                                        <div className="grid gap-6 pb-2 border-b border-gray-200 mb-3" style={{ gridTemplateColumns: '25% 60% 15%' }}>
                                            <div className="text-sm font-medium text-gray-600">Name</div>
                                            <div className="text-sm font-medium text-gray-600">Description</div>
                                            <div className="text-sm font-medium text-gray-600 text-right">Status</div>
                                        </div>

                                        {/* Gallery Items */}
                                        <div className="divide-y divide-gray-100">
                                            {[
                                                { name: 'RQC Plugin', desc: 'Submit review data to the Review Quality Collector (RQC) service', status: '' },
                                                { name: 'Hypothes.is', desc: 'This plugin integrates the Hypothes.is annotation tool into articles.', status: '' },
                                                { name: 'Shibboleth', desc: 'This plugin adds Shibboleth support.', status: '' },
                                                { name: 'Backup', desc: 'This plugin permits backups to be downloaded from within OJS/OMP/OPS.', status: '' },
                                                { name: 'iThenticate', desc: 'This plugin permits automatic submission of uploaded content to the iThenticate service for plagiarism checking.', status: '' },
                                                { name: 'COinS', desc: 'This plugin embeds OpenURL COinS in OJS articles.', status: '' },
                                                { name: 'QuickSubmit', desc: 'The QuickSubmit plugin permits Journal Managers to quickly enter submissions through the OJS website, bypassing the editorial workflow.', status: '' },
                                                { name: 'Allowed Uploads', desc: 'Allowed Uploads plugin enables to choose the filetypes that are allowed when submitting a manuscript.', status: '' },
                                                { name: 'Authors History', desc: 'This plugin adds a tab in the submission view, where all submissions from each contributor are listed.', status: '' },
                                                { name: 'Plugins update notification', desc: 'This plugin generates a notification whenever an update to a gallery plugin is available', status: '' },
                                                { name: 'Dataverse Plugin', desc: 'This plugin integrates OJS/OPS and Dataverse, allowing for research data sharing.', status: '' },
                                                { name: 'Matomo', desc: 'Permits usage statistics tracking using Matomo (formerly Piwik).', status: '' },
                                                { name: 'Shariff Plugin', desc: 'This plugin integrates the shariff solution for social media buttons in OJS and OMP.', status: '' },
                                                { name: 'Subscription SSO', desc: 'This plugin permits delegation of OJS subscription checks to a third-party web service.', status: '' },
                                                { name: 'Funding', desc: 'Adds submission funding data using the Crossref funders registry.', status: '' },
                                                { name: 'Custom Header Plugin', desc: 'Permits the addition of custom headers to the website.', status: '' },
                                                { name: 'Custom Locale Plugin', desc: 'Permits the customization of interface text.', status: '' },
                                                { name: 'JATS Template Plugin', desc: 'Permits the automatic generation of a simple (incomplete) JATS XML document.', status: '' },
                                                { name: 'SWORD Client Plugin', desc: 'Permits the use of the SWORD protocol to deposit documents from OJS into other systems.', status: '' },
                                                { name: 'OAI JATS Plugin', desc: 'Permits the delivery of JATS XML via the OAI interface.', status: '' },
                                                { name: 'Keyword Cloud Plugin', desc: 'A block plugin to provide a tag cloud of article keywords.', status: '' },
                                                { name: 'Bootstrap3', desc: 'A template Bootstrap3 theme for OJS 3.1.1+.', status: '' },
                                                { name: 'Classic', desc: 'An official theme that plays on colour and font contrasts based on literary classicism.', status: '' },
                                                { name: 'Health Sciences', desc: 'An official theme designed to maximize legibility and content clarity.', status: '' },
                                                { name: 'Manuscript (Default child theme)', desc: 'A clean, simple theme with a boxed layout that mimics a paper document.', status: '' },
                                                { name: 'Material Theme', desc: 'Material Theme', status: '' },
                                                { name: 'Texture plugin', desc: 'Integrates the Substance Texture JATS XML Editor with OJS.', status: '' },
                                                { name: 'Crossref Reference Linking Plugin', desc: 'Automatically add the extracted article references to the DOI registration with Crossref', status: '' },
                                                { name: 'Immersion', desc: 'An official theme focused on full-page visuals, large typefaces, and bold color blocks.', status: '' },
                                                { name: 'ORCID Profile', desc: 'ORCID integration for users and authors', status: 'Can be upgraded' },
                                                { name: 'Default Translation', desc: 'Make OJS fall back on English when elements of the software translation are missing.', status: '' },
                                                { name: 'OpenAIRE Plugin 2.0', desc: 'This plugin adds a new OAI-PMH metadata format to Open Journal Systems that complements the OpenAIRE Guidelines for Literature Repository Managers v4.', status: '' },
                                                { name: 'Lens Viewer for Monographs and Journal Articles', desc: 'An extended version of the Lens Viewer that supports books and articles.', status: '' },
                                                { name: 'Reviewer Credits Plugin', desc: 'This plugin enable the integration with Reviewer Credits (www.reviewercredits.com).', status: '' },
                                                { name: 'Admin Notification Manager', desc: 'This plugin disables email notification for all admin users, so they no longer recieve any email notifications from a journal after its creation. This is useful, for example, if the administrator account(s) are not responsible for editorial actions.', status: '' },
                                                { name: 'Email Issue Table of Contents', desc: 'This plugin embeds the table of contents within the default notification email sent when publishing an issue.', status: '' },
                                                { name: 'EditorialBio plugin', desc: 'This plugin exposes the editorial biographies as pages, as used to be the case with OJS 2.x.', status: '' },
                                                { name: 'Clam Antivirus plugin', desc: 'This plugin scans submission files using Clam Antivirus, blocking files with a known virus signature.', status: '' },
                                                { name: 'Plum Analytics Artifact Widget', desc: 'This plugin integrates Plum Analytics\' Artifact Widget.', status: '' },
                                                { name: 'SUSHI-Lite', desc: 'This plugin adds SUSHI-Lite (draft) support.', status: '' },
                                                { name: 'Better Password', desc: 'This plugin adds user restrictions when selecting passwords.', status: '' },
                                                { name: 'Sitesearch', desc: 'This plugin forces public searches for a context to be re-scoped to the site.', status: '' },
                                                { name: 'Akismet', desc: 'This plugin integrates the Akismet anti-spam service.', status: '' },
                                                { name: 'Form Honeypot', desc: 'This plugin adds a honeypot to user registration.', status: '' },
                                                { name: 'Author Requirements', desc: 'Make certain author fields optional.', status: '' },
                                                { name: 'Control Public Files', desc: 'Limit who can upload public files and what kind of files they can upload.', status: '' },
                                                { name: 'Text Editor Extras', desc: 'Add controls to the rich text editor to upload images, manipulate the HTML code, and add tables.', status: '' },
                                                { name: 'Twitter Block Plugin', desc: 'This plugin adds a block to display a Twitter feed in the sidebar.', status: '' },
                                                { name: 'Announcements Block', desc: 'This plugin adds a block to display announcements in the sidebar.', status: '' },
                                                { name: 'Public Identifier Resolver', desc: 'Allows resolving the URL of an issue, article and galley from your public identifier registered in OJS.', status: '' },
                                                { name: 'Open Graph Plugin', desc: 'Open Graph Plugin presents published content using the Open Graph protocol.', status: '' },
                                                { name: 'Web of Science Reviewer Recognition', desc: 'This plugin enables integration with Web of Science Reviewer Recognition Service. To install and use this plugin you must first purchase the Web of Science Reviewer Recognition Service subscription.', status: '' },
                                                { name: 'Web of Science Reviewer Locator', desc: 'This plugin enables integration with Web of Science Reviewer Locator. To install and use this plugin you must first purchase the Web of Science Reviewer Locator subscription.', status: '' },
                                                { name: 'Pragma', desc: 'An official theme for OJS 3.', status: '' },
                                                { name: 'PKP | PN (PKP Preservation Network) Plugin', desc: 'Supports preservation of published journal content in the PKP Preservation Network.', status: '' },
                                                { name: 'Scopus/Crossref Citations Plugin', desc: 'Shows the total number of citations and a "cited by" article list from Scopus and/or Crossref.', status: '' },
                                                { name: 'Portico Plugin', desc: 'Supports export of published content to Portico.', status: '' },
                                                { name: 'Research Organization Registry (ROR) Plugin', desc: 'OJS 3 Plugin for adding Organization names for author affiliations provided by ROR.org', status: '' },
                                                { name: 'DOI to mEDRA xml export and registration plugin', desc: 'Allows DOI export in ONIX4DOI format and the registration with mEDRA.', status: '' },
                                                { name: 'ARK', desc: 'Allows assign ARK ID to issue, article and galley.', status: '' },
                                                { name: 'OpenID Authentication Plugin', desc: 'This plugin allows users to register and login with an OpenID Connect provider such as Keycloak, Google, Orchid, Microsoft and Apple', status: '' },
                                                { name: 'Browse By Section Plugin', desc: 'A plugin which allows visitors to browse published articles by section.', status: '' },
                                                { name: 'SciELO Submissions Report', desc: 'This plugin generates a CSV spreadsheet with submissions information that is usually requested by SciELO', status: '' },
                                                { name: 'Bibi Epub Viewer', desc: 'A plugin for viewing embedded EPUBs in Open Journal Systems and Open Monograph Press using Bibi Epub Reader.', status: '' },
                                                { name: 'Inline Html Galley', desc: 'This plugin provides inline display of article galleys.', status: '' },
                                                { name: 'Plaudit', desc: 'This plugin adds the Plaudit widget to the submission details on the submission\'s landing page.', status: '' },
                                                { name: 'Toggle Required Metadata', desc: 'This plugin makes the "affiliation" and "ORCID" fields required.', status: '' },
                                                { name: 'DOI in Summary', desc: 'Shows the DOI of the articles in the summary of issues and in the home page', status: '' },
                                                { name: 'Gopher Theme', desc: 'A modern, simple theme with a focus on accessibility.', status: '' },
                                                { name: 'Academic Free Theme', desc: 'Academic Free Theme by openjournaltheme.com', status: '' },
                                                { name: 'Conference publishing', desc: 'Enables conference support for OJS', status: '' },
                                                { name: 'DEIA Survey', desc: 'This plugin allows the collection of DEIA (Diversity, Equity, Inclusion and Accessibility) data through a questionnaire.', status: '' },
                                                { name: 'Journal Editor Restriction Plugin', desc: 'Restricts some access for Journal Editors', status: '' },
                                                { name: 'DOI For Translation', desc: 'Allows the creation of submissions which are translations of others', status: '' },
                                                { name: 'OA Switchboard Plugin', desc: 'Allows sending messages to OA Switchboard, automatically, at the publication of an article.', status: '' },
                                                { name: 'Delete Incomplete Submissions', desc: 'This plugin allows editors to delete incomplete submissions from the journal.', status: '' },
                                                { name: 'Cariniana Preservation', desc: 'This plugin allows preserving Brazilian journals published in OJS in the Cariniana network.', status: '' },
                                                { name: 'Publication Facts Label', desc: 'The Publication Facts Label (PFL), developed by the Public Knowledge Project at Simon Fraser University, seeks to help readers learn more about an article\'s and journal\'s adherence to the scholarly standards that set research apart from other sources of knowledge.', status: '' },
                                            ].map((plugin, idx) => (
                                                <div key={idx} className="grid gap-6 py-3 hover:bg-gray-50 items-start" style={{ gridTemplateColumns: '25% 60% 15%' }}>
                                                    <div className="text-sm">
                                                        <a href="#" className="text-[#006798] hover:underline">{plugin.name}</a>
                                                    </div>
                                                    <div className="text-sm text-gray-700">{plugin.desc}</div>
                                                    <div className="text-sm text-gray-600 text-right">{plugin.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="flex-1 p-8">
                                <div className="bg-white border border-gray-200 rounded shadow-sm">
                                    {/* Header */}
                                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                        <h2 className="text-lg font-bold text-[#002C40]">Current Users</h2>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 text-sm font-semibold text-[#006798] border border-[#006798] rounded hover:bg-[#006798] hover:text-white transition-colors flex items-center gap-1">
                                                🔍 Search
                                            </button>
                                            <button className="px-3 py-1.5 text-sm font-semibold text-[#006798] border border-[#006798] rounded hover:bg-[#006798] hover:text-white transition-colors">
                                                Add User
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="w-full">
                                        <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <div>Given Name</div>
                                            <div>Family Name</div>
                                            <div>Username</div>
                                            <div>Email</div>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {[
                                                { givenName: 'aksiomayufuna', familyName: 'aksiomayufuna', username: 'aksiomayufuna', email: 'aksiomayufuna@gmail.com' }
                                            ].map((user, idx) => (
                                                <div key={idx} className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 items-center">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <span className="text-[#006798] cursor-pointer">▶</span>
                                                        {user.givenName}
                                                    </div>
                                                    <div className="text-sm text-gray-700">{user.familyName}</div>
                                                    <div className="text-sm text-gray-700">{user.username}</div>
                                                    <div className="text-sm text-gray-700">{user.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-4 border-t border-gray-200 flex justify-end text-sm text-gray-500">
                                        1 - 1 of 1 items
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
