/**
 * Dummy Data for OJS 3.3 Simulation
 * This file contains dummy data structures that simulate OJS PKP 3.3 behavior
 * including stage_assignments, user_groups, and enhanced submissions data.
 */

import type { SubmissionSummary } from "./types";

// OJS 3.3 Workflow Stage IDs
export const WORKFLOW_STAGE_ID_SUBMISSION = 1;
export const WORKFLOW_STAGE_ID_INTERNAL_REVIEW = 2;
export const WORKFLOW_STAGE_ID_EXTERNAL_REVIEW = 3;
export const WORKFLOW_STAGE_ID_EDITING = 4;
export const WORKFLOW_STAGE_ID_PRODUCTION = 5;

// OJS 3.3 Role IDs
export const ROLE_ID_MANAGER = 16;
export const ROLE_ID_SUB_EDITOR = 17;
export const ROLE_ID_ASSISTANT = 4097;
export const ROLE_ID_AUTHOR = 256;
export const ROLE_ID_REVIEWER = 4096;
export const ROLE_ID_READER = 1048576;
export const ROLE_ID_SUBSCRIPTION_MANAGER = 8388608;

// OJS 3.3 Submission Status Constants
export const STATUS_QUEUED = 1; // Still in workflow
export const STATUS_PUBLISHED = 3; // Published
export const STATUS_DECLINED = 4; // Declined
export const STATUS_SCHEDULED = 5; // Scheduled for publication

// Dummy User Groups (simulating user_groups table)
export const DUMMY_USER_GROUPS = [
  {
    id: "editor-group-1",
    context_id: "journal-1",
    role_id: ROLE_ID_MANAGER,
    name: "Manager",
    abbreviation: "MGR",
  },
  {
    id: "editor-group-2",
    context_id: "journal-1",
    role_id: ROLE_ID_SUB_EDITOR,
    name: "Section Editor",
    abbreviation: "SE",
  },
  {
    id: "assistant-group-1",
    context_id: "journal-1",
    role_id: ROLE_ID_ASSISTANT,
    name: "Assistant",
    abbreviation: "ASST",
  },
];

// Dummy Stage Assignments (simulating stage_assignments table)
// This is CRITICAL for My Queue and Unassigned filtering
export const DUMMY_STAGE_ASSIGNMENTS = [
  // Submission 1: Assigned to current user as Editor at Submission stage
  {
    submission_id: "1",
    user_id: "current-user-id", // Will be replaced with actual user ID
    user_group_id: "editor-group-2", // Section Editor
    stage_id: WORKFLOW_STAGE_ID_SUBMISSION,
    date_assigned: "2024-01-15T08:00:00Z",
    recommend_only: false,
    can_change_metadata: true,
  },
  // Submission 1: Also assigned at Review stage
  {
    submission_id: "1",
    user_id: "current-user-id",
    user_group_id: "editor-group-2",
    stage_id: WORKFLOW_STAGE_ID_EXTERNAL_REVIEW,
    date_assigned: "2024-01-20T10:00:00Z",
    recommend_only: false,
    can_change_metadata: true,
  },
  // Submission 2: Assigned to current user as Editor at Copyediting stage
  {
    submission_id: "2",
    user_id: "current-user-id",
    user_group_id: "editor-group-2",
    stage_id: WORKFLOW_STAGE_ID_SUBMISSION,
    date_assigned: "2024-01-10T09:00:00Z",
    recommend_only: false,
    can_change_metadata: true,
  },
  // Submission 2: Also at Copyediting stage
  {
    submission_id: "2",
    user_id: "current-user-id",
    user_group_id: "editor-group-2",
    stage_id: WORKFLOW_STAGE_ID_EDITING,
    date_assigned: "2024-01-18T14:00:00Z",
    recommend_only: false,
    can_change_metadata: true,
  },
  // Submission 5: Assigned to current user at Review stage
  {
    submission_id: "5",
    user_id: "current-user-id",
    user_group_id: "editor-group-2",
    stage_id: WORKFLOW_STAGE_ID_EXTERNAL_REVIEW,
    date_assigned: "2023-12-20T10:00:00Z",
    recommend_only: false,
    can_change_metadata: true,
  },
  // Submission 6: Assigned to current user at Copyediting stage
  {
    submission_id: "6",
    user_id: "current-user-id",
    user_group_id: "editor-group-2",
    stage_id: WORKFLOW_STAGE_ID_EDITING,
    date_assigned: "2024-01-12T14:00:00Z",
    recommend_only: false,
    can_change_metadata: true,
  },
  // Submission 3: Assigned to OTHER user (not current user) - should NOT appear in My Queue
  {
    submission_id: "3",
    user_id: "other-user-id",
    user_group_id: "editor-group-2",
    stage_id: WORKFLOW_STAGE_ID_PRODUCTION,
    date_assigned: "2024-01-05T07:00:00Z",
    recommend_only: false,
    can_change_metadata: true,
  },
  // Submission 4: NOT assigned to anyone - should appear in Unassigned
  // Submission 7: NOT assigned to anyone at Submission stage - should appear in Unassigned
  // Submission 8: Assigned to OTHER user - should NOT appear in My Queue
];

