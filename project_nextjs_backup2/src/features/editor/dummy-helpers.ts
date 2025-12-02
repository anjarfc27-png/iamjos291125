/**
 * Helper Functions for OJS 3.3 Dummy Data
 * These functions simulate the OJS 3.3 filtering and permission logic
 * using dummy stage_assignments data.
 */

import {
  DUMMY_STAGE_ASSIGNMENTS,
  DUMMY_SUBMISSIONS,
  DUMMY_USER_GROUPS,
  ROLE_ID_MANAGER,
  ROLE_ID_SUB_EDITOR,
  WORKFLOW_STAGE_ID_SUBMISSION,
  STAGE_NAME_TO_ID,
} from "./dummy-data";
import type { SubmissionSummary, EditorDashboardStats, SubmissionStage } from "./types";

/**
 * Get all submissions assigned to a specific user
 * This simulates the My Queue functionality in OJS 3.3
 * Filter: status=STATUS_QUEUED AND assignedTo=current user ID
 */
export function getMyQueueSubmissions(userId: string): SubmissionSummary[] {
  // 1. Get all stage assignments for this user
  const userAssignments = DUMMY_STAGE_ASSIGNMENTS.filter(
    (sa) => sa.user_id === userId
  );

  // 2. Get unique submission IDs that are assigned to this user
  const assignedSubmissionIds = [
    ...new Set(userAssignments.map((sa) => sa.submission_id)),
  ];

  // 3. Filter submissions: status="queued" AND assigned to user
  // OJS 3.3: My Queue shows submissions with STATUS_QUEUED that are assigned to the user
  return DUMMY_SUBMISSIONS.filter(
    (s) => 
      s.status === "queued" && // STATUS_QUEUED - still in workflow
      assignedSubmissionIds.includes(s.id)
  );
}

/**
 * Get all unassigned submissions at Submission stage
 * This simulates the Unassigned Queue functionality in OJS 3.3
 * Filter: status=STATUS_QUEUED AND assignedTo=-1 (not assigned to editor/section_editor)
 */
export function getUnassignedSubmissions(): SubmissionSummary[] {
  // 1. Get all submissions that have editor/section_editor assignments
  const editorAssignments = DUMMY_STAGE_ASSIGNMENTS.filter((sa) => {
    const userGroup = DUMMY_USER_GROUPS.find((ug) => ug.id === sa.user_group_id);
    return (
      userGroup?.role_id === ROLE_ID_MANAGER ||
      userGroup?.role_id === ROLE_ID_SUB_EDITOR
    );
  });

  // 2. Get unique submission IDs that are already assigned
  const assignedSubmissionIds = [
    ...new Set(editorAssignments.map((sa) => sa.submission_id)),
  ];

  // 3. Filter submissions: status="queued" AND not assigned to editor/section_editor
  // OJS 3.3: Unassigned shows submissions with STATUS_QUEUED that have no editor/section_editor assignment
  // Note: In OJS 3.3, assignedTo=-1 means not assigned to editor/section_editor (no stage filter)
  return DUMMY_SUBMISSIONS.filter(
    (s) =>
      s.status === "queued" && // STATUS_QUEUED - still in workflow
      !assignedSubmissionIds.includes(s.id) // Not assigned to editor/section_editor
  );
}

/**
 * Get all active submissions (still in workflow)
 * This simulates the All Active Queue functionality in OJS 3.3
 * Filter: status=STATUS_QUEUED (all submissions still in workflow)
 */
export function getAllActiveSubmissions(): SubmissionSummary[] {
  // OJS 3.3: All Active shows all submissions with STATUS_QUEUED (still in workflow)
  return DUMMY_SUBMISSIONS.filter((s) => s.status === "queued");
}

/**
 * Get all archived submissions
 * This simulates the Archives Queue functionality in OJS 3.3
 * Filter: status IN [STATUS_DECLINED, STATUS_PUBLISHED, STATUS_SCHEDULED]
 * For non-Manager/Admin users, only show archived submissions that are assigned to them
 * For Manager/Admin users, show all archived submissions
 */
export function getArchivedSubmissions(userId?: string, isManagerOrAdmin?: boolean): SubmissionSummary[] {
  // OJS 3.3: Archives shows submissions with STATUS_DECLINED, STATUS_PUBLISHED, or STATUS_SCHEDULED
  const allArchived = DUMMY_SUBMISSIONS.filter((s) => 
    s.status === "declined" || 
    s.status === "published" || 
    s.status === "scheduled"
  );
  
  // If Manager/Admin, return all archived submissions
  if (isManagerOrAdmin) {
    return allArchived;
  }
  
  // For non-Manager/Admin, only return archived submissions that are assigned to this user
  if (userId) {
    const assignedSubmissionIds = getAssignedSubmissionIds(userId);
    return allArchived.filter((s) => assignedSubmissionIds.includes(s.id));
  }
  
  // If no userId provided, return empty array for non-Manager/Admin
  return [];
}

