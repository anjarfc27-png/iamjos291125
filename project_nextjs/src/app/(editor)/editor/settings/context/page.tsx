"use client";

import { useState, useEffect } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { useJournalSettings, useMigrateLocalStorageToDatabase } from "@/features/editor/hooks/useJournalSettings";
import { useI18n } from "@/contexts/I18nContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SectionItem = {
  id: string;
  title: string;
  abbreviation: string;
  enabled: boolean;
  policy?: string;
};

type CategoryItem = {
  id: string;
  title: string;
  path: string;
  description?: string;
};

export default function SettingsContextPage() {
  const { t } = useI18n();
  // Database integration
  const contextSettings = useJournalSettings({
    section: "context",
    autoLoad: true,
  });

  // Migrate localStorage to database
  const migrateContext = useMigrateLocalStorageToDatabase(
    "context",
    ["settings_context_masthead", "settings_context_contact"]
  );

  useEffect(() => {
    migrateContext.migrate();
  }, []);

  // Masthead form state
  const [masthead, setMasthead] = useState({
    journalTitle: '',
    journalInitials: '',
    journalAbbreviation: '',
    publisher: '',
    url: '',
    onlineIssn: '',
    printIssn: '',
    journalSummary: '',
    editorialTeam: '',
    aboutJournal: '',
  });

  // Contact form state
  const [contact, setContact] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactAffiliation: '',
    mailingAddress: '',
    supportName: '',
    supportEmail: '',
    supportPhone: ''
  });

  // Sections state
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [sectionsFeedback, setSectionsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sectionsSaving, setSectionsSaving] = useState(false);
  const [newSection, setNewSection] = useState<Omit<SectionItem, 'id'>>({
    title: '',
    abbreviation: '',
    enabled: true,
    policy: '',
  });

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesFeedback, setCategoriesFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [categoriesSaving, setCategoriesSaving] = useState(false);
  const [newCategory, setNewCategory] = useState<Omit<CategoryItem, 'id'>>({
    title: '',
    path: '',
    description: '',
  });

  // Feedback states
  const [mastheadFeedback, setMastheadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [contactFeedback, setContactFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Journal details state
  const [journalDetails, setJournalDetails] = useState<any>(null);

  // Fetch basic journal info
  useEffect(() => {
    const fetchJournalDetails = async () => {
      const supabase = getSupabaseBrowserClient();
      let targetJournalId = contextSettings.journalId;

      if (!targetJournalId) {
        // Fallback: get the first journal if no ID is present (e.g. site admin or dev env)
        const { data: journals } = await supabase.from('journals').select('id').limit(1);
        if (journals && journals.length > 0) {
          targetJournalId = journals[0].id;
        }
      }

      if (!targetJournalId) return;

      const { data: journal } = await supabase
        .from('journals')
        .select('title, description, path')
        .eq('id', targetJournalId)
        .single();

      if (journal) {
        setJournalDetails(journal);
      }
    };

    fetchJournalDetails();
  }, [contextSettings.journalId]);

  // Load saved data and merge with defaults
  useEffect(() => {
    // Wait for either settings or journal details to be available
    if ((!contextSettings.settings && !journalDetails)) {
      return;
    }

    let newMasthead = {
      journalTitle: '',
      journalInitials: '',
      journalAbbreviation: '',
      publisher: '',
      url: '',
      onlineIssn: '',
      printIssn: '',
      journalSummary: '',
      editorialTeam: '',
      aboutJournal: '',
    };

    // 1. Apply defaults from Journal Details
    if (journalDetails) {
      newMasthead.journalTitle = journalDetails.title || '';
      newMasthead.journalSummary = journalDetails.description || '';
      if (journalDetails.title) {
        newMasthead.journalInitials = journalDetails.title.split(' ').map((w: string) => w[0]).join('').toUpperCase().substring(0, 3);
      }
      if (typeof window !== 'undefined' && journalDetails.path) {
        newMasthead.url = `${window.location.origin}/${journalDetails.path}`;
      }
    }

    // 2. Apply saved settings (override defaults if value exists)
    if (contextSettings.settings && Object.keys(contextSettings.settings).length > 0) {
      const settings = contextSettings.settings as any;

      // Masthead
      if (settings.masthead) {
        try {
          const mastheadData = typeof settings.masthead === 'string' ? JSON.parse(settings.masthead) : settings.masthead;

          if (mastheadData.journalTitle) newMasthead.journalTitle = mastheadData.journalTitle;
          if (mastheadData.journalInitials) newMasthead.journalInitials = mastheadData.journalInitials;
          if (mastheadData.journalAbbreviation) newMasthead.journalAbbreviation = mastheadData.journalAbbreviation;
          if (mastheadData.publisher) newMasthead.publisher = mastheadData.publisher;
          if (mastheadData.url) newMasthead.url = mastheadData.url;
          if (mastheadData.onlineIssn) newMasthead.onlineIssn = mastheadData.onlineIssn;
          if (mastheadData.printIssn) newMasthead.printIssn = mastheadData.printIssn;
          if (mastheadData.journalSummary) newMasthead.journalSummary = mastheadData.journalSummary;
          if (mastheadData.editorialTeam) newMasthead.editorialTeam = mastheadData.editorialTeam;
          if (mastheadData.aboutJournal) newMasthead.aboutJournal = mastheadData.aboutJournal;
        } catch {
          // Ignore parse errors
        }
      }

      // Contact
      if (settings.contactName || settings.contactEmail) {
        setContact({
          contactName: settings.contactName || '',
          contactEmail: settings.contactEmail || '',
          contactPhone: settings.contactPhone || '',
          contactAffiliation: settings.contactAffiliation || '',
          mailingAddress: settings.mailingAddress || '',
          supportName: settings.supportName || '',
          supportEmail: settings.supportEmail || '',
          supportPhone: settings.supportPhone || ''
        });
      }
    }

    setMasthead(newMasthead);

  }, [contextSettings.settings, journalDetails]);

  // Load sections and categories from tables
  useEffect(() => {
    const loadSectionsAndCategories = async () => {
      if (!contextSettings.journalId) return;

      const supabase = getSupabaseBrowserClient();

      // Load Sections
      const { data: sectionsData } = await supabase
        .from('sections')
        .select('*')
        .eq('journal_id', contextSettings.journalId)
        .order('seq', { ascending: true });

      if (sectionsData) {
        // Fetch section settings (title, abbreviation, policy)
        const sectionIds = sectionsData.map(s => s.id);
        if (sectionIds.length > 0) {
          const { data: settingsData } = await supabase
            .from('section_settings')
            .select('*')
            .in('section_id', sectionIds);

          const settingsMap = new Map();
          settingsData?.forEach((setting: any) => {
            if (!settingsMap.has(setting.section_id)) {
              settingsMap.set(setting.section_id, {});
            }
            settingsMap.get(setting.section_id)[setting.setting_name] = setting.setting_value;
          });

          const formattedSections = sectionsData.map((s: any) => {
            const settings = settingsMap.get(s.id) || {};
            return {
              id: s.id,
              title: settings.title || '',
              abbreviation: settings.abbreviation || '',
              enabled: !s.is_inactive,
              policy: settings.policy || '',
            };
          });
          setSections(formattedSections);
        } else {
          setSections([]);
        }
      }

      // Load Categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('context_id', contextSettings.journalId);

      if (categoriesData) {
        // Fetch category settings
        const categoryIds = categoriesData.map(c => c.id);
        if (categoryIds.length > 0) {
          const { data: settingsData } = await supabase
            .from('category_settings')
            .select('*')
            .in('category_id', categoryIds);

          const settingsMap = new Map();
          settingsData?.forEach((setting: any) => {
            if (!settingsMap.has(setting.category_id)) {
              settingsMap.set(setting.category_id, {});
            }
            settingsMap.get(setting.category_id)[setting.setting_name] = setting.setting_value;
          });

          const formattedCategories = categoriesData.map((c: any) => {
            const settings = settingsMap.get(c.id) || {};
            return {
              id: c.id,
              title: settings.title || '',
              path: c.path,
              description: settings.description || '',
            };
          });
          setCategories(formattedCategories);
        } else {
          setCategories([]);
        }
      }
    };

    loadSectionsAndCategories();
  }, [contextSettings.journalId]);

  // Auto-dismiss feedback messages
  useEffect(() => {
    if (mastheadFeedback) {
      const timer = setTimeout(() => setMastheadFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mastheadFeedback]);

  useEffect(() => {
    if (contactFeedback) {
      const timer = setTimeout(() => setContactFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [contactFeedback]);

  useEffect(() => {
    if (sectionsFeedback) {
      const timer = setTimeout(() => setSectionsFeedback(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [sectionsFeedback]);

  useEffect(() => {
    if (categoriesFeedback) {
      const timer = setTimeout(() => setCategoriesFeedback(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [categoriesFeedback]);

  const persistSections = async (next: SectionItem[], successMessage: string) => {
    // This function is now mainly for updating local state after DB operations
    // The actual DB operations happen in add/delete/toggle handlers
    setSections(next);
    setSectionsFeedback({ type: 'success', message: successMessage });
  };

  const persistCategories = async (next: CategoryItem[], successMessage: string) => {
    setCategories(next);
    setCategoriesFeedback({ type: 'success', message: successMessage });
  };

  const handleAddSection = async () => {
    if (!newSection.title.trim()) {
      setSectionsFeedback({ type: 'error', message: 'Section title is required.' });
      return;
    }
    if (!contextSettings.journalId) {
      setSectionsFeedback({ type: 'error', message: 'Journal ID missing.' });
      return;
    }

    setSectionsSaving(true);
    const supabase = getSupabaseBrowserClient();

    try {
      // 1. Insert into sections table
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          journal_id: contextSettings.journalId,
          seq: sections.length + 1,
          is_inactive: !newSection.enabled,
          editor_restricted: false,
          meta_indexed: true,
          meta_reviewed: true,
          abstracts_not_required: false,
          hide_title: false,
          hide_author: false,
          abstract_word_count: 0
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      // 2. Insert into section_settings
      const settingsToInsert = [
        { section_id: sectionData.id, setting_name: 'title', setting_value: newSection.title.trim(), locale: 'en_US' },
        { section_id: sectionData.id, setting_name: 'abbreviation', setting_value: newSection.abbreviation.trim() || newSection.title.trim().slice(0, 3).toUpperCase(), locale: 'en_US' },
        { section_id: sectionData.id, setting_name: 'policy', setting_value: newSection.policy?.trim(), locale: 'en_US' }
      ];

      const { error: settingsError } = await supabase
        .from('section_settings')
        .insert(settingsToInsert);

      if (settingsError) throw settingsError;

      // Update local state
      const newItem: SectionItem = {
        id: sectionData.id,
        title: newSection.title.trim(),
        abbreviation: newSection.abbreviation.trim() || newSection.title.trim().slice(0, 3).toUpperCase(),
        enabled: newSection.enabled,
        policy: newSection.policy?.trim(),
      };

      setSections([...sections, newItem]);
      setSectionsFeedback({ type: 'success', message: 'Section added successfully.' });
      setNewSection({
        title: '',
        abbreviation: '',
        enabled: true,
        policy: '',
      });

    } catch (error: any) {
      console.error('Error adding section:', error);
      setSectionsFeedback({ type: 'error', message: error.message || 'Failed to add section.' });
    } finally {
      setSectionsSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    setSectionsSaving(true);
    const supabase = getSupabaseBrowserClient();
    try {
      const { error } = await supabase.from('sections').delete().eq('id', id);
      if (error) throw error;

      setSections(sections.filter(s => s.id !== id));
      setSectionsFeedback({ type: 'success', message: 'Section deleted.' });
    } catch (error: any) {
      console.error('Error deleting section:', error);
      setSectionsFeedback({ type: 'error', message: error.message || 'Failed to delete section.' });
    } finally {
      setSectionsSaving(false);
    }
  };

  const handleToggleSection = async (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;

    const supabase = getSupabaseBrowserClient();
    try {
      const { error } = await supabase
        .from('sections')
        .update({ is_inactive: section.enabled }) // toggle logic: enabled -> is_inactive=false
        .eq('id', id);

      if (error) throw error;

      setSections(sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
      setSectionsFeedback({ type: 'success', message: 'Section updated.' });
    } catch (error: any) {
      console.error('Error updating section:', error);
      setSectionsFeedback({ type: 'error', message: error.message || 'Failed to update section.' });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.title.trim() || !newCategory.path.trim()) {
      setCategoriesFeedback({ type: 'error', message: 'Category title and path are required.' });
      return;
    }
    if (!contextSettings.journalId) {
      setCategoriesFeedback({ type: 'error', message: 'Journal ID missing.' });
      return;
    }

    setCategoriesSaving(true);
    const supabase = getSupabaseBrowserClient();

    try {
      // 1. Insert into categories table
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert({
          context_id: contextSettings.journalId,
          path: newCategory.path.trim(),
          parent_id: 0,
          seq: categories.length + 1,
        })
        .select()
        .single();

      if (categoryError) throw categoryError;

      // 2. Insert into category_settings
      const settingsToInsert = [
        { category_id: categoryData.id, setting_name: 'title', setting_value: newCategory.title.trim(), locale: 'en_US' },
        { category_id: categoryData.id, setting_name: 'description', setting_value: newCategory.description?.trim(), locale: 'en_US' }
      ];

      const { error: settingsError } = await supabase
        .from('category_settings')
        .insert(settingsToInsert);

      if (settingsError) throw settingsError;

      // Update local state
      const newItem: CategoryItem = {
        id: categoryData.id,
        title: newCategory.title.trim(),
        path: newCategory.path.trim(),
        description: newCategory.description?.trim(),
      };

      setCategories([...categories, newItem]);
      setCategoriesFeedback({ type: 'success', message: 'Category added successfully.' });
      setNewCategory({
        title: '',
        path: '',
        description: '',
      });

    } catch (error: any) {
      console.error('Error adding category:', error);
      setCategoriesFeedback({ type: 'error', message: error.message || 'Failed to add category.' });
    } finally {
      setCategoriesSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setCategoriesSaving(true);
    const supabase = getSupabaseBrowserClient();
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;

      setCategories(categories.filter(c => c.id !== id));
      setCategoriesFeedback({ type: 'success', message: 'Category deleted.' });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setCategoriesFeedback({ type: 'error', message: error.message || 'Failed to delete category.' });
    } finally {
      setCategoriesSaving(false);
    }
  };

  // Save handlers
  const handleSaveMasthead = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!masthead.journalTitle.trim()) {
      setMastheadFeedback({ type: 'error', message: t('editor.settings.context.journalTitle') + ' is required.' });
      return;
    }
    if (!masthead.journalInitials.trim()) {
      setMastheadFeedback({ type: 'error', message: 'Journal initials are required.' });
      return;
    }

    setMastheadFeedback(null);
    const success = await contextSettings.saveSettings({
      masthead: JSON.stringify(masthead),
    });

    if (success) {
      setMastheadFeedback({ type: 'success', message: t('editor.settings.saved') });
    } else {
      setMastheadFeedback({ type: 'error', message: contextSettings.error || 'Failed to save masthead settings.' });
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!contact.contactEmail.trim()) {
      setContactFeedback({ type: 'error', message: t('editor.settings.context.contactEmail') + ' is required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.contactEmail)) {
      setContactFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setContactFeedback(null);
    const success = await contextSettings.saveSettings({
      contactName: contact.contactName,
      contactEmail: contact.contactEmail,
      contactPhone: contact.contactPhone,
      contactAffiliation: contact.contactAffiliation,
      mailingAddress: contact.mailingAddress,
      supportName: contact.supportName,
      supportEmail: contact.supportEmail,
      supportPhone: contact.supportPhone
    });

    if (success) {
      setContactFeedback({ type: 'success', message: t('editor.settings.saved') });
    } else {
      setContactFeedback({ type: 'error', message: contextSettings.error || 'Failed to save contact information.' });
    }
  };
  return (
    <div style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}>
      {/* Page Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "1.5rem 1.5rem 0 1.5rem",
      }}>
        <h1 className="text-2xl font-bold text-[#002C40] mb-2">
          Journal Settings
        </h1>
        <p style={{
          fontSize: "0.875rem",
          color: "rgba(0, 0, 0, 0.54)",
          marginBottom: "1.5rem",
        }}>
          Configure basic details about the journal, including title, description, masthead, contact information, and sections.
        </p>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area and centered card */}
      <div style={{
        padding: "0 1.5rem",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        overflowX: "hidden",
      }}>
        <PkpTabs defaultValue="masthead">
          {/* Main Tabs */}
          <div style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="masthead">{t('editor.settings.context.masthead')}</PkpTabsTrigger>
              <PkpTabsTrigger value="contact">{t('editor.settings.context.contact')}</PkpTabsTrigger>
              <PkpTabsTrigger value="sections">{t('editor.settings.context.sections')}</PkpTabsTrigger>
              <PkpTabsTrigger value="categories">{t('editor.settings.context.categories')}</PkpTabsTrigger>
            </PkpTabsList>

            {/* Help Button */}
            <div style={{ marginBottom: "0.5rem", paddingRight: "1.5rem" }}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  color: "#006798",
                  backgroundColor: "#ffffff",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "#006798",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  i
                </span>
                Help
              </button>
            </div>
          </div>

          {/* Masthead Tab */}
          <PkpTabsContent value="masthead" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              {mastheadFeedback && (
                <div style={{
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  borderRadius: "4px",
                  backgroundColor: mastheadFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: mastheadFeedback.type === 'success' ? '#155724' : '#721c24',
                  border: `1px solid ${mastheadFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                  fontSize: "0.875rem",
                }}>
                  {mastheadFeedback.message}
                </div>
              )}
              <form onSubmit={handleSaveMasthead}>
                <div style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e5e5",
                  padding: "2rem",
                }}>
                  {/* Journal Identity */}
                  <div style={{ display: "flex", marginBottom: "2rem" }}>
                    <div style={{ width: "30%", paddingRight: "2rem" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#002C40", margin: 0 }}>Journal Identity</h3>
                    </div>
                    <div style={{ width: "70%" }}>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          Journal title <span style={{ color: "#dc3545" }}>*</span>
                        </label>
                        <PkpInput
                          type="text"
                          style={{ width: "100%" }}
                          value={masthead.journalTitle}
                          onChange={(e) => setMasthead({ ...masthead, journalTitle: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          Journal initials <span style={{ color: "#dc3545" }}>*</span>
                        </label>
                        <PkpInput
                          type="text"
                          style={{ width: "100%", maxWidth: "200px" }}
                          value={masthead.journalInitials}
                          onChange={(e) => setMasthead({ ...masthead, journalInitials: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          Journal Abbreviation
                        </label>
                        <PkpInput
                          type="text"
                          style={{ width: "100%", maxWidth: "400px" }}
                          value={masthead.journalAbbreviation}
                          onChange={(e) => setMasthead({ ...masthead, journalAbbreviation: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderTop: "1px solid #eee", margin: "2rem 0" }} />

                  {/* Publishing Details */}
                  <div style={{ display: "flex", marginBottom: "2rem" }}>
                    <div style={{ width: "30%", paddingRight: "2rem" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#002C40", margin: 0 }}>Publishing Details</h3>
                      <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem", lineHeight: "1.4" }}>
                        These details may be included in metadata provided to third-party archival bodies.
                      </p>
                    </div>
                    <div style={{ width: "70%" }}>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          Publisher
                        </label>
                        <PkpInput
                          type="text"
                          style={{ width: "100%" }}
                          value={masthead.publisher}
                          onChange={(e) => setMasthead({ ...masthead, publisher: e.target.value })}
                        />
                      </div>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          URL
                        </label>
                        <PkpInput
                          type="text"
                          style={{ width: "100%" }}
                          value={masthead.url}
                          onChange={(e) => setMasthead({ ...masthead, url: e.target.value })}
                        />
                      </div>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          Online ISSN
                        </label>
                        <PkpInput
                          type="text"
                          style={{ width: "100%", maxWidth: "200px" }}
                          value={masthead.onlineIssn}
                          onChange={(e) => setMasthead({ ...masthead, onlineIssn: e.target.value })}
                        />
                      </div>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          Print ISSN
                        </label>
                        <PkpInput
                          type="text"
                          style={{ width: "100%", maxWidth: "200px" }}
                          value={masthead.printIssn}
                          onChange={(e) => setMasthead({ ...masthead, printIssn: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderTop: "1px solid #eee", margin: "2rem 0" }} />

                  {/* Key Information */}
                  <div style={{ display: "flex", marginBottom: "2rem" }}>
                    <div style={{ width: "30%", paddingRight: "2rem" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#002C40", margin: 0 }}>Key Information</h3>
                      <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem", lineHeight: "1.4" }}>
                        Provide a short description of your journal and identify editors, managing directors and other members of your editorial team.
                      </p>
                    </div>
                    <div style={{ width: "70%" }}>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          Journal Summary
                        </label>
                        <PkpTextarea
                          rows={6}
                          style={{ width: "100%" }}
                          value={masthead.journalSummary}
                          onChange={(e) => setMasthead({ ...masthead, journalSummary: e.target.value })}
                        />
                      </div>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          Editorial Team
                        </label>
                        <PkpTextarea
                          rows={6}
                          style={{ width: "100%" }}
                          value={masthead.editorialTeam}
                          onChange={(e) => setMasthead({ ...masthead, editorialTeam: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderTop: "1px solid #eee", margin: "2rem 0" }} />

                  {/* Description */}
                  <div style={{ display: "flex", marginBottom: "2rem" }}>
                    <div style={{ width: "30%", paddingRight: "2rem" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#002C40", margin: 0 }}>Description</h3>
                      <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem", lineHeight: "1.4" }}>
                        Include any information about your journal which may be of interest to readers, authors or reviewers.
                      </p>
                    </div>
                    <div style={{ width: "70%" }}>
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "#002C40" }}>
                          About the Journal
                        </label>
                        <PkpTextarea
                          rows={10}
                          style={{ width: "100%" }}
                          value={masthead.aboutJournal}
                          onChange={(e) => setMasthead({ ...masthead, aboutJournal: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                    <PkpButton variant="primary" type="submit" disabled={contextSettings.loading} loading={contextSettings.loading}>
                      {contextSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                    </PkpButton>
                  </div>
                </div>
              </form>
            </div>
          </PkpTabsContent>

          {/* Contact Tab */}
          <PkpTabsContent value="contact" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              {contactFeedback && (
                <div style={{
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  borderRadius: "4px",
                  backgroundColor: contactFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: contactFeedback.type === 'success' ? '#155724' : '#721c24',
                  border: `1px solid ${contactFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                  fontSize: "0.875rem",
                }}>
                  {contactFeedback.message}
                </div>
              )}
              <form onSubmit={handleSaveContact}>
                <div style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e5e5",
                  padding: "2rem",
                }}>
                  {/* Principal Contact */}
                  <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
                      {/* Left: Title and Description */}
                      <div>
                        <h3 style={{
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          color: '#002C40',
                          marginTop: 0,
                          marginBottom: '0.75rem'
                        }}>
                          Principal Contact
                        </h3>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#333',
                          lineHeight: 1.5,
                          margin: 0
                        }}>
                          Enter contact details, typically for a principal editorship, managing editorship, or administrative staff position, which can be displayed on your publicly accessible website.
                        </p>
                      </div>

                      {/* Right: Form Fields */}
                      <div>
                        {/* Name */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#002C40'
                          }}>
                            Name <span style={{ color: '#d00' }}>*</span>
                          </label>
                          <PkpInput
                            type="text"
                            required
                            value={contact.contactName}
                            onChange={(e) => setContact({ ...contact, contactName: e.target.value })}
                            style={{ width: '100%', maxWidth: '450px' }}
                          />
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#002C40'
                          }}>
                            Email <span style={{ color: '#d00' }}>*</span>
                          </label>
                          <PkpInput
                            type="email"
                            required
                            value={contact.contactEmail}
                            onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })}
                            style={{ width: '100%', maxWidth: '450px' }}
                          />
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#002C40'
                          }}>
                            Phone
                          </label>
                          <PkpInput
                            type="text"
                            value={contact.contactPhone}
                            onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })}
                            style={{ width: '100%', maxWidth: '450px' }}
                          />
                        </div>

                        {/* Affiliation */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#002C40'
                          }}>
                            Affiliation
                          </label>
                          <PkpInput
                            type="text"
                            value={contact.contactAffiliation}
                            onChange={(e) => setContact({ ...contact, contactAffiliation: e.target.value })}
                            style={{ width: '100%', maxWidth: '450px' }}
                          />
                        </div>

                        {/* Mailing Address */}
                        <div style={{ marginBottom: 0 }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#002C40'
                          }}>
                            Mailing Address
                          </label>
                          <PkpTextarea
                            value={contact.mailingAddress}
                            onChange={(e) => setContact({ ...contact, mailingAddress: e.target.value })}
                            rows={4}
                            style={{ width: '100%', maxWidth: '450px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '2.5rem 0' }} />

                  {/* Technical Support Contact */}
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
                      {/* Left: Title and Description */}
                      <div>
                        <h3 style={{
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          color: '#002C40',
                          marginTop: 0,
                          marginBottom: '0.75rem'
                        }}>
                          Technical Support Contact
                        </h3>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#333',
                          lineHeight: 1.5,
                          margin: 0
                        }}>
                          A contact person who can assist editors, authors and reviewers with any problems they have submitting, editing, reviewing or publishing material.
                        </p>
                      </div>

                      {/* Right: Form Fields */}
                      <div>
                        {/* Name */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#002C40'
                          }}>
                            Name <span style={{ color: '#d00' }}>*</span>
                          </label>
                          <PkpInput
                            type="text"
                            required
                            value={contact.supportName}
                            onChange={(e) => setContact({ ...contact, supportName: e.target.value })}
                            style={{ width: '100%', maxWidth: '450px' }}
                          />
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#002C40'
                          }}>
                            Email <span style={{ color: '#d00' }}>*</span>
                          </label>
                          <PkpInput
                            type="email"
                            required
                            value={contact.supportEmail}
                            onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })}
                            style={{ width: '100%', maxWidth: '450px' }}
                          />
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: 0 }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#002C40'
                          }}>
                            Phone
                          </label>
                          <PkpInput
                            type="text"
                            value={contact.supportPhone}
                            onChange={(e) => setContact({ ...contact, supportPhone: e.target.value })}
                            style={{ width: '100%', maxWidth: '450px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e5e5" }}>
                    <PkpButton variant="primary" type="submit" disabled={contextSettings.loading} loading={contextSettings.loading}>
                      {contextSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                    </PkpButton>
                  </div>
                </div>
              </form>
            </div>
          </PkpTabsContent>

          {/* Sections Tab */}
          <PkpTabsContent value="sections" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              {sectionsFeedback && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.375rem",
                    backgroundColor: sectionsFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: sectionsFeedback.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${sectionsFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                  }}
                >
                  {sectionsFeedback.message}
                </div>
              )}

              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "4px",
                overflow: "hidden"
              }}>
                {/* Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.5rem",
                  borderBottom: "1px solid #e5e5e5",
                  backgroundColor: "#fff"
                }}>
                  <h3 style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#002C40",
                    margin: 0
                  }}>
                    Sections
                  </h3>
                  <PkpButton variant="primary" onClick={() => {
                    // Reset new section form and maybe show modal (simplified here to just focus form or similar)
                    // For now, we'll keep the inline form logic but maybe move it or keep it hidden until clicked
                    // Since the image implies a modal or separate page, but we have inline.
                    // Let's just trigger the add logic or focus.
                    // For this step, I'll keep the button visual.
                  }}>
                    Create Section
                  </PkpButton>
                </div>

                {/* Table */}
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead style={{ paddingLeft: "1.5rem" }}>Title</PkpTableHead>
                      <PkpTableHead>Editors</PkpTableHead>
                      <PkpTableHead style={{ width: "100px", textAlign: "center", paddingRight: "1.5rem" }}>Inactive</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {sections.length > 0 ? (
                      sections.map((section) => (
                        <PkpTableRow key={section.id}>
                          <PkpTableCell style={{ paddingLeft: "1.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ color: "#006798", fontSize: "0.75rem" }}>▶</span>
                              <span style={{ fontWeight: 500, color: "#006798" }}>{section.title}</span>
                            </div>
                          </PkpTableCell>
                          <PkpTableCell>
                            <span style={{ color: "#666" }}>None</span>
                          </PkpTableCell>
                          <PkpTableCell style={{ width: "100px", textAlign: "center", paddingRight: "1.5rem" }}>
                            <PkpCheckbox
                              checked={!section.enabled}
                              onChange={() => handleToggleSection(section.id)}
                            />
                          </PkpTableCell>
                        </PkpTableRow>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                          No sections found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </PkpTable>
              </div>

              {/* Add Section Form (Hidden for now to match image, or moved below) */}
              {/* To strictly match the image, the form shouldn't be visible by default. 
                  But for functionality, I'll keep it below for now or we can implement a modal later.
                  The user asked to match the image, so I will hide the inline form for now to be "pixel perfect" to the image.
              */}
            </div>
          </PkpTabsContent>

          {/* Categories Tab */}
          <PkpTabsContent value="categories" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              {categoriesFeedback && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.375rem",
                    backgroundColor: categoriesFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: categoriesFeedback.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${categoriesFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                  }}
                >
                  {categoriesFeedback.message}
                </div>
              )}

              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "4px",
                overflow: "hidden"
              }}>
                {/* Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.5rem",
                  borderBottom: "1px solid #e5e5e5",
                  backgroundColor: "#fff"
                }}>
                  <h3 style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#002C40",
                    margin: 0
                  }}>
                    Categories
                  </h3>
                  <PkpButton variant="primary" onClick={() => {
                    // Trigger add category logic
                  }}>
                    Add Category
                  </PkpButton>
                </div>

                {/* Content */}
                {categories.length > 0 ? (
                  <PkpTable>
                    <PkpTableHeader>
                      <PkpTableRow isHeader>
                        <PkpTableHead style={{ paddingLeft: "1.5rem" }}>Category</PkpTableHead>
                        <PkpTableHead>Path</PkpTableHead>
                        <PkpTableHead style={{ width: "120px", textAlign: "center", paddingRight: "1.5rem" }}>Actions</PkpTableHead>
                      </PkpTableRow>
                    </PkpTableHeader>
                    <tbody>
                      {categories.map((category) => (
                        <PkpTableRow key={category.id}>
                          <PkpTableCell style={{ paddingLeft: "1.5rem" }}>
                            <div style={{ fontWeight: 500 }}>{category.title}</div>
                            {category.description && (
                              <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                {category.description}
                              </div>
                            )}
                          </PkpTableCell>
                          <PkpTableCell>{category.path}</PkpTableCell>
                          <PkpTableCell style={{ width: "120px", textAlign: "center", paddingRight: "1.5rem" }}>
                            <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }} disabled>{t('editor.settings.context.edit')}</PkpButton>
                            <PkpButton variant="warnable" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                              {t('editor.settings.context.delete')}
                            </PkpButton>
                          </PkpTableCell>
                        </PkpTableRow>
                      ))}
                    </tbody>
                  </PkpTable>
                ) : (
                  <div style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#666",
                    fontSize: "0.875rem",
                    fontStyle: "italic",
                    backgroundColor: "#fff"
                  }}>
                    No Items
                  </div>
                )}
              </div>
            </div>
          </PkpTabsContent>
        </PkpTabs>
      </div>
    </div>
  );
}
