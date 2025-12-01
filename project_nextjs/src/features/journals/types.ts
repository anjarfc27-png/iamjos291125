export type HostedJournal = {
  id: string;
  name: string;
  path: string;
  isPublic: boolean;
  description?: string;
  initials?: string;
  abbreviation?: string;
  publisher?: string;
  issnOnline?: string;
  issnPrint?: string;
};

export type JournalSettings = {
  context: {
    name: string;
    initials: string;
    abbreviation: string;
    publisher: string;
    issnOnline: string;
    issnPrint: string;
    focusScope: string;
  };
  search: {
    keywords: string;
    description: string;
    includeSupplemental: boolean;
  };
  theme: {
    theme: string;
    headerBg: string;
    useSiteTheme: boolean;
    showLogo: boolean;
  };
  restrictBulkEmails: {
    disabledRoles: string[];
  };
  workflow?: {
    submissions: { allowChecklists: boolean; requireMetadataComplete: boolean };
    review: { allowReviewerRecommendations: boolean; enableReviewForms: boolean };
    copyediting: { requireChecklist: boolean };
    production: { allowedGalleyFormats: string[]; enableProofreading: boolean };
    discussions: { enableEditorialDiscussions: boolean };
  };
};

export const DEFAULT_JOURNAL_SETTINGS: JournalSettings = {
  context: {
    name: "",
    initials: "",
    abbreviation: "",
    publisher: "",
    issnOnline: "",
    issnPrint: "",
    focusScope: "",
  },
  search: {
    keywords: "",
    description: "",
    includeSupplemental: true,
  },
  theme: {
    theme: "default",
    headerBg: "#0a2d44",
    useSiteTheme: true,
    showLogo: true,
  },
  restrictBulkEmails: {
    disabledRoles: [],
  },
  workflow: {
    submissions: { allowChecklists: true, requireMetadataComplete: true },
    review: { allowReviewerRecommendations: true, enableReviewForms: false },
    copyediting: { requireChecklist: true },
    production: { allowedGalleyFormats: ["PDF", "HTML"], enableProofreading: true },
    discussions: { enableEditorialDiscussions: true },
  },
};

export const JOURNAL_ROLE_OPTIONS = [
  { value: "manager", label: "Journal Manager" },
  { value: "editor", label: "Journal Editor" },
  { value: "section_editor", label: "Section Editor" },
  { value: "guest_editor", label: "Guest Editor" },
  { value: "reviewer", label: "Reviewer" },
  { value: "copyeditor", label: "Copyeditor" },
  { value: "proofreader", label: "Proofreader" },
  { value: "author", label: "Author" },
  { value: "reader", label: "Reader" },
] as const;

export type JournalRoleValue = (typeof JOURNAL_ROLE_OPTIONS)[number]["value"];

// User Group types based on OJS PKP 3.3
export type UserGroup = {
  id: string;
  context_id: string;
  role_id: number;
  is_default: boolean;
  show_title: boolean;
  permit_self_registration: boolean;
  permit_metadata_edit: boolean;
  recommend_only: boolean;
  name?: string; // From user_group_settings
  stages?: number[]; // From user_group_stage
};

export type UserGroupStage = {
  context_id: string;
  user_group_id: string;
  stage_id: number;
  created_at: string;
};

export type StageAssignment = {
  id: string;
  submission_id: string;
  user_group_id: string;
  user_id: string;
  date_assigned: string;
  recommend_only: boolean;
  can_change_metadata: boolean;
  created_at: string;
  updated_at: string;
};

// Workflow stages constants based on OJS PKP 3.3
export const WORKFLOW_STAGES = {
  SUBMISSION: 1,
  INTERNAL_REVIEW: 2,
  EXTERNAL_REVIEW: 3,
  COPYEDITING: 4,
  PRODUCTION: 5,
} as const;

export type WorkflowStage = (typeof WORKFLOW_STAGES)[keyof typeof WORKFLOW_STAGES];