/**
 * Check if a user has a stage assignment for a submission
 * This is used for permission checking
 */
export function hasStageAssignment(
  submissionId: string,
  userId: string,
  stageIdOrName: number | SubmissionStage
): boolean {
  // Convert stage name to stage ID if needed
  const stageId =
    typeof stageIdOrName === "number"
      ? stageIdOrName
      : STAGE_NAME_TO_ID[stageIdOrName] ?? WORKFLOW_STAGE_ID_SUBMISSION;

  return DUMMY_STAGE_ASSIGNMENTS.some(
    (sa) =>
      sa.submission_id === submissionId &&
      sa.user_id === userId &&
      sa.stage_id === stageId
  );
}

/**
 * Check if a user can make editorial decisions for a submission at a stage
 * This checks if user has assignment AND not in recommend_only mode
 */
export function canMakeDecision(
  submissionId: string,
  userId: string,
  stageIdOrName: number | SubmissionStage
): boolean {
  // Convert stage name to stage ID if needed
  const stageId =
    typeof stageIdOrName === "number"
      ? stageIdOrName
      : STAGE_NAME_TO_ID[stageIdOrName] ?? WORKFLOW_STAGE_ID_SUBMISSION;

  const assignment = DUMMY_STAGE_ASSIGNMENTS.find(
    (sa) =>
      sa.submission_id === submissionId &&
      sa.user_id === userId &&
      sa.stage_id === stageId
  );

  // User can make decision if they have assignment AND not in recommend_only mode
  return assignment ? !assignment.recommend_only : false;
}

/**
 * Check if a user can change metadata for a submission at a stage
 */
export function canChangeMetadata(
  submissionId: string,
  userId: string,
  stageIdOrName: number | SubmissionStage
): boolean {
  // Convert stage name to stage ID if needed
  const stageId =
    typeof stageIdOrName === "number"
      ? stageIdOrName
      : STAGE_NAME_TO_ID[stageIdOrName] ?? WORKFLOW_STAGE_ID_SUBMISSION;

  const assignment = DUMMY_STAGE_ASSIGNMENTS.find(
    (sa) =>
      sa.submission_id === submissionId &&
      sa.user_id === userId &&
      sa.stage_id === stageId
  );

  return assignment ? assignment.can_change_metadata : false;
}

/**
 * Get submission IDs assigned to a specific user
 * Used for filtering in list queries
 */
export function getAssignedSubmissionIds(userId: string): string[] {
  const userAssignments = DUMMY_STAGE_ASSIGNMENTS.filter(
    (sa) => sa.user_id === userId
  );

  return [...new Set(userAssignments.map((sa) => sa.submission_id))];
}

/**
 * Get submission IDs assigned to editor/section_editor roles
 * Used for Unassigned filtering
 */
export function getAssignedSubmissionIdsForRoles(): string[] {
  const editorAssignments = DUMMY_STAGE_ASSIGNMENTS.filter((sa) => {
    const userGroup = DUMMY_USER_GROUPS.find((ug) => ug.id === sa.user_group_id);
    return (
      userGroup?.role_id === ROLE_ID_MANAGER ||
      userGroup?.role_id === ROLE_ID_SUB_EDITOR
    );
  });

  return [...new Set(editorAssignments.map((sa) => sa.submission_id))];
}

/**
 * Calculate dashboard statistics for an editor
 * This simulates real-time statistics calculation in OJS 3.3
 */
export function calculateDashboardStats(userId: string, isManagerOrAdmin?: boolean): EditorDashboardStats {
  // Use dummy user ID to ensure consistency with dummy data
  const dummyUserId = userId === "current-user-id" ? userId : "current-user-id";
  
  const myQueue = getMyQueueSubmissions(dummyUserId);
  const unassigned = getUnassignedSubmissions();
  const allActive = getAllActiveSubmissions();
  const archived = getArchivedSubmissions(dummyUserId, isManagerOrAdmin);

  return {
    myQueue: myQueue.length,
    unassigned: unassigned.length,
    allActive: allActive.length,
    archived: archived.length,
    submission: allActive.filter((s) => s.stage === "submission").length,
    inReview: allActive.filter((s) => s.stage === "review").length,
    copyediting: allActive.filter((s) => s.stage === "copyediting").length,
    production: allActive.filter((s) => s.stage === "production").length,
    tasks: 0, // Placeholder for tasks
  };
}

/**
 * Get filtered submissions based on queue type
 */
export function getFilteredSubmissions(
  queue: "my" | "unassigned" | "all" | "archived",
  userId?: string
): SubmissionSummary[] {
  switch (queue) {
    case "my":
      if (!userId) return [];
      return getMyQueueSubmissions(userId);
    case "unassigned":
      return getUnassignedSubmissions();
    case "archived":
      return getArchivedSubmissions();
    case "all":
    default:
      return getAllActiveSubmissions();
  }
}

