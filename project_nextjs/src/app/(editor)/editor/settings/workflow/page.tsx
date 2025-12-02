"use client";

import { useState, useEffect } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpRadio } from "@/components/ui/pkp-radio";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Image as ImageIcon, Code, ChevronRight, ChevronDown, Quote, Superscript, Subscript, HelpCircle, Upload } from "lucide-react";
import {
  DUMMY_METADATA_FIELDS,
  DUMMY_COMPONENTS,
  DUMMY_CHECKLIST,
  DUMMY_EMAIL_TEMPLATES,
} from "@/features/editor/settings-dummy-data";
import { USE_DUMMY } from "@/lib/dummy";
import { useJournalSettings, useMigrateLocalStorageToDatabase } from "@/features/editor/hooks/useJournalSettings";
import { useI18n } from "@/contexts/I18nContext";
import { LibraryFilesPanel } from "@/features/editor/components/library-files/library-files-panel";
import { ReviewFormsPanel } from "@/features/editor/components/review-forms/review-forms-panel";

type ReviewSetupSettings = {
  review_defaultReviewMode?: string;
  review_restrictReviewerFileAccess?: boolean;
  review_reviewerAccessKeysEnabled?: boolean;
  review_numWeeksPerResponse?: string;
  review_numWeeksPerReview?: string;
  review_numDaysBeforeInviteReminder?: string;
  review_numDaysBeforeSubmitReminder?: string;
};

type ReviewerGuidanceSettings = {
  reviewerGuidance_reviewGuidelines?: string;
  reviewerGuidance_competingInterests?: string;
  reviewerGuidance_showEnsuringLink?: boolean;
};

type AuthorGuidelinesSettings = {
  authorGuidelines?: string;
};

type EmailSetupSettings = {
  emailSetup_emailSignature?: string;
  emailSetup_envelopeSender?: string;
};

