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
    journalDescription: '',
    masthead: '',
  });

  // Contact form state
  const [contact, setContact] = useState({
    contactEmail: '',
    contactName: '',
    mailingAddress: '',
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

  // Load saved data from database
  useEffect(() => {
    if (contextSettings.settings && Object.keys(contextSettings.settings).length > 0) {
      const settings = contextSettings.settings as any;
      if (settings.masthead) {
        try {
          const mastheadData = typeof settings.masthead === 'string' ? JSON.parse(settings.masthead) : settings.masthead;
          setMasthead({
            journalTitle: mastheadData.journalTitle || '',
            journalDescription: mastheadData.journalDescription || '',
            masthead: mastheadData.masthead || '',
          });
        } catch {
          // If parsing fails, use as is
        }
      }
      if (settings.contact_contactEmail || settings.contact_contactName) {
        setContact({
          contactEmail: settings.contact_contactEmail || '',
          contactName: settings.contact_contactName || '',
          mailingAddress: settings.contact_mailingAddress || '',
        });
      }
    }
  }, [contextSettings.settings]);

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
      contact_contactEmail: contact.contactEmail,
      contact_contactName: contact.contactName,
      contact_mailingAddress: contact.mailingAddress,
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
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0",
      }}>
        <div style={{
          padding: "0 1.5rem",
        }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}>
            {t('editor.settings.settingsTitle')} • {t('editor.settings.context.title')}
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Configure basic details about the journal, including title, description, masthead, contact information, and sections.
          </p>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area and centered card */}
      <div style={{
        padding: "1.5rem",
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
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="masthead">{t('editor.settings.context.masthead')}</PkpTabsTrigger>
              <PkpTabsTrigger value="contact">{t('editor.settings.context.contact')}</PkpTabsTrigger>
              <PkpTabsTrigger value="sections">{t('editor.settings.context.sections')}</PkpTabsTrigger>
              <PkpTabsTrigger value="categories">{t('editor.settings.context.categories')}</PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* Masthead Tab */}
          <PkpTabsContent value="masthead" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                {t('editor.settings.context.masthead')}
              </h2>
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
                  padding: "1.5rem",
                }}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#002C40",
                    }}>
                      {t('editor.settings.context.journalTitle')} <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <PkpInput
                      type="text"
                      placeholder="Enter journal title"
                      style={{ width: "100%" }}
                      value={masthead.journalTitle}
                      onChange={(e) => setMasthead({ ...masthead, journalTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#002C40",
                    }}>
                      {t('editor.settings.context.journalDescription')}
                    </label>
                    <PkpTextarea
                      rows={5}
                      placeholder="Enter journal description"
                      style={{ width: "100%" }}
                      value={masthead.journalDescription}
                      onChange={(e) => setMasthead({ ...masthead, journalDescription: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#002C40",
                    }}>
                      {t('editor.settings.context.masthead')}
                    </label>
                    <PkpTextarea
                      rows={10}
                      placeholder="Enter masthead information (editorial team, board members, etc.)"
                      style={{ width: "100%" }}
                      value={masthead.masthead}
                      onChange={(e) => setMasthead({ ...masthead, masthead: e.target.value })}
                    />
                  </div>
                  <PkpButton variant="primary" type="submit" disabled={contextSettings.loading} loading={contextSettings.loading}>
                    {contextSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                  </PkpButton>
                </div>
              </form>
            </div>
          </PkpTabsContent>

          {/* Contact Tab */}
          <PkpTabsContent value="contact" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                {t('editor.settings.context.contact')}
              </h2>
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
                  padding: "1.5rem",
                }}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#002C40",
                    }}>
                      {t('editor.settings.context.contactEmail')} <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <PkpInput
                      type="email"
                      placeholder="contact@journal.example"
                      style={{ width: "100%" }}
                      value={contact.contactEmail}
                      onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#002C40",
                    }}>
                      {t('editor.settings.context.contactName')}
                    </label>
                    <PkpInput
                      type="text"
                      placeholder="Enter contact name"
                      style={{ width: "100%" }}
                      value={contact.contactName}
                      onChange={(e) => setContact({ ...contact, contactName: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#002C40",
                    }}>
                      Mailing Address
                    </label>
                    <PkpTextarea
                      rows={5}
                      placeholder="Enter mailing address"
                      style={{ width: "100%" }}
                      value={contact.mailingAddress}
                      onChange={(e) => setContact({ ...contact, mailingAddress: e.target.value })}
                    />
                  </div>
                  <PkpButton variant="primary" type="submit" disabled={contextSettings.loading} loading={contextSettings.loading}>
                    {contextSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                  </PkpButton>
                </div>
              </form>
            </div>
          </PkpTabsContent>

          {/* Sections Tab */}
          <PkpTabsContent value="sections" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                {t('editor.settings.context.sections')}
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginBottom: "1rem",
              }}>
                Sections allow you to publish submissions in different sections of the journal, such as Articles, Reviews, etc.
              </p>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ marginBottom: "1.5rem" }}>
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
                  <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
                    <PkpInput
                      placeholder="Section title"
                      value={newSection.title}
                      onChange={(e) => setNewSection((prev) => ({ ...prev, title: e.target.value }))}
                    />
                    <PkpInput
                      placeholder="Abbreviation"
                      value={newSection.abbreviation}
                      onChange={(e) => setNewSection((prev) => ({ ...prev, abbreviation: e.target.value }))}
                    />
                    <PkpTextarea
                      rows={3}
                      placeholder="Policy / description"
                      value={newSection.policy}
                      onChange={(e) => setNewSection((prev) => ({ ...prev, policy: e.target.value }))}
                    />
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <PkpCheckbox
                        checked={newSection.enabled}
                        onChange={(e) =>
                          setNewSection((prev) => ({ ...prev, enabled: e.target.checked }))
                        }
                      />
                      <span>Enabled</span>
                    </label>
                    <div>
                      <PkpButton variant="primary" onClick={handleAddSection} loading={sectionsSaving}>
                        {t('editor.settings.context.addSection')}
                      </PkpButton>
                    </div>
                  </div>
                </div>
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                      <PkpTableHead>Section</PkpTableHead>
                      <PkpTableHead style={{ width: "120px" }}>Abbreviation</PkpTableHead>
                      <PkpTableHead style={{ width: "80px", textAlign: "center" }}>Enabled</PkpTableHead>
                      <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {sections.length > 0 ? (
                      sections.map((section) => (
                        <PkpTableRow key={section.id}>
                          <PkpTableCell style={{ width: "60px" }}>{section.id}</PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontWeight: 500 }}>{section.title}</div>
                            {section.policy && (
                              <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                {section.policy}
                              </div>
                            )}
                          </PkpTableCell>
                          <PkpTableCell style={{ width: "120px" }}>{section.abbreviation}</PkpTableCell>
                          <PkpTableCell style={{ width: "80px", textAlign: "center" }}>
                            <PkpCheckbox
                              checked={section.enabled}
                              onChange={() => handleToggleSection(section.id)}
                            />
                          </PkpTableCell>
                          <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                            <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }} disabled>
                              {t('editor.settings.context.edit')}
                            </PkpButton>
                            <PkpButton variant="warnable" size="sm" onClick={() => handleDeleteSection(section.id)}>
                              {t('editor.settings.context.delete')}
                            </PkpButton>
                          </PkpTableCell>
                        </PkpTableRow>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                          No sections found. Use the form above to add a new section.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </PkpTable>
              </div>
            </div>
          </PkpTabsContent>

          {/* Categories Tab */}
          <PkpTabsContent value="categories" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Categories
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginBottom: "1rem",
              }}>
                Categories can be used to organize and filter content across the journal.
              </p>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ marginBottom: "1.5rem" }}>
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
                  <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
                    <PkpInput
                      placeholder="Category title"
                      value={newCategory.title}
                      onChange={(e) => setNewCategory((prev) => ({ ...prev, title: e.target.value }))}
                    />
                    <PkpInput
                      placeholder="Path (e.g. computer-science)"
                      value={newCategory.path}
                      onChange={(e) => setNewCategory((prev) => ({ ...prev, path: e.target.value }))}
                    />
                    <PkpTextarea
                      rows={3}
                      placeholder="Description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <div>
                      <PkpButton variant="primary" onClick={handleAddCategory} loading={categoriesSaving}>
                        {t('editor.settings.context.addCategory')}
                      </PkpButton>
                    </div>
                  </div>
                </div>
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                      <PkpTableHead>Category</PkpTableHead>
                      <PkpTableHead>Path</PkpTableHead>
                      <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <PkpTableRow key={category.id}>
                          <PkpTableCell style={{ width: "60px" }}>{category.id}</PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontWeight: 500 }}>{category.title}</div>
                            {category.description && (
                              <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                {category.description}
                              </div>
                            )}
                          </PkpTableCell>
                          <PkpTableCell>{category.path}</PkpTableCell>
                          <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                            <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }} disabled>{t('editor.settings.context.edit')}</PkpButton>
                            <PkpButton variant="warnable" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                              {t('editor.settings.context.delete')}
                            </PkpButton>
                          </PkpTableCell>
                        </PkpTableRow>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                          No categories found. Use the form above to add a category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </PkpTable>
              </div>
            </div>
          </PkpTabsContent>
        </PkpTabs>
      </div>
    </div>
  );
}

