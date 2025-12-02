"use client";

import { useState, useEffect } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { PkpRadio } from "@/components/ui/pkp-radio";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import { DUMMY_NAVIGATION_MENUS, DUMMY_NAVIGATION_MENU_ITEMS, DUMMY_PLUGINS } from "@/features/editor/settings-dummy-data";
import { USE_DUMMY } from "@/lib/dummy";
import { useJournalSettings, useMigrateLocalStorageToDatabase } from "@/features/editor/hooks/useJournalSettings";
import { locales, localeNames } from "@/lib/i18n/config";
import { getLocaleInfo } from "@/lib/locales";
import { useI18n } from "@/contexts/I18nContext";
import { Bold, Italic, Link as LinkIcon, List, Image as ImageIcon, Code, ChevronUp, ChevronDown, ChevronRight, ArrowUpDown, HelpCircle, Quote, Superscript, Subscript, Search } from "lucide-react";

export default function WebsiteSettingsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("appearance");
  const [activeAppearanceSubTab, setActiveAppearanceSubTab] = useState("theme");
  const [activeSetupSubTab, setActiveSetupSubTab] = useState("information");
  const [activePluginsSubTab, setActivePluginsSubTab] = useState("installedPlugins");

  // Database integration
  const websiteSettings = useJournalSettings({
    section: "website",
    autoLoad: true,
  });

  // Migrate localStorage to database
  const migrateWebsite = useMigrateLocalStorageToDatabase(
    "website",
    [
      "settings_website_appearance_theme",
      "settings_website_appearance_setup",
      "settings_website_appearance_advanced",
      "settings_website_setup_information",
      "settings_website_setup_languages",
      "settings_website_setup_announcements",
      "settings_website_setup_lists",
      "settings_website_setup_privacy",
      "settings_website_setup_datetime",
      "settings_website_setup_archiving",
    ]
  );

  useEffect(() => {
    migrateWebsite.migrate();
  }, []);

  // Appearance - Theme state
  const [appearanceTheme, setAppearanceTheme] = useState({
    activeTheme: 'default',
    typography: 'noto_sans',
    headerColor: '#1E6292',
    showJournalSummary: false,
    showHeaderImage: false,
  });
  const [appearanceThemeFeedback, setAppearanceThemeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Appearance - Setup state
  const [appearanceSetup, setAppearanceSetup] = useState({
    pageFooter: '',
    sidebarBlocks: [
      { id: 'web_feed', label: 'Web Feed Plugin', enabled: false },
      { id: 'info_block', label: 'Information Block', enabled: false },
      { id: 'lang_toggle', label: 'Language Toggle Block', enabled: false },
      { id: 'sub_block', label: 'Subscription Block', enabled: false },
    ]
  });
  const [appearanceSetupFeedback, setAppearanceSetupFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Appearance - Advanced state
  const [appearanceAdvanced, setAppearanceAdvanced] = useState({
    additionalContent: ''
  });
  const [appearanceAdvancedFeedback, setAppearanceAdvancedFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Information state
  const [setupInformation, setSetupInformation] = useState({
    forReaders: '',
    forAuthors: '',
    forLibrarians: ''
  });
  const [setupInformationFeedback, setSetupInformationFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Languages state
  const [setupLanguages, setSetupLanguages] = useState<{
    primaryLocale: string;
    languages: Record<string, { ui: boolean; forms: boolean; submissions: boolean }>;
  }>({
    primaryLocale: 'en',
    languages: {
      'en': { ui: true, forms: true, submissions: true },
    }
  });
  const [setupLanguagesFeedback, setSetupLanguagesFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Announcements state
  const [setupAnnouncements, setSetupAnnouncements] = useState({ enableAnnouncements: false });
  const [setupAnnouncementsFeedback, setSetupAnnouncementsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Lists state
  const [setupLists, setSetupLists] = useState({ itemsPerPage: 25 });
  const [setupListsFeedback, setSetupListsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Privacy state
  const [setupPrivacy, setSetupPrivacy] = useState({ privacyStatement: '' });
  const [setupPrivacyFeedback, setSetupPrivacyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Date/Time state
  // Setup - Date/Time state
  const [setupDateTime, setSetupDateTime] = useState({
    dateFormat: 'December 1, 2025',
    dateFormatShort: '2025-12-01',
    timeFormat: '02:53 PM',
    dateTimeFormat: 'December 1, 2025 - 02:53 PM',
    dateTimeFormatShort: '2025-12-01 02:53 PM'
  });
  const [setupDateTimeFeedback, setSetupDateTimeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Archiving state
  const [setupArchiving, setSetupArchiving] = useState({
    enableLockss: false,
    lockssUrl: '',
    enableClockss: false,
    clockssUrl: ''
  });
  const [setupArchivingFeedback, setSetupArchivingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Navigation state
  const [expandedMenuItem, setExpandedMenuItem] = useState<string | null>(null);
  const navigationMenus = [
    { title: "User Navigation Menu", items: "Register, Dashboard, Login, View Profile, aksiomayufuna, Administration, Logout" },
    { title: "Primary Navigation Menu", items: "Current, About the Journal, Archives, Submissions, Announcements, Editorial Team, About, Privacy Statement, Contact" }
  ];
  const navigationMenuItems = [
    "Register", "Login", "aksiomayufuna", "Dashboard", "View Profile", "Administration", "Logout",
    "Current", "Archives", "Announcements", "About", "About the Journal", "Submissions",
    "Editorial Team", "Privacy Statement", "Contact", "Search"
  ];

  // Load saved data from database
  useEffect(() => {
    if (websiteSettings.settings && Object.keys(websiteSettings.settings).length > 0) {
      const settings = websiteSettings.settings as any;

      if (settings.appearance_theme) {
        try {
          const themeData = typeof settings.appearance_theme === 'string' ? JSON.parse(settings.appearance_theme) : settings.appearance_theme;
          setAppearanceTheme(themeData);
        } catch { }
      }
      if (settings.appearance_setup) {
        try {
          const setupData = typeof settings.appearance_setup === 'string' ? JSON.parse(settings.appearance_setup) : settings.appearance_setup;
          setAppearanceSetup(setupData);
        } catch { }
      }
      if (settings.appearance_advanced) {
        try {
          const advancedData = typeof settings.appearance_advanced === 'string' ? JSON.parse(settings.appearance_advanced) : settings.appearance_advanced;
          setAppearanceAdvanced(advancedData);
        } catch { }
      }
      if (settings.setup_information) {
        try {
          const infoData = typeof settings.setup_information === 'string' ? JSON.parse(settings.setup_information) : settings.setup_information;
          setSetupInformation(infoData);
        } catch { }
      }
      if (settings.setup_languages) {
        try {
          const langData = typeof settings.setup_languages === 'string' ? JSON.parse(settings.setup_languages) : settings.setup_languages;
          if (langData.supportedLocales && !langData.languages) {
            const languages: Record<string, { ui: boolean; forms: boolean; submissions: boolean }> = {};
            langData.supportedLocales.forEach((loc: string) => {
              languages[loc] = { ui: true, forms: true, submissions: true };
            });
            setSetupLanguages({ primaryLocale: langData.primaryLocale || 'en', languages });
          } else {
            setSetupLanguages(langData);
          }
        } catch { }
      }
      if (settings.setup_announcements) {
        try {
          const annData = typeof settings.setup_announcements === 'string' ? JSON.parse(settings.setup_announcements) : settings.setup_announcements;
          setSetupAnnouncements(annData);
        } catch { }
      }
      if (settings.setup_lists) {
        try {
          const listsData = typeof settings.setup_lists === 'string' ? JSON.parse(settings.setup_lists) : settings.setup_lists;
          setSetupLists(listsData);
        } catch { }
      }
      if (settings.setup_privacy) {
        try {
          const privacyData = typeof settings.setup_privacy === 'string' ? JSON.parse(settings.setup_privacy) : settings.setup_privacy;
          setSetupPrivacy(privacyData);
        } catch { }
      }
      if (settings.setup_datetime) {
        try {
          const dtData = typeof settings.setup_datetime === 'string' ? JSON.parse(settings.setup_datetime) : settings.setup_datetime;
          setSetupDateTime(dtData);
        } catch { }
      }
      if (settings.setup_archiving) {
        try {
          const archData = typeof settings.setup_archiving === 'string' ? JSON.parse(settings.setup_archiving) : settings.setup_archiving;
          setSetupArchiving(archData);
        } catch { }
      }
    }
  }, [websiteSettings.settings]);

  // Auto-dismiss feedback messages
  useEffect(() => {
    const feedbacks = [
      appearanceThemeFeedback, appearanceSetupFeedback, appearanceAdvancedFeedback,
      setupInformationFeedback, setupLanguagesFeedback, setupAnnouncementsFeedback,
      setupListsFeedback, setupPrivacyFeedback, setupDateTimeFeedback, setupArchivingFeedback
    ];
    const setters = [
      setAppearanceThemeFeedback, setAppearanceSetupFeedback, setAppearanceAdvancedFeedback,
      setSetupInformationFeedback, setSetupLanguagesFeedback, setSetupAnnouncementsFeedback,
      setSetupListsFeedback, setSetupPrivacyFeedback, setSetupDateTimeFeedback, setSetupArchivingFeedback
    ];

    feedbacks.forEach((feedback, index) => {
      if (feedback) {
        const timer = setTimeout(() => setters[index](null), 3000);
        return () => clearTimeout(timer);
      }
    });
  }, [
    appearanceThemeFeedback, appearanceSetupFeedback, appearanceAdvancedFeedback,
    setupInformationFeedback, setupLanguagesFeedback, setupAnnouncementsFeedback,
    setupListsFeedback, setupPrivacyFeedback, setupDateTimeFeedback, setupArchivingFeedback
  ]);

  // Save handlers
  const handleSaveAppearanceTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppearanceThemeFeedback(null);
    const success = await websiteSettings.saveSettings({ appearance_theme: JSON.stringify(appearanceTheme) });
    setAppearanceThemeFeedback(success ? { type: 'success', message: 'Theme settings saved successfully.' } : { type: 'error', message: websiteSettings.error || 'Failed to save theme settings.' });
  };

  const handleSaveAppearanceSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppearanceSetupFeedback(null);
    const success = await websiteSettings.saveSettings({ appearance_setup: JSON.stringify(appearanceSetup) });
    setAppearanceSetupFeedback(success ? { type: 'success', message: 'Appearance setup saved successfully.' } : { type: 'error', message: websiteSettings.error || 'Failed to save appearance setup.' });
  };

  const handleSaveAppearanceAdvanced = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppearanceAdvancedFeedback(null);
    const success = await websiteSettings.saveSettings({ appearance_advanced: JSON.stringify(appearanceAdvanced) });
    setAppearanceAdvancedFeedback(success ? { type: 'success', message: 'Advanced appearance settings saved successfully.' } : { type: 'error', message: websiteSettings.error || 'Failed to save advanced appearance settings.' });
  };

  const handleSaveSetupInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupInformationFeedback(null);
    const success = await websiteSettings.saveSettings({ setup_information: JSON.stringify(setupInformation) });
    setSetupInformationFeedback(success ? { type: 'success', message: 'Information settings saved successfully.' } : { type: 'error', message: websiteSettings.error || 'Failed to save information settings.' });
  };

  const handleSaveSetupLanguages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupLanguages.primaryLocale) {
      setSetupLanguagesFeedback({ type: 'error', message: t('editor.settings.website.primaryLocale') + ' is required.' });
      return;
    }
    if (!setupLanguages.languages[setupLanguages.primaryLocale]?.ui) {
      setSetupLanguagesFeedback({ type: 'error', message: t('editor.settings.website.primaryLocale') + ' must have UI enabled.' });
      return;
    }
    setSetupLanguagesFeedback(null);
    const success = await websiteSettings.saveSettings({ setup_languages: JSON.stringify(setupLanguages) });
    setSetupLanguagesFeedback(success ? { type: 'success', message: t('editor.settings.saved') } : { type: 'error', message: websiteSettings.error || 'Failed to save language settings.' });
  };

  const handleSaveSetupAnnouncements = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupAnnouncementsFeedback(null);
    const success = await websiteSettings.saveSettings({ setup_announcements: JSON.stringify(setupAnnouncements) });
    setSetupAnnouncementsFeedback(success ? { type: 'success', message: 'Announcements settings saved successfully.' } : { type: 'error', message: websiteSettings.error || 'Failed to save announcements settings.' });
  };

  const handleSaveSetupLists = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupLists.itemsPerPage < 1) {
      setSetupListsFeedback({ type: 'error', message: 'Items per page must be at least 1.' });
      return;
    }
    setSetupListsFeedback(null);
    const success = await websiteSettings.saveSettings({ setup_lists: JSON.stringify(setupLists) });
    setSetupListsFeedback(success ? { type: 'success', message: 'Lists settings saved successfully.' } : { type: 'error', message: websiteSettings.error || 'Failed to save lists settings.' });
  };

  const handleSaveSetupPrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupPrivacyFeedback(null);
    const success = await websiteSettings.saveSettings({ setup_privacy: JSON.stringify(setupPrivacy) });
    setSetupPrivacyFeedback(success ? { type: 'success', message: 'Privacy statement saved successfully.' } : { type: 'error', message: websiteSettings.error || 'Failed to save privacy statement.' });
  };

  const handleSaveSetupDateTime = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupDateTimeFeedback(null);
    const success = await websiteSettings.saveSettings({ setup_datetime: JSON.stringify(setupDateTime) });
    setSetupDateTimeFeedback(success ? { type: 'success', message: 'Date/Time settings saved successfully.' } : { type: 'error', message: websiteSettings.error || 'Failed to save date/time settings.' });
  };

  const handleSaveSetupArchiving = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupArchiving.enableLockss && !setupArchiving.lockssUrl.trim()) {
      setSetupArchivingFeedback({ type: 'error', message: 'LOCKSS URL is required when LOCKSS is enabled.' });
      return;
    }
    if (setupArchiving.enableClockss && !setupArchiving.clockssUrl.trim()) {
      setSetupArchivingFeedback({ type: 'error', message: 'CLOCKSS URL is required when CLOCKSS is enabled.' });
      return;
    }
    setSetupArchivingFeedback(null);
    const success = await websiteSettings.saveSettings({ setup_archiving: JSON.stringify(setupArchiving) });
    setSetupArchivingFeedback(success ? { type: 'success', message: 'Archiving settings saved successfully.' } : { type: 'error', message: websiteSettings.error || 'Failed to save archiving settings.' });
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", minHeight: "100%", backgroundColor: "#eaedee", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ padding: "1.5rem 1.5rem 0 1.5rem" }}>
        <h1 className="text-2xl font-bold text-[#002C40] mb-2">Website Settings</h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.54)", marginBottom: "1.5rem" }}>
          Configure the appearance of and information on your reader-facing website, set up your site's languages and archiving settings, and install and enable plugins.
        </p>
      </div>

      <div style={{ padding: "0 1.5rem", width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
        <PkpTabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab}>
          <div style={{ borderBottom: "2px solid #e5e5e5", background: "#ffffff", padding: "0", display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="appearance">{t('editor.settings.website.appearance')}</PkpTabsTrigger>
              <PkpTabsTrigger value="setup">{t('editor.settings.website.setup')}</PkpTabsTrigger>
              <PkpTabsTrigger value="plugins">{t('editor.settings.website.plugins')}</PkpTabsTrigger>
            </PkpTabsList>
            <div style={{ marginBottom: "0.5rem", paddingRight: "1.5rem" }}>
              <button style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#006798", backgroundColor: "#ffffff", border: "none", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", padding: "0.25rem 0.5rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#006798", color: "#ffffff", fontSize: "10px", fontWeight: "bold" }}>i</span>
                Help
              </button>
            </div>
          </div>

          {activeTab === "appearance" && (
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", boxShadow: "none", borderRadius: 0, display: "flex", gap: 0, minHeight: "500px" }}>
              <div style={{ width: "20rem", flexShrink: 0, borderRight: "1px solid #e5e5e5", backgroundColor: "#f8f9fa", padding: "1rem 0" }}>
                {['theme', 'appearance-setup', 'advanced'].map(tab => (
                  <button key={tab} onClick={() => setActiveAppearanceSubTab(tab)} style={{ display: "block", width: "100%", padding: "0.75rem 1rem", textAlign: "left", backgroundColor: activeAppearanceSubTab === tab ? "rgba(0, 103, 152, 0.1)" : "transparent", color: activeAppearanceSubTab === tab ? "#006798" : "rgba(0, 0, 0, 0.84)", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: activeAppearanceSubTab === tab ? 600 : 400 }}>
                    {tab === 'theme' ? 'Theme' : tab === 'appearance-setup' ? 'Setup' : 'Advanced'}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {activeAppearanceSubTab === "theme" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Theme</h2>
                    {appearanceThemeFeedback && <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px", backgroundColor: appearanceThemeFeedback.type === 'success' ? '#d4edda' : '#f8d7da', color: appearanceThemeFeedback.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${appearanceThemeFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, fontSize: "0.875rem" }}>{appearanceThemeFeedback.message}</div>}
                    <form onSubmit={handleSaveAppearanceTheme}>
                      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Theme</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "0.5rem" }}>New themes may be installed from the Plugins tab at the top of this page.</p>
                          <PkpSelect style={{ width: "100%", maxWidth: "400px" }} value={appearanceTheme.activeTheme} onChange={(e) => setAppearanceTheme({ ...appearanceTheme, activeTheme: e.target.value })}>
                            <option value="default">Default Theme</option>
                          </PkpSelect>
                        </div>
                        <div style={{ marginBottom: "2rem", borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Typography</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {['noto_sans', 'noto_serif', 'serif_sans', 'sans_serif', 'lato', 'lora', 'lora_open'].map(font => (
                              <PkpRadio key={font} id={`typo-${font}`} name="typography" value={font} label={font.replace('_', ' ')} checked={appearanceTheme.typography === font} onChange={() => setAppearanceTheme({ ...appearanceTheme, typography: font })} />
                            ))}
                          </div>
                        </div>
                        <div style={{ marginBottom: "2rem", borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Colour</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <input type="color" value={appearanceTheme.headerColor} onChange={(e) => setAppearanceTheme({ ...appearanceTheme, headerColor: e.target.value })} style={{ width: "50px", height: "50px", padding: 0, border: "none", cursor: "pointer" }} />
                            <PkpInput value={appearanceTheme.headerColor} onChange={(e) => setAppearanceTheme({ ...appearanceTheme, headerColor: e.target.value })} style={{ width: "150px" }} />
                          </div>
                        </div>
                        <div style={{ marginBottom: "2rem", borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Journal Summary</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <PkpCheckbox id="showJournalSummary" checked={appearanceTheme.showJournalSummary} onChange={(e) => setAppearanceTheme({ ...appearanceTheme, showJournalSummary: e.target.checked })} />
                            <label htmlFor="showJournalSummary" style={{ fontSize: "0.875rem", color: "#333", cursor: "pointer" }}>Show the journal summary on the homepage.</label>
                          </div>
                        </div>
                        <div style={{ marginBottom: "2rem", borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Header Background Image</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <PkpCheckbox id="showHeaderImage" checked={appearanceTheme.showHeaderImage} onChange={(e) => setAppearanceTheme({ ...appearanceTheme, showHeaderImage: e.target.checked })} />
                            <label htmlFor="showHeaderImage" style={{ fontSize: "0.875rem", color: "#333", cursor: "pointer" }}>Show the homepage image as the header background.</label>
                          </div>
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>{websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}</PkpButton>
                      </div>
                    </form>
                  </div>
                )}
                {activeAppearanceSubTab === "appearance-setup" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Appearance Setup</h2>
                    {appearanceSetupFeedback && <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px", backgroundColor: appearanceSetupFeedback.type === 'success' ? '#d4edda' : '#f8d7da', color: appearanceSetupFeedback.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${appearanceSetupFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, fontSize: "0.875rem" }}>{appearanceSetupFeedback.message}</div>}
                    <form onSubmit={handleSaveAppearanceSetup}>
                      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                        {['Logo', 'Journal thumbnail', 'Homepage Image'].map(item => (
                          <div key={item} style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>{item}</h3>
                            <div style={{ border: "1px dashed #ccc", padding: "2rem", textAlign: "center", backgroundColor: "#fff", marginBottom: "0.5rem", borderRadius: "4px" }}>
                              <span style={{ color: "#006798", fontSize: "0.875rem" }}>Drop files here to upload</span>
                            </div>
                            <PkpButton type="button" variant="onclick" style={{ fontSize: "0.875rem" }}>Upload File</PkpButton>
                          </div>
                        ))}
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Page Footer</h3>
                          <div style={{ border: "1px solid #ccc", borderBottom: "none", padding: "0.5rem", display: "flex", gap: "0.75rem", backgroundColor: "#fff", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
                            <Bold size={16} color="#555" /><Italic size={16} color="#555" /><LinkIcon size={16} color="#555" /><List size={16} color="#555" /><ImageIcon size={16} color="#555" /><Code size={16} color="#555" />
                          </div>
                          <PkpTextarea rows={8} style={{ width: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0 }} value={appearanceSetup.pageFooter} onChange={(e) => setAppearanceSetup({ ...appearanceSetup, pageFooter: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Sidebar</h3>
                          <div style={{ border: "1px solid #ddd", borderRadius: "4px" }}>
                            {appearanceSetup.sidebarBlocks.map((block, index) => (
                              <div key={block.id} style={{ display: "flex", alignItems: "center", padding: "0.75rem 1rem", borderBottom: index < appearanceSetup.sidebarBlocks.length - 1 ? "1px solid #eee" : "none", backgroundColor: "#fff" }}>
                                <div style={{ color: "#006798", marginRight: "1rem", cursor: "move" }}><ArrowUpDown size={16} /></div>
                                <div style={{ marginRight: "1rem" }}><PkpCheckbox checked={block.enabled} onChange={(e) => { const newBlocks = [...appearanceSetup.sidebarBlocks]; newBlocks[index].enabled = e.target.checked; setAppearanceSetup({ ...appearanceSetup, sidebarBlocks: newBlocks }); }} /></div>
                                <span style={{ flex: 1, fontSize: "0.875rem", color: "#333" }}>{block.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>{websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}</PkpButton>
                      </div>
                    </form>
                  </div>
                )}
                {activeAppearanceSubTab === "advanced" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Advanced Appearance</h2>
                    {appearanceAdvancedFeedback && <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px", backgroundColor: appearanceAdvancedFeedback.type === 'success' ? '#d4edda' : '#f8d7da', color: appearanceAdvancedFeedback.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${appearanceAdvancedFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, fontSize: "0.875rem" }}>{appearanceAdvancedFeedback.message}</div>}
                    <form onSubmit={handleSaveAppearanceAdvanced}>
                      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                        {['Journal style sheet', 'Favicon'].map(item => (
                          <div key={item} style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>{item}</h3>
                            <div style={{ border: "1px dashed #ccc", padding: "2rem", textAlign: "center", backgroundColor: "#fff", marginBottom: "0.5rem", borderRadius: "4px" }}>
                              <span style={{ color: "#006798", fontSize: "0.875rem" }}>Drop files here to upload</span>
                            </div>
                            <PkpButton type="button" variant="onclick" style={{ fontSize: "0.875rem" }}>Upload File</PkpButton>
                          </div>
                        ))}
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Additional Content</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "0.5rem" }}>Anything entered here will appear on your homepage.</p>
                          <div style={{ border: "1px solid #ccc", borderBottom: "none", padding: "0.5rem", display: "flex", gap: "0.75rem", backgroundColor: "#fff", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
                            <Bold size={16} color="#555" /><Italic size={16} color="#555" /><LinkIcon size={16} color="#555" /><List size={16} color="#555" /><ImageIcon size={16} color="#555" /><Code size={16} color="#555" />
                          </div>
                          <PkpTextarea rows={8} style={{ width: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0 }} value={appearanceAdvanced.additionalContent} onChange={(e) => setAppearanceAdvanced({ ...appearanceAdvanced, additionalContent: e.target.value })} />
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>{websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}</PkpButton>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "setup" && (
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", boxShadow: "none", borderRadius: 0, display: "flex", gap: 0, minHeight: "500px" }}>
              <div style={{ width: "20rem", flexShrink: 0, borderRight: "1px solid #e5e5e5", backgroundColor: "#f8f9fa", padding: "1rem 0" }}>
                {['information', 'languages', 'navigationMenus', 'announcements', 'lists', 'privacy', 'dateTime', 'archiving'].map(tab => (
                  <button key={tab} onClick={() => setActiveSetupSubTab(tab)} style={{ display: "block", width: "100%", padding: "0.75rem 1rem", textAlign: "left", backgroundColor: activeSetupSubTab === tab ? "rgba(0, 103, 152, 0.1)" : "transparent", color: activeSetupSubTab === tab ? "#006798" : "rgba(0, 0, 0, 0.84)", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: activeSetupSubTab === tab ? 600 : 400 }}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {activeSetupSubTab === "information" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Information</h2>
                    {setupInformationFeedback && <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px", backgroundColor: setupInformationFeedback.type === 'success' ? '#d4edda' : '#f8d7da', color: setupInformationFeedback.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${setupInformationFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, fontSize: "0.875rem" }}>{setupInformationFeedback.message}</div>}
                    <form onSubmit={handleSaveSetupInformation}>
                      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                          <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Descriptions</h3>
                            <p style={{ fontSize: "0.875rem", color: "#333", lineHeight: "1.5" }}>
                              Brief descriptions of the journal for librarians and prospective authors and readers. These are made available in the site's sidebar when the Information block has been added.
                            </p>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {['For Readers', 'For Authors', 'For Librarians'].map((label) => {
                              const key = label === 'For Readers' ? 'forReaders' : label === 'For Authors' ? 'forAuthors' : 'forLibrarians';
                              return (
                                <div key={key}>
                                  <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>{label}</h3>
                                  <div style={{ border: "1px solid #ccc", borderBottom: "none", padding: "0.5rem", display: "flex", gap: "0.75rem", backgroundColor: "#fff", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
                                    <Bold size={16} color="#555" /><Italic size={16} color="#555" /><Superscript size={16} color="#555" /><Subscript size={16} color="#555" /><LinkIcon size={16} color="#555" /><Quote size={16} color="#555" /><List size={16} color="#555" /><ImageIcon size={16} color="#555" /><Code size={16} color="#555" />
                                  </div>
                                  <PkpTextarea
                                    rows={6}
                                    style={{ width: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                                    value={setupInformation[key as keyof typeof setupInformation]}
                                    onChange={(e) => setSetupInformation({ ...setupInformation, [key]: e.target.value })}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e5e5e5" }}>
                          <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>{websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}</PkpButton>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
                {activeSetupSubTab === "languages" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Languages</h2>
                    {setupLanguagesFeedback && <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px", backgroundColor: setupLanguagesFeedback.type === 'success' ? '#d4edda' : '#f8d7da', color: setupLanguagesFeedback.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${setupLanguagesFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, fontSize: "0.875rem" }}>{setupLanguagesFeedback.message}</div>}
                    <form onSubmit={handleSaveSetupLanguages}>
                      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                        <div style={{ marginBottom: "1rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Languages</h3>
                          <PkpTable>
                            <PkpTableHeader>
                              <PkpTableRow>
                                <PkpTableHead>Locale</PkpTableHead>
                                <PkpTableHead className="text-center">Primary locale</PkpTableHead>
                                <PkpTableHead className="text-center">UI</PkpTableHead>
                                <PkpTableHead className="text-center">Forms</PkpTableHead>
                                <PkpTableHead className="text-center">Submissions</PkpTableHead>
                              </PkpTableRow>
                            </PkpTableHeader>
                            <tbody>
                              {locales.filter(l => ['en', 'es', 'id'].includes(l)).map((locale) => (
                                <PkpTableRow key={locale}>
                                  <PkpTableCell>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                      <span style={{ color: "#006798", fontSize: "0.75rem" }}>▶</span>
                                      {localeNames[locale]}
                                    </div>
                                  </PkpTableCell>
                                  <PkpTableCell>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                      <input
                                        type="radio"
                                        name="primaryLocale"
                                        checked={setupLanguages.primaryLocale === locale}
                                        onChange={() => setSetupLanguages({ ...setupLanguages, primaryLocale: locale })}
                                        style={{ accentColor: "#d9534f", width: "16px", height: "16px", cursor: "pointer" }}
                                      />
                                    </div>
                                  </PkpTableCell>
                                  <PkpTableCell>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                      <PkpCheckbox
                                        checked={setupLanguages.languages[locale]?.ui || false}
                                        onChange={(e) => setSetupLanguages({
                                          ...setupLanguages,
                                          languages: {
                                            ...setupLanguages.languages,
                                            [locale]: { ...setupLanguages.languages[locale] || { ui: false, forms: false, submissions: false }, ui: e.target.checked }
                                          }
                                        })}
                                        disabled={setupLanguages.primaryLocale === locale}
                                        className="accent-[#d9534f]"
                                      />
                                    </div>
                                  </PkpTableCell>
                                  <PkpTableCell>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                      <PkpCheckbox
                                        checked={setupLanguages.languages[locale]?.forms || false}
                                        onChange={(e) => setSetupLanguages({
                                          ...setupLanguages,
                                          languages: {
                                            ...setupLanguages.languages,
                                            [locale]: { ...setupLanguages.languages[locale] || { ui: false, forms: false, submissions: false }, forms: e.target.checked }
                                          }
                                        })}
                                        className="accent-[#d9534f]"
                                      />
                                    </div>
                                  </PkpTableCell>
                                  <PkpTableCell>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                      <PkpCheckbox
                                        checked={setupLanguages.languages[locale]?.submissions || false}
                                        onChange={(e) => setSetupLanguages({
                                          ...setupLanguages,
                                          languages: {
                                            ...setupLanguages.languages,
                                            [locale]: { ...setupLanguages.languages[locale] || { ui: false, forms: false, submissions: false }, submissions: e.target.checked }
                                          }
                                        })}
                                        className="accent-[#d9534f]"
                                      />
                                    </div>
                                  </PkpTableCell>
                                </PkpTableRow>
                              ))}
                            </tbody>
                          </PkpTable>
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>{websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}</PkpButton>
                      </div>
                    </form>
                  </div>
                )}
                {activeSetupSubTab === "navigationMenus" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Navigation</h2>

                    {/* Navigation Section */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem", marginBottom: "2rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40" }}>Navigation</h3>
                        <PkpButton variant="onclick" style={{ fontSize: "0.875rem" }}>Add Menu</PkpButton>
                      </div>
                      <PkpTable>
                        <PkpTableHeader>
                          <PkpTableRow>
                            <PkpTableHead>Title</PkpTableHead>
                            <PkpTableHead>Navigation Menu Items</PkpTableHead>
                          </PkpTableRow>
                        </PkpTableHeader>
                        <tbody>
                          {navigationMenus.map((menu, idx) => (
                            <PkpTableRow key={idx}>
                              <PkpTableCell style={{ verticalAlign: 'top', width: '30%' }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                                  <span style={{ color: "#006798", fontSize: "0.75rem", marginTop: "3px" }}>▶</span>
                                  <a href="#" className="text-[#006798] hover:underline">{menu.title}</a>
                                </div>
                              </PkpTableCell>
                              <PkpTableCell style={{ verticalAlign: 'top' }}>
                                {menu.items}
                              </PkpTableCell>
                            </PkpTableRow>
                          ))}
                        </tbody>
                      </PkpTable>
                    </div>

                    {/* Navigation Menu Items Section */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40" }}>Navigation Menu Items</h3>
                        <PkpButton variant="onclick" style={{ fontSize: "0.875rem" }}>Add item</PkpButton>
                      </div>
                      <div className="border border-gray-200 rounded-sm">
                        {navigationMenuItems.map((item, idx) => (
                          <div key={idx} className={`border-b border-gray-100 last:border-0 ${expandedMenuItem === item ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                            <div
                              className="flex items-center px-4 py-3 cursor-pointer"
                              onClick={() => setExpandedMenuItem(expandedMenuItem === item ? null : item)}
                            >
                              <div className="mr-2 text-[#006798]">
                                {expandedMenuItem === item ? <ChevronDown size={16} /> : <span className="text-[10px] ml-[3px]">▶</span>}
                              </div>
                              <span className="text-sm text-[#333]">{item}</span>
                            </div>
                            {expandedMenuItem === item && (
                              <div className="px-4 pb-3 pl-10 flex gap-4">
                                <button className="text-[#006798] text-sm font-bold hover:underline">Edit</button>
                                <button className="text-[#d00a6c] text-sm font-bold hover:underline">Remove</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeSetupSubTab === "announcements" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Announcements</h2>
                    {setupAnnouncementsFeedback && <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px", backgroundColor: setupAnnouncementsFeedback.type === 'success' ? '#d4edda' : '#f8d7da', color: setupAnnouncementsFeedback.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${setupAnnouncementsFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, fontSize: "0.875rem" }}>{setupAnnouncementsFeedback.message}</div>}
                    <form onSubmit={handleSaveSetupAnnouncements}>
                      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                        <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "1.5rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Announcements</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Announcements may be published to inform readers of journal news and events. Published announcements will appear on the Announcements page.
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <PkpCheckbox
                              id="enableAnnouncements"
                              checked={setupAnnouncements.enableAnnouncements}
                              onChange={(e) => setSetupAnnouncements({ ...setupAnnouncements, enableAnnouncements: e.target.checked })}
                            />
                            <label htmlFor="enableAnnouncements" style={{ fontSize: "0.875rem", color: "#333", cursor: "pointer" }}>Enable announcements</label>
                          </div>
                        </div>
                        <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "flex-end" }}>
                          <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>{websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}</PkpButton>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab === "lists" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Lists</h2>
                    {setupListsFeedback && <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px", backgroundColor: setupListsFeedback.type === 'success' ? '#d4edda' : '#f8d7da', color: setupListsFeedback.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${setupListsFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, fontSize: "0.875rem" }}>{setupListsFeedback.message}</div>}
                    <form onSubmit={handleSaveSetupLists}>
                      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Items per page <span className="text-red-500">*</span></h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "0.5rem" }}>
                            Limit the number of items (for example, submissions, users, or editing assignments) to show in a list before showing subsequent items in another page.
                          </p>
                          <PkpInput
                            type="number"
                            value={setupLists.itemsPerPage}
                            onChange={(e) => setSetupLists({ ...setupLists, itemsPerPage: parseInt(e.target.value) || 0 })}
                            style={{ width: "100px" }}
                          />
                        </div>
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Page links <span className="text-red-500">*</span></h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "0.5rem" }}>
                            Limit the number of links to display to subsequent pages in a list.
                          </p>
                          <PkpInput
                            type="number"
                            defaultValue={10}
                            style={{ width: "100px" }}
                          />
                        </div>
                        <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "flex-end" }}>
                          <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>{websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}</PkpButton>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab === "privacy" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Privacy Statement</h2>
                    {setupPrivacyFeedback && <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px", backgroundColor: setupPrivacyFeedback.type === 'success' ? '#d4edda' : '#f8d7da', color: setupPrivacyFeedback.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${setupPrivacyFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, fontSize: "0.875rem" }}>{setupPrivacyFeedback.message}</div>}
                    <form onSubmit={handleSaveSetupPrivacy}>
                      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Privacy Statement</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem", lineHeight: "1.5" }}>
                            This statement will appear during user registration, author submission, and on the publicly available Privacy page. In some jurisdictions, you are legally required to disclose how you handle user data in this privacy policy.
                          </p>
                          <div style={{ border: "1px solid #ccc", borderBottom: "none", padding: "0.5rem", display: "flex", gap: "0.75rem", backgroundColor: "#fff", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
                            <Bold size={16} color="#555" /><Italic size={16} color="#555" /><Superscript size={16} color="#555" /><Subscript size={16} color="#555" /><LinkIcon size={16} color="#555" /><Quote size={16} color="#555" /><List size={16} color="#555" /><List size={16} color="#555" /><ImageIcon size={16} color="#555" /><Code size={16} color="#555" />
                          </div>
                          <PkpTextarea
                            rows={8}
                            style={{ width: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                            value={setupPrivacy.privacyStatement}
                            onChange={(e) => setSetupPrivacy({ ...setupPrivacy, privacyStatement: e.target.value })}
                            placeholder="The names and email addresses entered in this journal site will be used exclusively for the stated purposes of this journal and will not be made available for any other purpose or to any other party."
                          />
                        </div>
                        <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "flex-end" }}>
                          <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>{websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}</PkpButton>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab === "dateTime" && (
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#002C40" }}>Date & Time</h2>
                    {setupDateTimeFeedback && <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px", backgroundColor: setupDateTimeFeedback.type === 'success' ? '#d4edda' : '#f8d7da', color: setupDateTimeFeedback.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${setupDateTimeFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, fontSize: "0.875rem" }}>{setupDateTimeFeedback.message}</div>}
                    <form onSubmit={handleSaveSetupDateTime}>
                      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                          <div>
                            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem" }}>Date and Time Formats</h3>
                            <p style={{ fontSize: "0.875rem", color: "#333", lineHeight: "1.5" }}>
                              Choose the preferred format for dates and times. A custom format can be entered using the <a href="#" className="text-[#006798] hover:underline">special format characters</a>.
                            </p>
                          </div>
                          <div className="flex flex-col gap-6">
                            {/* Date Format */}
                            <fieldset className="border border-gray-200 p-4 rounded-sm">
                              <legend className="text-sm font-bold text-[#002C40] px-2">Date</legend>
                              <div className="flex flex-col gap-2">
                                {['December 1, 2025', 'December 1 2025', '1 December 2025', '2025 December 1'].map((fmt) => (
                                  <div key={fmt} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="dateFormat"
                                      id={`date-${fmt}`}
                                      checked={setupDateTime.dateFormat === fmt}
                                      onChange={() => setSetupDateTime({ ...setupDateTime, dateFormat: fmt })}
                                      className="accent-[#d9534f]"
                                    />
                                    <label htmlFor={`date-${fmt}`} className="text-sm text-[#333]">{fmt}</label>
                                  </div>
                                ))}
                                <div className="flex items-center gap-2 mt-1">
                                  <input type="radio" name="dateFormat" id="date-custom" className="accent-[#d9534f]" />
                                  <label htmlFor="date-custom" className="text-sm text-[#333]">Custom</label>
                                  <input type="text" className="border border-gray-300 px-2 py-1 text-sm rounded w-40" />
                                </div>
                              </div>
                            </fieldset>

                            {/* Date (Short) Format */}
                            <fieldset className="border border-gray-200 p-4 rounded-sm">
                              <legend className="text-sm font-bold text-[#002C40] px-2">Date (Short)</legend>
                              <div className="flex flex-col gap-2">
                                {['2025-12-01', '01-12-2025', '12/01/2025', '01.12.2025'].map((fmt) => (
                                  <div key={fmt} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="dateFormatShort"
                                      id={`dateShort-${fmt}`}
                                      checked={setupDateTime.dateFormatShort === fmt}
                                      onChange={() => setSetupDateTime({ ...setupDateTime, dateFormatShort: fmt })}
                                      className="accent-[#d9534f]"
                                    />
                                    <label htmlFor={`dateShort-${fmt}`} className="text-sm text-[#333]">{fmt}</label>
                                  </div>
                                ))}
                                <div className="flex items-center gap-2 mt-1">
                                  <input type="radio" name="dateFormatShort" id="dateShort-custom" className="accent-[#d9534f]" />
                                  <label htmlFor="dateShort-custom" className="text-sm text-[#333]">Custom</label>
                                  <input type="text" className="border border-gray-300 px-2 py-1 text-sm rounded w-40" />
                                </div>
                              </div>
                            </fieldset>

                            {/* Time Format */}
                            <fieldset className="border border-gray-200 p-4 rounded-sm">
                              <legend className="text-sm font-bold text-[#002C40] px-2">Time</legend>
                              <div className="flex flex-col gap-2">
                                {['14:53', '02:53 PM', '2:53pm'].map((fmt) => (
                                  <div key={fmt} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="timeFormat"
                                      id={`time-${fmt}`}
                                      checked={setupDateTime.timeFormat === fmt}
                                      onChange={() => setSetupDateTime({ ...setupDateTime, timeFormat: fmt })}
                                      className="accent-[#d9534f]"
                                    />
                                    <label htmlFor={`time-${fmt}`} className="text-sm text-[#333]">{fmt}</label>
                                  </div>
                                ))}
                                <div className="flex items-center gap-2 mt-1">
                                  <input type="radio" name="timeFormat" id="time-custom" className="accent-[#d9534f]" />
                                  <label htmlFor="time-custom" className="text-sm text-[#333]">Custom</label>
                                  <input type="text" className="border border-gray-300 px-2 py-1 text-sm rounded w-40" />
                                </div>
                              </div>
                            </fieldset>

                            {/* Date & Time Format */}
                            <fieldset className="border border-gray-200 p-4 rounded-sm">
                              <legend className="text-sm font-bold text-[#002C40] px-2">Date & Time</legend>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="dateTimeFormat"
                                    id="dateTime-default"
                                    checked={setupDateTime.dateTimeFormat === 'December 1, 2025 - 02:53 PM'}
                                    onChange={() => setSetupDateTime({ ...setupDateTime, dateTimeFormat: 'December 1, 2025 - 02:53 PM' })}
                                    className="accent-[#d9534f]"
                                  />
                                  <label htmlFor="dateTime-default" className="text-sm text-[#333]">December 1, 2025 - 02:53 PM</label>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="radio"
                                    name="dateTimeFormat"
                                    id="dateTime-custom"
                                    checked={setupDateTime.dateTimeFormat !== 'December 1, 2025 - 02:53 PM'}
                                    onChange={() => setSetupDateTime({ ...setupDateTime, dateTimeFormat: '' })}
                                    className="accent-[#d9534f]"
                                  />
                                  <label htmlFor="dateTime-custom" className="text-sm text-[#333]">Custom</label>
                                  <input
                                    type="text"
                                    className="border border-gray-300 px-2 py-1 text-sm rounded w-40"
                                    value={setupDateTime.dateTimeFormat !== 'December 1, 2025 - 02:53 PM' ? setupDateTime.dateTimeFormat : ''}
                                    onChange={(e) => setSetupDateTime({ ...setupDateTime, dateTimeFormat: e.target.value })}
                                    disabled={setupDateTime.dateTimeFormat === 'December 1, 2025 - 02:53 PM'}
                                  />
                                </div>
                              </div>
                            </fieldset>

                            {/* Date & Time (Short) Format */}
                            <fieldset className="border border-gray-200 p-4 rounded-sm">
                              <legend className="text-sm font-bold text-[#002C40] px-2">Date & Time (Short)</legend>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="dateTimeFormatShort"
                                    id="dateTimeShort-default"
                                    checked={setupDateTime.dateTimeFormatShort === '2025-12-01 02:53 PM'}
                                    onChange={() => setSetupDateTime({ ...setupDateTime, dateTimeFormatShort: '2025-12-01 02:53 PM' })}
                                    className="accent-[#d9534f]"
                                  />
                                  <label htmlFor="dateTimeShort-default" className="text-sm text-[#333]">2025-12-01 02:53 PM</label>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="radio"
                                    name="dateTimeFormatShort"
                                    id="dateTimeShort-custom"
                                    checked={setupDateTime.dateTimeFormatShort !== '2025-12-01 02:53 PM'}
                                    onChange={() => setSetupDateTime({ ...setupDateTime, dateTimeFormatShort: '' })}
                                    className="accent-[#d9534f]"
                                  />
                                  <label htmlFor="dateTimeShort-custom" className="text-sm text-[#333]">Custom</label>
                                  <input
                                    type="text"
                                    className="border border-gray-300 px-2 py-1 text-sm rounded w-40"
                                    value={setupDateTime.dateTimeFormatShort !== '2025-12-01 02:53 PM' ? setupDateTime.dateTimeFormatShort : ''}
                                    onChange={(e) => setSetupDateTime({ ...setupDateTime, dateTimeFormatShort: e.target.value })}
                                    disabled={setupDateTime.dateTimeFormatShort === '2025-12-01 02:53 PM'}
                                  />
                                </div>
                              </div>
                            </fieldset>
                          </div>
                        </div>
                        <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "flex-end" }}>
                          <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>{websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}</PkpButton>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab !== "information" && activeSetupSubTab !== "languages" && activeSetupSubTab !== "navigationMenus" && activeSetupSubTab !== "announcements" && activeSetupSubTab !== "lists" && activeSetupSubTab !== "privacy" && activeSetupSubTab !== "dateTime" && <div>Content for {activeSetupSubTab}</div>}
              </div>
            </div>
          )}

          {activeTab === "plugins" && (
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "1.5rem", minHeight: "500px" }}>
              {/* Horizontal Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${activePluginsSubTab === 'installedPlugins' ? 'text-[#006798] font-bold' : 'text-gray-600 hover:text-[#006798]'}`}
                  onClick={() => setActivePluginsSubTab('installedPlugins')}
                >
                  Installed Plugins
                  {activePluginsSubTab === 'installedPlugins' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#006798]"></div>
                  )}
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${activePluginsSubTab === 'gallery' ? 'text-[#006798] font-bold' : 'text-gray-600 hover:text-[#006798]'}`}
                  onClick={() => setActivePluginsSubTab('gallery')}
                >
                  Plugin Gallery
                  {activePluginsSubTab === 'gallery' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#006798]"></div>
                  )}
                </button>
              </div>

              {activePluginsSubTab === "installedPlugins" && (
                <div>
                  {/* Header and Actions */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-[#002C40]">Plugins</h2>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-[#006798] border border-[#006798] rounded hover:bg-[#006798] hover:text-white transition-colors">
                        <Search size={14} /> Search
                      </button>
                      <button className="px-3 py-1 text-sm font-medium text-[#006798] border border-[#006798] rounded hover:bg-[#006798] hover:text-white transition-colors">
                        Upload A New Plugin
                      </button>
                    </div>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-[30%_55%_15%] border-b border-gray-200 pb-2 mb-2">
                    <div className="text-xs font-bold text-gray-500">Name</div>
                    <div className="text-xs font-bold text-gray-500">Description</div>
                    <div className="text-xs font-bold text-gray-500">Enabled</div>
                  </div>

                  {/* Plugin Categories */}
                  <div className="flex flex-col gap-4">
                    {/* Theme Plugins */}
                    <div>
                      <div className="bg-gray-100 px-4 py-2 text-sm font-bold text-[#002C40] border-t border-b border-gray-200">
                        Theme Plugins (1)
                      </div>
                      <div className="grid grid-cols-[30%_55%_15%] py-3 border-b border-gray-100 items-start hover:bg-gray-50">
                        <div className="flex items-start gap-2 px-4">
                          <span className="text-[#006798] text-[10px] mt-1 cursor-pointer">▶</span>
                          <span className="text-sm text-[#006798] cursor-pointer hover:underline">Default Theme</span>
                        </div>
                        <div className="text-sm text-gray-700 pr-4">
                          This theme implements the default theme.
                        </div>
                        <div className="flex items-start">
                          <input type="checkbox" checked={true} readOnly className="w-4 h-4 accent-[#d9534f]" />
                        </div>
                      </div>
                    </div>

                    {/* Metadata Plugins */}
                    <div>
                      <div className="bg-gray-100 px-4 py-2 text-sm font-bold text-[#002C40] border-t border-b border-gray-200">
                        Metadata Plugins (1)
                      </div>
                      <div className="grid grid-cols-[30%_55%_15%] py-3 border-b border-gray-100 items-start hover:bg-gray-50">
                        <div className="flex items-start gap-2 px-4">
                          <span className="text-[#006798] text-[10px] mt-1 cursor-pointer">▶</span>
                          <span className="text-sm text-[#006798] cursor-pointer hover:underline">Dublin Core 1.1 meta-data</span>
                        </div>
                        <div className="text-sm text-gray-700 pr-4">
                          Contributes Dublin Core version 1.1 schemas and application adapters.
                        </div>
                        <div className="flex items-start">
                          <input type="checkbox" checked={true} readOnly className="w-4 h-4 accent-[#006798]" />
                        </div>
                      </div>
                    </div>

                    {/* Authorization Plugins */}
                    <div>
                      <div className="bg-gray-100 px-4 py-2 text-sm font-bold text-[#002C40] border-t border-b border-gray-200">
                        Authorization Plugins (0)
                      </div>
                      <div className="py-4 text-center text-sm text-gray-500 italic border-b border-gray-100">
                        No Items
                      </div>
                    </div>

                    {/* Block Plugins */}
                    <div>
                      <div className="bg-gray-100 px-4 py-2 text-sm font-bold text-[#002C40] border-t border-b border-gray-200">
                        Block Plugins (6)
                      </div>
                      {[
                        { name: 'Browse Block', desc: 'This plugin provides sidebar "browse" tools.', enabled: false },
                        { name: '"Developed By" Block', desc: 'This plugin provides sidebar "Developed By" link.', enabled: false },
                        { name: 'Help Block', desc: 'This plugin provides sidebar help link.', enabled: true },
                        { name: 'Information Block', desc: 'This plugin provides sidebar information.', enabled: true },
                        { name: 'Language Toggle Block', desc: 'This plugin provides the language toggle block.', enabled: true },
                        { name: 'User Block', desc: 'This plugin provides user account tools.', enabled: true },
                      ].map((plugin, idx) => (
                        <div key={idx} className="grid grid-cols-[30%_55%_15%] py-3 border-b border-gray-100 items-start hover:bg-gray-50">
                          <div className="flex items-start gap-2 px-4">
                            <span className="text-[#006798] text-[10px] mt-1 cursor-pointer">▶</span>
                            <span className="text-sm text-[#006798] cursor-pointer hover:underline">{plugin.name}</span>
                          </div>
                          <div className="text-sm text-gray-700 pr-4">{plugin.desc}</div>
                          <div className="flex items-start">
                            <input type="checkbox" checked={plugin.enabled} readOnly className="w-4 h-4 accent-[#006798]" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Report Plugins (Existing Data) */}
                    <div>
                      <div className="bg-gray-100 px-4 py-2 text-sm font-bold text-[#002C40] border-t border-b border-gray-200">
                        Report Plugins (6)
                      </div>
                      {[
                        { name: 'Articles Report', desc: 'This plugin implements a CSV report containing a list of articles and their info.', enabled: true },
                        { name: 'COUNTER Reports', desc: 'The COUNTER plugin allows reporting on journal activity, using the COUNTER standard.', enabled: true },
                        { name: 'Review Report', desc: 'This plugin implements a CSV report containing a list of review assignments for a journal.', enabled: true },
                        { name: 'Subscriptions Report', desc: 'This plugin implements a CSV report containing a list of subscriptions and their info.', enabled: true },
                        { name: 'View Report', desc: 'This plugin implements a CSV report describing readership for each article.', enabled: true },
                        { name: 'PKP Usage statistics report', desc: 'PKP Default usage statistics report (COUNTER ready)', enabled: true },
                      ].map((plugin, idx) => (
                        <div key={idx} className="grid grid-cols-[30%_55%_15%] py-3 border-b border-gray-100 items-start hover:bg-gray-50">
                          <div className="flex items-start gap-2 px-4">
                            <span className="text-[#006798] text-[10px] mt-1 cursor-pointer">▶</span>
                            <span className="text-sm text-[#006798] cursor-pointer hover:underline">{plugin.name}</span>
                          </div>
                          <div className="text-sm text-gray-700 pr-4">{plugin.desc}</div>
                          <div className="flex items-start">
                            <input type="checkbox" checked={plugin.enabled} readOnly className="w-4 h-4 accent-[#006798]" />
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

              {activePluginsSubTab === "gallery" && (
                <div className="w-full">
                  {/* Header with Search */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-[#002C40]">Plugin Gallery</h2>
                    <button className="px-4 py-2 text-sm font-semibold text-[#006798] border border-[#006798] rounded hover:bg-[#006798] hover:text-white transition-colors">
                      <Search size={14} className="inline mr-1" /> Search
                    </button>
                  </div>

                  {/* Plugin Gallery Table Headers */}
                  <div className="grid grid-cols-[25%_60%_15%] border-b border-gray-200 pb-2 mb-3">
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
        </PkpTabs>
      </div>
    </div>
  );
}