export default function SettingsWorkflowPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("submission");
  const [activeSubTab, setActiveSubTab] = useState("disableSubmissions");
  const [activeReviewSubTab, setActiveReviewSubTab] = useState("reviewSetup");
  const [activeEmailSubTab, setActiveEmailSubTab] = useState("emailsSetup");

  // Database integration - Load settings from database
  const reviewSetupSettings = useJournalSettings({
    section: "workflow",
    autoLoad: true,
  });

  const reviewerGuidanceSettings = useJournalSettings({
    section: "workflow",
    autoLoad: true,
  });

  const authorGuidelinesSettings = useJournalSettings({
    section: "workflow",
    autoLoad: true,
  });

  const emailSetupSettings = useJournalSettings({
    section: "workflow",
    autoLoad: true,
  });

  // Migrate localStorage to database (one-time)
  const migrateReviewSetup = useMigrateLocalStorageToDatabase(
    "workflow",
    [
      "reviewSetup_defaultReviewMode",
      "reviewSetup_restrictReviewerFileAccess",
      "reviewSetup_reviewerAccessKeysEnabled",
      "reviewSetup_numWeeksPerResponse",
      "reviewSetup_numWeeksPerReview",
      "reviewSetup_numDaysBeforeInviteReminder",
      "reviewSetup_numDaysBeforeSubmitReminder",
    ]
  );

  const migrateReviewerGuidance = useMigrateLocalStorageToDatabase(
    "workflow",
    [
      "reviewerGuidance_reviewGuidelines",
      "reviewerGuidance_competingInterests",
      "reviewerGuidance_showEnsuringLink",
    ]
  );

  const migrateAuthorGuidelines = useMigrateLocalStorageToDatabase(
    "workflow",
    ["authorGuidelines"]
  );

  const migrateEmailSetup = useMigrateLocalStorageToDatabase(
    "workflow",
    ["emailSetup_emailSignature", "emailSetup_envelopeSender"]
  );

  // Run migration on mount
  useEffect(() => {
    migrateReviewSetup.migrate();
    migrateReviewerGuidance.migrate();
    migrateAuthorGuidelines.migrate();
    migrateEmailSetup.migrate();
  }, []);

  // Form states - Review Setup (with defaults from database)
  const [reviewSetup, setReviewSetup] = useState({
    defaultReviewMode: "doubleAnonymous",
    restrictReviewerFileAccess: false,
    reviewerAccessKeysEnabled: false,
    numWeeksPerResponse: "2",
    numWeeksPerReview: "4",
    numDaysBeforeInviteReminder: "3",
    numDaysBeforeSubmitReminder: "7",
  });

  // Form states - Reviewer Guidance
  const [reviewerGuidance, setReviewerGuidance] = useState({
    reviewGuidelines: "",
    competingInterests: "",
    showEnsuringLink: false,
  });

  // Form states - Author Guidelines
  const [authorGuidelines, setAuthorGuidelines] = useState("");
  const [copyrightNotice, setCopyrightNotice] = useState("");

  // Form states - Email Setup
  const [emailSetup, setEmailSetup] = useState({
    emailSignature: "",
    envelopeSender: "",
  });

  // UI States
  const [expandedComponent, setExpandedComponent] = useState<number | null>(null);
  const [expandedChecklistItem, setExpandedChecklistItem] = useState<number | null>(null);

  // Metadata State
  const [metadataSettings, setMetadataSettings] = useState({
    coverage: false,
    languages: false,
    rights: false,
    source: false,
    subjects: false,
    type: false,
    disciplines: false,
    keywords: true,
    keywordsOption: "suggest", // "none", "suggest", "require"
    supportingAgencies: false,
    competingInterests: false,
    references: false,
    publisherId: {
      publications: false,
      galleys: false,
      issues: false,
      issueGalleys: false
    }
  });

  // Sync form states with database settings when loaded
  useEffect(() => {
    const settings = reviewSetupSettings.settings as ReviewSetupSettings | undefined;
    if (!settings) {
      return;
    }
    setReviewSetup((prev) => ({
      defaultReviewMode: settings.review_defaultReviewMode ?? prev.defaultReviewMode,
      restrictReviewerFileAccess: settings.review_restrictReviewerFileAccess ?? prev.restrictReviewerFileAccess,
      reviewerAccessKeysEnabled: settings.review_reviewerAccessKeysEnabled ?? prev.reviewerAccessKeysEnabled,
      numWeeksPerResponse: settings.review_numWeeksPerResponse ?? prev.numWeeksPerResponse,
      numWeeksPerReview: settings.review_numWeeksPerReview ?? prev.numWeeksPerReview,
      numDaysBeforeInviteReminder: settings.review_numDaysBeforeInviteReminder ?? prev.numDaysBeforeInviteReminder,
      numDaysBeforeSubmitReminder: settings.review_numDaysBeforeSubmitReminder ?? prev.numDaysBeforeSubmitReminder,
    }));
  }, [reviewSetupSettings.settings]);

  useEffect(() => {
    const settings = reviewerGuidanceSettings.settings as ReviewerGuidanceSettings | undefined;
    if (!settings) {
      return;
    }
    setReviewerGuidance((prev) => ({
      reviewGuidelines: settings.reviewerGuidance_reviewGuidelines ?? prev.reviewGuidelines,
      competingInterests: settings.reviewerGuidance_competingInterests ?? prev.competingInterests,
      showEnsuringLink: settings.reviewerGuidance_showEnsuringLink ?? prev.showEnsuringLink,
    }));
  }, [reviewerGuidanceSettings.settings]);

  useEffect(() => {
    const settings = authorGuidelinesSettings.settings as AuthorGuidelinesSettings | undefined;
    if (!settings) {
      return;
    }
    const nextValue = settings.authorGuidelines ?? "";
    setAuthorGuidelines((prev) => (prev === nextValue ? prev : nextValue));
  }, [authorGuidelinesSettings.settings]);

  useEffect(() => {
    const settings = emailSetupSettings.settings as EmailSetupSettings | undefined;
    if (!settings) {
      return;
    }
    setEmailSetup((prev) => ({
      emailSignature: settings.emailSetup_emailSignature ?? prev.emailSignature,
      envelopeSender: settings.emailSetup_envelopeSender ?? prev.envelopeSender,
    }));
  }, [emailSetupSettings.settings]);

  // Feedback states
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Save handlers
  const handleSaveReviewSetup = async () => {
    // Validate
    if (!reviewSetup.numWeeksPerResponse || parseInt(reviewSetup.numWeeksPerResponse) < 1) {
      setFeedback({ type: "error", message: "Review response time must be at least 1 week." });
      return;
    }
    if (!reviewSetup.numWeeksPerReview || parseInt(reviewSetup.numWeeksPerReview) < 1) {
      setFeedback({ type: "error", message: "Review completion time must be at least 1 week." });
      return;
    }

    setFeedback({ type: null, message: "" });

    // Save to database
    const success = await reviewSetupSettings.saveSettings({
      review_defaultReviewMode: reviewSetup.defaultReviewMode,
      review_restrictReviewerFileAccess: reviewSetup.restrictReviewerFileAccess,
      review_reviewerAccessKeysEnabled: reviewSetup.reviewerAccessKeysEnabled,
      review_numWeeksPerResponse: reviewSetup.numWeeksPerResponse,
      review_numWeeksPerReview: reviewSetup.numWeeksPerReview,
      review_numDaysBeforeInviteReminder: reviewSetup.numDaysBeforeInviteReminder,
      review_numDaysBeforeSubmitReminder: reviewSetup.numDaysBeforeSubmitReminder,
    });

    if (success) {
      setFeedback({ type: "success", message: "Review setup settings saved successfully." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } else {
      setFeedback({
        type: "error",
        message: reviewSetupSettings.error || "Failed to save review setup settings.",
      });
    }
  };

  const handleSaveReviewerGuidance = async () => {
    setFeedback({ type: null, message: "" });

    // Save to database
    const success = await reviewerGuidanceSettings.saveSettings({
      reviewerGuidance_reviewGuidelines: reviewerGuidance.reviewGuidelines,
      reviewerGuidance_competingInterests: reviewerGuidance.competingInterests,
      reviewerGuidance_showEnsuringLink: reviewerGuidance.showEnsuringLink,
    });

    if (success) {
      setFeedback({ type: "success", message: "Reviewer guidance settings saved successfully." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } else {
      setFeedback({
        type: "error",
        message: reviewerGuidanceSettings.error || "Failed to save reviewer guidance settings.",
      });
    }
  };

  const handleSaveAuthorGuidelines = async () => {
    setFeedback({ type: null, message: "" });

    // Save to database
    const success = await authorGuidelinesSettings.saveSettings({
      authorGuidelines: authorGuidelines,
    });

    if (success) {
      setFeedback({ type: "success", message: "Author guidelines saved successfully." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } else {
      setFeedback({
        type: "error",
        message: authorGuidelinesSettings.error || "Failed to save author guidelines.",
      });
    }
  };

  const handleSaveCopyrightNotice = async () => {
    // Mock save for Copyright Notice
    setFeedback({ type: "success", message: "Copyright notice saved successfully." });
    setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
  };

  const handleSaveEmailSetup = async () => {
    // Validate email if provided
    if (emailSetup.envelopeSender && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSetup.envelopeSender)) {
      setFeedback({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setFeedback({ type: null, message: "" });

    // Save to database
    const success = await emailSetupSettings.saveSettings({
      emailSetup_emailSignature: emailSetup.emailSignature,
      emailSetup_envelopeSender: emailSetup.envelopeSender,
    });

    if (success) {
      setFeedback({ type: "success", message: "Email setup settings saved successfully." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } else {
      setFeedback({
        type: "error",
        message: emailSetupSettings.error || "Failed to save email setup settings.",
      });
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
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
          {t('editor.settings.settingsTitle')} • {t('editor.settings.workflow.title')}
        </h1>
        <p style={{
          fontSize: "0.875rem",
          color: "rgba(0, 0, 0, 0.54)",
          marginBottom: "1.5rem",
        }}>
          Configure all aspects of the editorial workflow, including file management, submission guidelines, peer review, and email notifications.
        </p>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "0 1.5rem",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
        <PkpTabs defaultValue="submission" value={activeTab} onValueChange={setActiveTab}>
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
              <PkpTabsTrigger value="submission">{t('editor.settings.workflow.submission')}</PkpTabsTrigger>
              <PkpTabsTrigger value="review">{t('editor.settings.workflow.review')}</PkpTabsTrigger>
              <PkpTabsTrigger value="library">Publisher Library</PkpTabsTrigger>
              <PkpTabsTrigger value="emails">{t('editor.settings.workflow.emails')}</PkpTabsTrigger>
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

          {/* Submission Tab */}
          <PkpTabsContent value="submission" style={{ padding: "0", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", gap: 0, minHeight: "500px" }}>
              {/* Side Tabs */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <button
                  onClick={() => setActiveSubTab("disableSubmissions")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "disableSubmissions" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "disableSubmissions" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "disableSubmissions" ? 600 : 400,
                  }}
                >
                  Disable Submissions
                </button>
                <button
                  onClick={() => setActiveSubTab("metadata")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "metadata" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "metadata" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "metadata" ? 600 : 400,
                  }}
                >
                  Metadata
                </button>
                <button
                  onClick={() => setActiveSubTab("components")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "components" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "components" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "components" ? 600 : 400,
                  }}
                >
                  Components
                </button>
                <button
                  onClick={() => setActiveSubTab("submissionChecklist")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "submissionChecklist" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "submissionChecklist" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "submissionChecklist" ? 600 : 400,
                  }}
                >
                  Submission Checklist
                </button>
                <button
                  onClick={() => setActiveSubTab("authorGuidelines")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "authorGuidelines" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "authorGuidelines" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "authorGuidelines" ? 600 : 400,
                  }}
                >
                  Author Guidelines
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {/* Disable Submissions */}
                {activeSubTab === "disableSubmissions" && (
                  <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "#002C40",
                      }}>
                        Disable Submissions
                      </h2>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#002C40", fontWeight: 600 }}>
                          <PkpCheckbox id="disableSubmissions" />
                          <span>Disable submissions to this journal</span>
                        </label>
                        <p style={{
                          fontSize: "0.875rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.75rem",
                          marginBottom: 0,
                        }}>
                          When enabled, authors will not be able to submit new manuscripts to this journal. Existing submissions will continue through the editorial workflow.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {activeSubTab === "metadata" && (
                  <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        {/* Coverage */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Coverage</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Coverage will typically indicate a work's spatial location (a place name or geographic coordinates), temporal period (a period label, date, or date range) or jurisdiction (such as a named administrative entity).
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.coverage}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, coverage: e.target.checked })}
                            />
                            Enable coverage metadata
                          </label>
                        </div>

                        {/* Languages */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Languages</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Language indicates the work's primary language using a language code ("en") with an optional country code ("en_US").
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.languages}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, languages: e.target.checked })}
                            />
                            Enable language metadata
                          </label>
                        </div>

                        {/* Rights */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Rights</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Any rights held over the submission, which may include Intellectual Property Rights (IPR), Copyright, and various Property Rights.
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.rights}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, rights: e.target.checked })}
                            />
                            Enable rights metadata
                          </label>
                        </div>

                        {/* Source */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Source</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            The source may be an ID, such as a DOI, of another work or resource from which the submission is derived.
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.source}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, source: e.target.checked })}
                            />
                            Enable source metadata
                          </label>
                        </div>

                        {/* Subjects */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Subjects</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Subjects will be keywords, key phrases or classification codes that describe a topic of the submission.
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.subjects}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, subjects: e.target.checked })}
                            />
                            Enable subject metadata
                          </label>
                        </div>

                        {/* Type */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Type</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            The nature or genre of the main content of the submission. The type is usually "Text", but may also be "Dataset", "Image" or any of the <a href="#" style={{ color: "#006798", textDecoration: "underline" }}>Dublin Core types</a>.
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.type}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, type: e.target.checked })}
                            />
                            Enable type metadata
                          </label>
                        </div>

                        {/* Disciplines */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Disciplines</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Disciplines are types of study or branches of knowledge as described by university faculties and learned societies.
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.disciplines}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, disciplines: e.target.checked })}
                            />
                            Enable disciplines metadata
                          </label>
                        </div>

                        {/* Keywords */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Keywords</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Keywords are typically one- to three-word phrases that are used to indicate the main topics of a submission.
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            <PkpCheckbox
                              checked={metadataSettings.keywords}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, keywords: e.target.checked })}
                            />
                            Enable keyword metadata
                          </label>

                          {metadataSettings.keywords && (
                            <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                                <input
                                  type="radio"
                                  name="keywordsOption"
                                  checked={metadataSettings.keywordsOption === "none"}
                                  onChange={() => setMetadataSettings({ ...metadataSettings, keywordsOption: "none" })}
                                  className="accent-[#006798]"
                                />
                                Do not request keywords from the author during submission.
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                                <input
                                  type="radio"
                                  name="keywordsOption"
                                  checked={metadataSettings.keywordsOption === "suggest"}
                                  onChange={() => setMetadataSettings({ ...metadataSettings, keywordsOption: "suggest" })}
                                  className="accent-[#006798]"
                                />
                                Ask the author to suggest keywords during submission.
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                                <input
                                  type="radio"
                                  name="keywordsOption"
                                  checked={metadataSettings.keywordsOption === "require"}
                                  onChange={() => setMetadataSettings({ ...metadataSettings, keywordsOption: "require" })}
                                  className="accent-[#006798]"
                                />
                                Require the author to suggest keywords before accepting their submission.
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Supporting Agencies */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Supporting Agencies</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Supporting agencies may indicate the source of research funding or other institutional support that facilitated the research.
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.supportingAgencies}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, supportingAgencies: e.target.checked })}
                            />
                            Enable supporting agencies metadata
                          </label>
                        </div>

                        {/* Competing Interests */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Competing Interests</h3>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.competingInterests}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, competingInterests: e.target.checked })}
                            />
                            Require submitting Authors to file a Competing Interest (CI) statement with their submission.
                          </label>
                        </div>

                        {/* References */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>References</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Collect a submission's references in a separate field. This may be required to comply with citation-tracking services such as Crossref.
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              checked={metadataSettings.references}
                              onChange={(e) => setMetadataSettings({ ...metadataSettings, references: e.target.checked })}
                            />
                            Enable references metadata
                          </label>
                        </div>

                        {/* Publisher ID */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Publisher ID</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            The publisher ID may be used to record the ID from an external database. For example, items exported for deposit to PubMed may include the publisher ID. This should not be used for DOIs.
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                              <PkpCheckbox
                                checked={metadataSettings.publisherId.publications}
                                onChange={(e) => setMetadataSettings({ ...metadataSettings, publisherId: { ...metadataSettings.publisherId, publications: e.target.checked } })}
                              />
                              Enable for Publications
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                              <PkpCheckbox
                                checked={metadataSettings.publisherId.galleys}
                                onChange={(e) => setMetadataSettings({ ...metadataSettings, publisherId: { ...metadataSettings.publisherId, galleys: e.target.checked } })}
                              />
                              Enable for Galleys
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                              <PkpCheckbox
                                checked={metadataSettings.publisherId.issues}
                                onChange={(e) => setMetadataSettings({ ...metadataSettings, publisherId: { ...metadataSettings.publisherId, issues: e.target.checked } })}
                              />
                              Enable for Issues
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                              <PkpCheckbox
                                checked={metadataSettings.publisherId.issueGalleys}
                                onChange={(e) => setMetadataSettings({ ...metadataSettings, publisherId: { ...metadataSettings.publisherId, issueGalleys: e.target.checked } })}
                              />
                              Enable for Issue Galleys
                            </label>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e5e5", paddingTop: "1rem" }}>
                          <PkpButton
                            variant="primary"
                            onClick={() => {
                              // Handle save
                              setFeedback({ type: "success", message: "Metadata settings saved successfully." });
                              setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
                            }}
                          >
                            Save
                          </PkpButton>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Components */}
                {activeSubTab === "components" && (
                  <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <h2 style={{
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            color: "#002C40",
                            margin: 0,
                          }}>
                            Article Components
                          </h2>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <PkpButton variant="onclick" style={{ fontSize: "0.875rem" }}>Order</PkpButton>
                            <PkpButton variant="onclick" style={{ fontSize: "0.875rem" }}>Add a Component</PkpButton>
                            <PkpButton variant="onclick" style={{ fontSize: "0.875rem" }}>Restore Defaults</PkpButton>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e5e5e5", borderRadius: "4px" }}>
                          {[
                            "Article Text", "Research Instrument", "Research Materials", "Research Results",
                            "Transcripts", "Data Analysis", "Data Set", "Source Texts", "Multimedia",
                            "Image", "HTML Stylesheet", "Other"
                          ].map((item, index) => (
                            <div key={index} style={{
                              borderBottom: index < 11 ? "1px solid #e5e5e5" : "none",
                              backgroundColor: expandedComponent === index ? "#f8f9fa" : "#ffffff",
                            }}>
                              <div
                                onClick={() => setExpandedComponent(expandedComponent === index ? null : index)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0.75rem 1rem",
                                  cursor: "pointer"
                                }}
                              >
                                {expandedComponent === index ? (
                                  <ChevronDown size={16} color="#006798" style={{ marginRight: "0.5rem" }} />
                                ) : (
                                  <ChevronRight size={16} color="#006798" style={{ marginRight: "0.5rem" }} />
                                )}
                                <span style={{ fontSize: "0.875rem", color: expandedComponent === index ? "#002C40" : "#006798", fontWeight: expandedComponent === index ? 600 : 400 }}>{item}</span>
                              </div>

                              {expandedComponent === index && (
                                <div style={{ padding: "0 1rem 1rem 2.5rem" }}>
                                  <div style={{ display: "flex", gap: "1rem" }}>
                                    <button style={{ color: "#006798", fontSize: "0.875rem", fontWeight: "bold", border: "none", background: "none", cursor: "pointer" }}>Edit</button>
                                    <button style={{ color: "#d00a6c", fontSize: "0.875rem", fontWeight: "bold", border: "none", background: "none", cursor: "pointer" }}>Delete</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submission Checklist */}
                {activeSubTab === "submissionChecklist" && (
                  <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <h2 style={{
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            color: "#002C40",
                            margin: 0,
                          }}>
                            Submission Preparation Checklist
                          </h2>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <PkpButton variant="onclick" style={{ fontSize: "0.875rem" }}>Order</PkpButton>
                            <PkpButton variant="onclick" style={{ fontSize: "0.875rem" }}>Add Item</PkpButton>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e5e5e5", borderRadius: "4px" }}>
                          {[
                            "The submission has not been previously published, nor is it before another journal for consideration (or an explanation has been provided in Comments to the Editor).",
                            "The submission file is in OpenOffice, Microsoft Word, or RTF document file format.",
                            "Where available, URLs for the references have been provided.",
                            "The text is single-spaced; uses a 12-point font; employs italics, rather than underlining (except with URL addresses); and all illustrations, figures, and tables are placed within the text at the appropriate points,...",
                            "The text adheres to the stylistic and bibliographic requirements outlined in the Author Guidelines."
                          ].map((item, index) => (
                            <div key={index} style={{
                              borderBottom: index < 4 ? "1px solid #e5e5e5" : "none",
                              backgroundColor: expandedChecklistItem === index ? "#f8f9fa" : "#ffffff",
                            }}>
                              <div
                                onClick={() => setExpandedChecklistItem(expandedChecklistItem === index ? null : index)}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  padding: "0.75rem 1rem",
                                  cursor: "pointer"
                                }}
                              >
                                {expandedChecklistItem === index ? (
                                  <ChevronDown size={16} color="#006798" style={{ marginRight: "0.5rem", marginTop: "0.25rem", flexShrink: 0 }} />
                                ) : (
                                  <ChevronRight size={16} color="#006798" style={{ marginRight: "0.5rem", marginTop: "0.25rem", flexShrink: 0 }} />
                                )}
                                <span style={{ fontSize: "0.875rem", color: "#333", lineHeight: "1.5" }}>{item}</span>
                              </div>

                              {expandedChecklistItem === index && (
                                <div style={{ padding: "0 1rem 1rem 2.5rem" }}>
                                  <div style={{ display: "flex", gap: "1rem" }}>
                                    <button style={{ color: "#006798", fontSize: "0.875rem", fontWeight: "bold", border: "none", background: "none", cursor: "pointer" }}>Edit</button>
                                    <button style={{ color: "#d00a6c", fontSize: "0.875rem", fontWeight: "bold", border: "none", background: "none", cursor: "pointer" }}>Delete</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Author Guidelines */}
                {activeSubTab === "authorGuidelines" && (
                  <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        {/* Feedback Message */}
                        {feedback.type && (
                          <div style={{
                            padding: "0.75rem 1rem",
                            marginBottom: "1.5rem",
                            borderRadius: "4px",
                            backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
                            color: feedback.type === "success" ? "#155724" : "#721c24",
                            border: `1px solid ${feedback.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                            fontSize: "0.875rem",
                          }}>
                            {feedback.message}
                          </div>
                        )}

                        {/* Author Guidelines Section */}
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#002C40",
                            marginBottom: "0.5rem",
                          }}>
                            Author Guidelines
                          </h3>
                          <p style={{
                            fontSize: "0.875rem",
                            color: "#333",
                            marginBottom: "0.5rem",
                            lineHeight: "1.5",
                          }}>
                            Recommended guidelines include bibliographic and formatting standards alongside examples of common citation formats to be used in submissions.
                          </p>
                          <div style={{ border: "1px solid #ccc", borderBottom: "none", padding: "0.5rem", display: "flex", gap: "0.75rem", backgroundColor: "#fff", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
                            <Bold size={16} color="#555" /><Italic size={16} color="#555" /><Superscript size={16} color="#555" /><Subscript size={16} color="#555" /><LinkIcon size={16} color="#555" /><Quote size={16} color="#555" /><List size={16} color="#555" /><List size={16} color="#555" />
                          </div>
                          <PkpTextarea
                            rows={10}
                            value={authorGuidelines}
                            onChange={(e) => setAuthorGuidelines(e.target.value)}
                            style={{
                              width: "100%",
                              minHeight: "200px",
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0,
                            }}
                          />
                        </div>

                        {/* Copyright Notice Section */}
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#002C40",
                            marginBottom: "0.5rem",
                          }}>
                            Copyright Notice
                          </h3>
                          <p style={{
                            fontSize: "0.875rem",
                            color: "#333",
                            marginBottom: "0.5rem",
                            lineHeight: "1.5",
                          }}>
                            Require authors to agree to the following copyright notice as part of the submission process.
                          </p>
                          <div style={{ border: "1px solid #ccc", borderBottom: "none", padding: "0.5rem", display: "flex", gap: "0.75rem", backgroundColor: "#fff", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
                            <Bold size={16} color="#555" /><Italic size={16} color="#555" /><Superscript size={16} color="#555" /><Subscript size={16} color="#555" /><LinkIcon size={16} color="#555" /><Quote size={16} color="#555" /><List size={16} color="#555" /><ListOrdered size={16} color="#555" />
                          </div>
                          <PkpTextarea
                            rows={8}
                            value={copyrightNotice}
                            onChange={(e) => setCopyrightNotice(e.target.value)}
                            style={{
                              width: "100%",
                              minHeight: "150px",
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0,
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e5e5", paddingTop: "1rem" }}>
                          <PkpButton
                            variant="primary"
                            onClick={() => {
                              handleSaveAuthorGuidelines();
                              handleSaveCopyrightNotice();
                            }}
                            disabled={authorGuidelinesSettings.loading}
                            loading={authorGuidelinesSettings.loading}
                          >
                            {authorGuidelinesSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                          </PkpButton>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PkpTabsContent>

          {/* Review Tab */}
          <PkpTabsContent value="review" style={{ padding: "0", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", gap: 0, minHeight: "500px" }}>
              {/* Side Tabs */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <button
                  onClick={() => setActiveReviewSubTab("reviewSetup")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeReviewSubTab === "reviewSetup" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeReviewSubTab === "reviewSetup" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeReviewSubTab === "reviewSetup" ? 600 : 400,
                  }}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveReviewSubTab("reviewerGuidance")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeReviewSubTab === "reviewerGuidance" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeReviewSubTab === "reviewerGuidance" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeReviewSubTab === "reviewerGuidance" ? 600 : 400,
                  }}
                >
                  Reviewer Guidance
                </button>
                <button
                  onClick={() => setActiveReviewSubTab("reviewForms")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeReviewSubTab === "reviewForms" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeReviewSubTab === "reviewForms" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeReviewSubTab === "reviewForms" ? 600 : 400,
                  }}
                >
                  Review Forms
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {/* Review Setup */}
                {activeReviewSubTab === "reviewSetup" && (
                  <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        {/* Feedback Message */}
                        {feedback.type && (
                          <div style={{
                            padding: "0.75rem 1rem",
                            marginBottom: "1.5rem",
                            borderRadius: "4px",
                            backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
                            color: feedback.type === "success" ? "#155724" : "#721c24",
                            border: `1px solid ${feedback.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                            fontSize: "0.875rem",
                          }}>
                            {feedback.message}
                          </div>
                        )}

                        {/* Default Review Mode */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Default Review Mode</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <PkpRadio
                              id="reviewMode-doubleAnonymous"
                              name="defaultReviewMode"
                              value="doubleAnonymous"
                              checked={reviewSetup.defaultReviewMode === "doubleAnonymous"}
                              onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: "doubleAnonymous" })}
                              label="Anonymous Reviewer/Anonymous Author"
                            />
                            <PkpRadio
                              id="reviewMode-anonymous"
                              name="defaultReviewMode"
                              value="anonymous"
                              checked={reviewSetup.defaultReviewMode === "anonymous"}
                              onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: "anonymous" })}
                              label="Anonymous Reviewer/Disclosed Author"
                            />
                            <PkpRadio
                              id="reviewMode-open"
                              name="defaultReviewMode"
                              value="open"
                              checked={reviewSetup.defaultReviewMode === "open"}
                              onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: "open" })}
                              label="Open"
                            />
                          </div>
                        </div>

                        {/* Restrict File Access */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>Restrict File Access</h3>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              id="restrictReviewerFileAccess"
                              checked={reviewSetup.restrictReviewerFileAccess}
                              onChange={(e) => setReviewSetup({ ...reviewSetup, restrictReviewerFileAccess: e.target.checked })}
                            />
                            Reviewers will not be given access to the submission file until they have agreed to review it.
                          </label>
                        </div>

                        {/* One-click Reviewer Access */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#002C40", marginBottom: "0.5rem", marginTop: "-1.7rem", backgroundColor: "#fff", width: "fit-content", paddingRight: "0.5rem" }}>One-click Reviewer Access</h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "1rem" }}>
                            Reviewers can be sent a secure link in the email invitation, which will log them in automatically when they click the link.
                          </p>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              id="reviewerAccessKeysEnabled"
                              checked={reviewSetup.reviewerAccessKeysEnabled}
                              onChange={(e) => setReviewSetup({ ...reviewSetup, reviewerAccessKeysEnabled: e.target.checked })}
                            />
                            Include a secure link in the email invitation to reviewers.
                          </label>
                        </div>

                        {/* Default Response Deadline */}
                        <div style={{ marginBottom: "1.5rem" }}>
                          <label htmlFor="numWeeksPerResponse" style={{
                            display: "block",
                            fontSize: "1rem",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Default Response Deadline
                          </label>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "0.5rem" }}>
                            Number of weeks to accept or decline a review request.
                          </p>
                          <PkpInput
                            id="numWeeksPerResponse"
                            type="number"
                            value={reviewSetup.numWeeksPerResponse}
                            onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerResponse: e.target.value })}
                            placeholder="4"
                            style={{ width: "100px" }}
                          />
                        </div>

                        {/* Default Completion Deadline */}
                        <div style={{ marginBottom: "1.5rem" }}>
                          <label htmlFor="numWeeksPerReview" style={{
                            display: "block",
                            fontSize: "1rem",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Default Completion Deadline
                          </label>
                          <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "0.5rem" }}>
                            Weeks allowed to complete the review
                          </p>
                          <PkpInput
                            id="numWeeksPerReview"
                            type="number"
                            value={reviewSetup.numWeeksPerReview}
                            onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerReview: e.target.value })}
                            placeholder="4"
                            style={{ width: "100px" }}
                          />
                        </div>

                        {/* Automated Email Reminders */}
                        <div style={{ marginBottom: "1.5rem" }}>
                          <h3 style={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Automated Email Reminders
                          </h3>
                          <p style={{ fontSize: "0.875rem", color: "#333", lineHeight: "1.5" }}>
                            To send automated email reminders, the site administrator must enable the <code style={{ backgroundColor: "#f8f9fa", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>scheduled_tasks</code> option in the OJS configuration file. Additional server configuration may be required as indicated in the OJS documentation.
                          </p>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e5e5", paddingTop: "1rem" }}>
                          <PkpButton
                            variant="primary"
                            onClick={handleSaveReviewSetup}
                            disabled={reviewSetupSettings.loading}
                            loading={reviewSetupSettings.loading}
                          >
                            {reviewSetupSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                          </PkpButton>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviewer Guidance */}
                {activeReviewSubTab === "reviewerGuidance" && (
                  <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        {/* Feedback Message */}
                        {feedback.type && (
                          <div style={{
                            padding: "0.75rem 1rem",
                            marginBottom: "1.5rem",
                            borderRadius: "4px",
                            backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
                            color: feedback.type === "success" ? "#155724" : "#721c24",
                            border: `1px solid ${feedback.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                            fontSize: "0.875rem",
                          }}>
                            {feedback.message}
                          </div>
                        )}

                        {/* Review Guidelines */}
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#002C40",
                            marginBottom: "0.5rem",
                          }}>
                            Review Guidelines
                          </h3>
                          <div style={{ border: "1px solid #ccc", borderBottom: "none", padding: "0.5rem", display: "flex", gap: "0.75rem", backgroundColor: "#fff", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
                            <Bold size={16} color="#555" /><Italic size={16} color="#555" /><Superscript size={16} color="#555" /><Subscript size={16} color="#555" /><LinkIcon size={16} color="#555" /><Quote size={16} color="#555" /><List size={16} color="#555" /><ListOrdered size={16} color="#555" />
                          </div>
                          <PkpTextarea
                            id="reviewGuidelines"
                            rows={10}
                            value={reviewerGuidance.reviewGuidelines}
                            onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, reviewGuidelines: e.target.value })}
                            style={{
                              width: "100%",
                              minHeight: "200px",
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0,
                            }}
                          />
                        </div>

                        {/* Competing Interests */}
                        <div style={{ marginBottom: "2rem" }}>
                          <h3 style={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#002C40",
                            marginBottom: "0.5rem",
                          }}>
                            Competing Interests
                          </h3>
                          <div style={{ border: "1px solid #ccc", borderBottom: "none", padding: "0.5rem", display: "flex", gap: "0.75rem", backgroundColor: "#fff", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
                            <Bold size={16} color="#555" /><Italic size={16} color="#555" /><Superscript size={16} color="#555" /><Subscript size={16} color="#555" /><LinkIcon size={16} color="#555" /><Quote size={16} color="#555" /><List size={16} color="#555" /><ListOrdered size={16} color="#555" />
                          </div>
                          <PkpTextarea
                            id="competingInterests"
                            rows={8}
                            value={reviewerGuidance.competingInterests}
                            onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, competingInterests: e.target.value })}
                            style={{
                              width: "100%",
                              minHeight: "150px",
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0,
                            }}
                          />
                        </div>

                        {/* Show Ensuring Link */}
                        <div style={{ marginBottom: "1.5rem", border: "1px solid #e5e5e5", padding: "1rem", borderRadius: "4px" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#333" }}>
                            <PkpCheckbox
                              id="showEnsuringLink"
                              checked={reviewerGuidance.showEnsuringLink}
                              onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, showEnsuringLink: e.target.checked })}
                            />
                            <span>Present a link to <a href="#" style={{ color: "#006798", textDecoration: "underline" }}>how to ensure all files are anonymized</a> during upload</span>
                          </label>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e5e5", paddingTop: "1rem" }}>
                          <PkpButton
                            variant="primary"
                            onClick={handleSaveReviewerGuidance}
                            disabled={reviewerGuidanceSettings.loading}
                            loading={reviewerGuidanceSettings.loading}
                          >
                            {reviewerGuidanceSettings.loading ? "Saving..." : "Save"}
                          </PkpButton>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Forms */}
                {activeReviewSubTab === "reviewForms" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Review Forms
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginBottom: "1rem",
                      }}>
                        If you would like to request specific information from reviewers, you can build forms here. An editor will be able to select a form when assigning a reviewer, and the reviewer will be asked to complete that form when they are submitting their review.
                      </p>
                      <ReviewFormsPanel />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PkpTabsContent>

          {/* Library Tab */}
          <PkpTabsContent value="library" style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e5",
            padding: "1.5rem",
            boxShadow: "none",
            borderRadius: 0,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "#002C40",
                margin: 0,
              }}>
                Publisher Library
              </h2>
              <PkpButton variant="onclick" style={{ fontSize: "0.875rem" }}>Add a file</PkpButton>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Marketing", "Permissions", "Reports", "Other"].map((category, index) => (
                <div key={index}>
                  <h3 style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#002C40",
                    marginBottom: "0.5rem",
                  }}>
                    {category}
                  </h3>
                  <div style={{
                    padding: "1rem",
                    color: "rgba(0, 0, 0, 0.54)",
                    fontSize: "0.875rem",
                    fontStyle: "italic",
                    borderBottom: index < 3 ? "1px solid #e5e5e5" : "none"
                  }}>
                    No Items
                  </div>
                </div>
              ))}
            </div>
          </PkpTabsContent>

          {/* Emails Tab */}
          <PkpTabsContent value="emails" style={{ padding: "0", backgroundColor: "#ffffff" }}>
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              padding: "1.5rem",
              minHeight: "500px"
            }}>
              {/* Horizontal Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeEmailSubTab === 'emailsSetup' ? 'text-[#006798] font-bold' : 'text-gray-600 hover:text-[#006798]'}`}
                  onClick={() => setActiveEmailSubTab('emailsSetup')}
                >
                  Setup
                  {activeEmailSubTab === 'emailsSetup' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#006798]"></div>
                  )}
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeEmailSubTab === 'emailTemplates' ? 'text-[#006798] font-bold' : 'text-gray-600 hover:text-[#006798]'}`}
                  onClick={() => setActiveEmailSubTab('emailTemplates')}
                >
                  Email Templates
                  {activeEmailSubTab === 'emailTemplates' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#006798]"></div>
                  )}
                </button>
              </div>

              {/* Emails Setup */}
              {activeEmailSubTab === "emailsSetup" && (
                <div>
                  {/* Feedback Message */}
                  {feedback.type && (
                    <div style={{
                      padding: "0.75rem 1rem",
                      marginBottom: "1.5rem",
                      borderRadius: "4px",
                      backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
                      color: feedback.type === "success" ? "#155724" : "#721c24",
                      border: `1px solid ${feedback.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                      fontSize: "0.875rem",
                    }}>
                      {feedback.message}
                    </div>
                  )}

                  {/* Signature */}
                  <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <label htmlFor="emailSignature" style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#002C40",
                      }}>
                        Signature
                      </label>
                      <HelpCircle size={14} color="#006798" />
                    </div>
                    <div style={{ border: "1px solid #ccc", borderBottom: "none", padding: "0.5rem", display: "flex", gap: "0.75rem", backgroundColor: "#fff", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
                      <Bold size={16} color="#555" /><Italic size={16} color="#555" /><Superscript size={16} color="#555" /><Subscript size={16} color="#555" /><LinkIcon size={16} color="#555" /><Upload size={16} color="#555" />
                    </div>
                    <PkpTextarea
                      id="emailSignature"
                      rows={8}
                      value={emailSetup.emailSignature}
                      onChange={(e) => setEmailSetup({ ...emailSetup, emailSignature: e.target.value })}
                      style={{
                        width: "100%",
                        minHeight: "200px",
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                      }}
                    />
                  </div>

                  {/* Bounce Address */}
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                      color: "#002C40",
                    }}>
                      Bounce Address
                    </label>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "#333",
                      lineHeight: "1.5",
                      marginBottom: 0,
                    }}>
                      In order to send undeliverable emails to a bounce address, the site administrator must enable the <code style={{ backgroundColor: "#f8f9fa", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>allow_envelope_sender</code> option in the site configuration file. Server configuration may be required, as indicated in the OJS documentation.
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e5e5", paddingTop: "1rem" }}>
                    <PkpButton
                      variant="primary"
                      onClick={handleSaveEmailSetup}
                      disabled={emailSetupSettings.loading}
                      loading={emailSetupSettings.loading}
                    >
                      {emailSetupSettings.loading ? "Saving..." : "Save"}
                    </PkpButton>
                  </div>
                </div>
              )}

              {/* Email Templates */}
              {activeEmailSubTab === "emailTemplates" && (
                <div>
                  <h2 style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    color: "#002C40",
                  }}>
                    Email Templates
                  </h2>
                  <div style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5e5",
                    padding: "1.5rem",
                  }}>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginBottom: "1.5rem",
                    }}>
                      You can view a description of each email and edit the email by clicking the dropdown arrow on the right. Click Filters to filter templates by sender, recipient, workflow stage, and whether the template is enabled.
                    </p>
                    <div style={{ marginBottom: "1rem" }}>
                      <PkpInput
                        type="search"
                        placeholder="Filter by sender, recipient, workflow stage..."
                        style={{ width: "100%", maxWidth: "400px" }}
                      />
                    </div>
                    <PkpTable>
                      <PkpTableHeader>
                        <PkpTableRow isHeader>
                          <PkpTableHead>Email Template</PkpTableHead>
                          <PkpTableHead>Description</PkpTableHead>
                          <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Enabled</PkpTableHead>
                          <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                        </PkpTableRow>
                      </PkpTableHeader>
                      <tbody>
                        {USE_DUMMY && DUMMY_EMAIL_TEMPLATES.length > 0 ? (
                          DUMMY_EMAIL_TEMPLATES.map((template) => (
                            <PkpTableRow key={template.id}>
                              <PkpTableCell>
                                <div style={{ fontWeight: 500 }}>{template.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                  Stage: {template.stage} • To: {template.recipient}
                                </div>
                              </PkpTableCell>
                              <PkpTableCell>
                                <div style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{template.description}</div>
                              </PkpTableCell>
                              <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                <PkpCheckbox checked={template.enabled} readOnly />
                              </PkpTableCell>
                              <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                                <PkpButton variant="onclick" size="sm">Preview</PkpButton>
                              </PkpTableCell>
                            </PkpTableRow>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                              {USE_DUMMY ? "No email templates found." : "Email templates list will be implemented here with edit, preview, and enable/disable functionality."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </PkpTable>
                  </div>
                </div>
              )}
            </div>
          </PkpTabsContent>
        </PkpTabs>
      </div>
    </div>
  );
}