// Dummy Submissions (enhanced version)
export const DUMMY_SUBMISSIONS: SubmissionSummary[] = [
  {
    id: "1",
    title: "Pemanfaatan Machine Learning untuk Prediksi Cuaca di Daerah Tropis",
    journalId: "1",
    journalTitle: "Jurnal Teknologi Informasi",
    stage: "review",
    current_stage: "review",
    status: "queued", // STATUS_QUEUED - still in workflow
    isArchived: false,
    submittedAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-20T10:30:00Z",
    assignees: ["current-user-id"],
    author_name: "Dr. Andi Wijaya, M.Kom",
  },
  {
    id: "2",
    title: "Analisis Sentimen Terhadap Kebijakan Pemerintah Menggunakan Deep Learning",
    journalId: "1",
    journalTitle: "Jurnal Teknologi Informasi",
    stage: "copyediting",
    current_stage: "copyediting",
    status: "queued",
    isArchived: false,
    submittedAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
    assignees: ["current-user-id"],
    author_name: "Siti Nurhaliza, S.T., M.T.",
  },
  {
    id: "3",
    title: "Perancangan Sistem Informasi Manajemen Perpustakaan Berbasis Web",
    journalId: "2",
    journalTitle: "Jurnal Sistem Informasi",
    stage: "production",
    current_stage: "production",
    status: "published", // STATUS_PUBLISHED - archived
    isArchived: true,
    submittedAt: "2024-01-05T07:30:00Z",
    updatedAt: "2024-01-22T16:45:00Z",
    assignees: ["other-user-id"], // Assigned to other user
    author_name: "Bambang Suryadi, S.Kom., M.Kom.",
  },
  {
    id: "4",
    title: "Implementasi Blockchain untuk Keamanan Data Kesehatan",
    journalId: "1",
    journalTitle: "Jurnal Teknologi Informasi",
    stage: "submission",
    current_stage: "submission",
    status: "queued",
    isArchived: false,
    submittedAt: "2024-01-20T11:00:00Z",
    updatedAt: "2024-01-21T09:15:00Z",
    assignees: [], // NOT assigned - should appear in Unassigned
    author_name: "Dr. Ratih Pratiwi, M.Kom.",
  },
  {
    id: "5",
    title: "Kajian Perbandingan Metode Klasifikasi untuk Diagnosis Penyakit Jantung",
    journalId: "3",
    journalTitle: "Jurnal Kesehatan Digital",
    stage: "review",
    current_stage: "review",
    status: "queued", // STATUS_QUEUED - still in workflow
    isArchived: false,
    submittedAt: "2023-12-20T10:00:00Z",
    updatedAt: "2024-01-12T13:30:00Z",
    assignees: ["current-user-id"],
    author_name: "Prof. Dr. Ahmad Rahman, M.Biomed.",
  },
  {
    id: "6",
    title: "Pengembangan Aplikasi Mobile untuk Monitoring Kualitas Udara",
    journalId: "1",
    journalTitle: "Jurnal Teknologi Informasi",
    stage: "copyediting",
    current_stage: "copyediting",
    status: "queued",
    isArchived: false,
    submittedAt: "2024-01-12T14:00:00Z",
    updatedAt: "2024-01-19T11:20:00Z",
    assignees: ["current-user-id"],
    author_name: "Diana Putri, S.T., M.T.",
  },
  {
    id: "7",
    title: "Optimasi Algoritma Genetika untuk Penjadwalan Kuliah Otomatis",
    journalId: "2",
    journalTitle: "Jurnal Sistem Informasi",
    stage: "submission",
    current_stage: "submission",
    status: "queued",
    isArchived: false,
    submittedAt: "2024-01-18T09:30:00Z",
    updatedAt: "2024-01-18T09:30:00Z",
    assignees: [], // NOT assigned - should appear in Unassigned
    author_name: "Ir. Muhammad Faisal, M.Kom.",
  },
  {
    id: "8",
    title: "Analisis Kinerja Sistem Terdistribusi pada Lingkungan Cloud Computing",
    journalId: "1",
    journalTitle: "Jurnal Teknologi Informasi",
    stage: "production",
    current_stage: "production",
    status: "scheduled", // STATUS_SCHEDULED - archived
    isArchived: true,
    submittedAt: "2023-12-15T08:15:00Z",
    updatedAt: "2024-01-23T15:00:00Z",
    assignees: ["other-user-id"], // Assigned to other user
    author_name: "Dr. Citra Kusuma, M.Sc.",
  },
  // Additional archived submissions for testing
  {
    id: "9",
    title: "Metode Baru dalam Analisis Data Kuantitatif untuk Penelitian Sosial",
    journalId: "1",
    journalTitle: "Jurnal Teknologi Informasi",
    stage: "submission",
    current_stage: "submission",
    status: "declined", // STATUS_DECLINED - archived
    isArchived: true,
    submittedAt: "2023-11-10T10:00:00Z",
    updatedAt: "2023-12-05T14:00:00Z",
    assignees: ["current-user-id"], // Was assigned to current user
    author_name: "Dr. Sari Indah, M.Stat.",
  },
  {
    id: "10",
    title: "Implementasi Teknologi IoT untuk Smart City",
    journalId: "2",
    journalTitle: "Jurnal Sistem Informasi",
    stage: "production",
    current_stage: "production",
    status: "published", // STATUS_PUBLISHED - archived
    isArchived: true,
    submittedAt: "2023-10-01T08:00:00Z",
    updatedAt: "2023-11-20T12:00:00Z",
    assignees: ["current-user-id"], // Was assigned to current user
    author_name: "Prof. Dr. Budi Santoso, M.T.",
  },
];

// Map stage names to stage IDs
export const STAGE_NAME_TO_ID: Record<string, number> = {
  submission: WORKFLOW_STAGE_ID_SUBMISSION,
  review: WORKFLOW_STAGE_ID_EXTERNAL_REVIEW,
  copyediting: WORKFLOW_STAGE_ID_EDITING,
  production: WORKFLOW_STAGE_ID_PRODUCTION,
};

// Map stage IDs to stage names
export const STAGE_ID_TO_NAME: Record<number, string> = {
  [WORKFLOW_STAGE_ID_SUBMISSION]: "submission",
  [WORKFLOW_STAGE_ID_INTERNAL_REVIEW]: "review",
  [WORKFLOW_STAGE_ID_EXTERNAL_REVIEW]: "review",
  [WORKFLOW_STAGE_ID_EDITING]: "copyediting",
  [WORKFLOW_STAGE_ID_PRODUCTION]: "production",
};


