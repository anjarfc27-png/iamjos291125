export const SUBMISSION_STAGES = ["submission", "review", "copyediting", "production"] as const;
export type SubmissionStage = (typeof SUBMISSION_STAGES)[number];

export const SUBMISSION_STATUSES = [
  "queued",
  "in_review",
  "in_copyediting",
  "in_production",
  "accepted",
  "scheduled",
  "published",
  "declined",
  "archived",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export type SubmissionSummary = {
  id: string;
  title: string;
  journalId: string;
  journalTitle?: string;
  stage: SubmissionStage;
  current_stage: SubmissionStage;
  status: SubmissionStatus;
  isArchived: boolean;
  submittedAt: string;
  updatedAt: string;
  assignees: string[];
  author_name?: string;
};

export type EditorDashboardStats = {
  myQueue: number;
  unassigned: number;
  submission: number;
  inReview: number;
  copyediting: number;
  production: number;
  allActive: number;
  archived: number;
  tasks: number;
};

export type PublicationGalley = {
  id: string;
  submissionVersionId: string;
  label: string;
  locale: string;
  isApproved: boolean;
  isPublic: boolean;
  isPrimary: boolean;
  sequence: number;
  submissionFileId?: string | null;
  fileStoragePath?: string | null;
  fileSize: number;
  remoteUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubmissionVersion = {
  id: string;
  version: number;
  status: string;
  metadata: Record<string, unknown>;
  issue?: {
    id: string;
    title?: string | null;
    year?: number | null;
    volume?: number | null;
  };
  publishedAt?: string | null;
  createdAt: string;
  galleys: PublicationGalley[];
};

export type SubmissionParticipant = {
  userId: string;
  role: string;
  stage: SubmissionStage;
  assignedAt: string;
  name?: string;
  email?: string;
};

export type SubmissionFile = {
  id: string;
  label: string;
  stage: SubmissionStage;
  kind: string;
  storagePath: string;
  versionLabel?: string | null;
  round: number;
  isVisibleToAuthors: boolean;
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
};

export type SubmissionActivityLog = {
  id: string;
  message: string;
  category: string;
  createdAt: string;
  actorId?: string | null;
};

export type SubmissionReview = {
  id: string;
  reviewerId: string;
  assignmentDate: string;
  dueDate?: string | null;
  responseDueDate?: string | null;
  status: string;
  recommendation?: string | null;
  submittedAt?: string | null;
};

export type SubmissionReviewRound = {
  id: string;
  stage: SubmissionStage;
  round: number;
  status: string;
  startedAt: string;
  closedAt?: string | null;
  notes?: string | null;
  reviews: SubmissionReview[];
};

export type SubmissionDetail = {
  summary: SubmissionSummary;
  metadata: Record<string, unknown>;
  versions: SubmissionVersion[];
  participants: SubmissionParticipant[];
  files: SubmissionFile[];
  activity: SubmissionActivityLog[];
  reviewRounds: SubmissionReviewRound[];
  queries?: Query[];
};

export type IssueRow = {
  id: string;
  title: string;
  volume: number | null;
  number: number | null;
  year: number | null;
  status: "published" | "scheduled" | "draft" | string;
  publishedAt?: string | null;
};

// Editor Decision Constants (matching OJS PKP 3.3)
// Reference: classes/workflow/EditorDecisionActionsManager.inc.php (lines 17-29)
// Reference: lib/pkp/classes/workflow/PKPEditorDecisionActionsManager.inc.php (lines 16-22)
export const SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW = 8; // Submission stage decision
export const SUBMISSION_EDITOR_DECISION_ACCEPT = 1; // Submission and review stages decision
export const SUBMISSION_EDITOR_DECISION_DECLINE = 4; // Submission and review stages decision
export const SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE = 9; // PKP base decision
export const SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS = 2; // Review stage decision
export const SUBMISSION_EDITOR_DECISION_RESUBMIT = 3; // Review stage decision
export const SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION = 7; // Editorial stage decision
export const SUBMISSION_EDITOR_DECISION_REVERT_DECLINE = 17; // PKP base decision
export const SUBMISSION_EDITOR_DECISION_NEW_ROUND = 16; // Review stage decision

// Editor Recommendation Constants
export const SUBMISSION_EDITOR_RECOMMEND_ACCEPT = 11;
export const SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS = 12;
export const SUBMISSION_EDITOR_RECOMMEND_RESUBMIT = 13;
export const SUBMISSION_EDITOR_RECOMMEND_DECLINE = 14;

export type EditorDecisionType =
  | typeof SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW
  | typeof SUBMISSION_EDITOR_DECISION_ACCEPT
  | typeof SUBMISSION_EDITOR_DECISION_DECLINE
  | typeof SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE
  | typeof SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS
  | typeof SUBMISSION_EDITOR_DECISION_RESUBMIT
  | typeof SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION
  | typeof SUBMISSION_EDITOR_DECISION_REVERT_DECLINE
  | typeof SUBMISSION_EDITOR_DECISION_NEW_ROUND;

export type EditorRecommendationType =
  | typeof SUBMISSION_EDITOR_RECOMMEND_ACCEPT
  | typeof SUBMISSION_EDITOR_RECOMMEND_PENDING_REVISIONS
  | typeof SUBMISSION_EDITOR_RECOMMEND_RESUBMIT
  | typeof SUBMISSION_EDITOR_RECOMMEND_DECLINE;

export type EditorDecision = {
  decision: EditorDecisionType | EditorRecommendationType;
  name: string;
  operation: string;
  title: string;
  toStage?: string;
  help?: string;
  paymentType?: string;
};

export type EditorDecisionHistory = {
  id: string;
  submissionId: string;
  decision: EditorDecisionType | EditorRecommendationType;
  stage: SubmissionStage;
  reviewRoundId?: string;
  decisionDate: string;
  editorId: string;
  editorName: string;
  notes?: string;
  files?: string[];
};

// Query/Discussion Types
export type QueryNote = {
  id: string;
  queryId: string;
  userId: string;
  userName: string;
  title?: string | null;
  contents: string;
  dateCreated: string;
  dateModified?: string | null;
};

export type Query = {
  id: string;
  submissionId: string;
  stage: SubmissionStage;
  stageId: number;
  seq: number;
  datePosted: string;
  dateModified?: string | null;
  closed: boolean;
  participants: string[]; // User IDs
  notes: QueryNote[];
};

export type SubmissionDetailWithQueries = SubmissionDetail & {
  queries: Query[];
};

export type SubmissionTask = {
  id: string;
  submissionId: string;
  submissionTitle?: string | null;
  stage: SubmissionStage;
  title: string;
  status: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  createdAt: string;
};

export type LibraryFile = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  displaySize: string;
  stage: string;
  description?: string | null;
  remoteUrl?: string | null;
  storagePath?: string | null;
  source?: "upload" | "remote";
  createdAt: string;
  updatedAt: string;
};

export type ReviewForm = {
  id: string;
  title: string;
  description?: string | null;
  seq: number;
  isActive: boolean;
  questions?: number | null;
  createdAt: string;
  updatedAt: string;
};

