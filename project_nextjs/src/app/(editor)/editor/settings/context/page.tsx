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
      if (settings.context_sections) {
        try {
          const sectionsData = typeof settings.context_sections === 'string' ? JSON.parse(settings.context_sections) : settings.context_sections;
          if (Array.isArray(sectionsData)) {
            setSections(sectionsData);
          }
        } catch {
          // ignore malformed data
        }
      }
      if (settings.context_categories) {
        try {
          const categoriesData = typeof settings.context_categories === 'string' ? JSON.parse(settings.context_categories) : settings.context_categories;
          if (Array.isArray(categoriesData)) {
            setCategories(categoriesData);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [contextSettings.settings]);

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

  const generateId = () =>
    (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10));

  const persistSections = async (next: SectionItem[], successMessage: string) => {
    setSectionsSaving(true);
    const success = await contextSettings.saveSettings({
      context_sections: next,
    });
    setSectionsSaving(false);
    if (success) {
      setSections(next);
      setSectionsFeedback({ type: 'success', message: successMessage });
    } else {
      setSectionsFeedback({ type: 'error', message: contextSettings.error || 'Failed to save sections.' });
    }
  };

  const persistCategories = async (next: CategoryItem[], successMessage: string) => {
    setCategoriesSaving(true);
    const success = await contextSettings.saveSettings({
      context_categories: next,
    });
    setCategoriesSaving(false);
    if (success) {
      setCategories(next);
      setCategoriesFeedback({ type: 'success', message: successMessage });
    } else {
      setCategoriesFeedback({ type: 'error', message: contextSettings.error || 'Failed to save categories.' });
    }
  };

  const handleAddSection = async () => {
    if (!newSection.title.trim()) {
      setSectionsFeedback({ type: 'error', message: 'Section title is required.' });
      return;
    }
    const next: SectionItem[] = [
      ...sections,
      {
        id: generateId(),
        title: newSection.title.trim(),
        abbreviation: newSection.abbreviation.trim() || newSection.title.trim().slice(0, 3).toUpperCase(),
        enabled: newSection.enabled,
        policy: newSection.policy?.trim(),
      },
    ];
    await persistSections(next, 'Section saved successfully.');
    setNewSection({
      title: '',
      abbreviation: '',
      enabled: true,
      policy: '',
    });
  };

  const handleDeleteSection = async (id: string) => {
    const next = sections.filter((section) => section.id !== id);
    await persistSections(next, 'Section removed.');
  };

  const handleToggleSection = async (id: string) => {
    const next = sections.map((section) =>
      section.id === id ? { ...section, enabled: !section.enabled } : section
    );
    await persistSections(next, 'Section updated.');
  };

  const handleAddCategory = async () => {
    if (!newCategory.title.trim() || !newCategory.path.trim()) {
      setCategoriesFeedback({ type: 'error', message: 'Category title and path are required.' });
      return;
    }
    const next: CategoryItem[] = [
      ...categories,
      {
        id: generateId(),
        title: newCategory.title.trim(),
        path: newCategory.path.trim(),
        description: newCategory.description?.trim(),
      },
    ];
    await persistCategories(next, 'Category saved successfully.');
    setNewCategory({
      title: '',
      path: '',
      description: '',
    });
  };

  const handleDeleteCategory = async (id: string) => {
    const next = categories.filter((category) => category.id !== id);
    await persistCategories(next, 'Category removed.');
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

