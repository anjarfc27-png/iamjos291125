"use server";

/**
 * Participant Assignment Server Actions
 * Based on OJS PKP 3.3 StageAssignmentDAO
 * 
 * These actions simulate participant assignment operations using dummy data.
 * In production, these will interact with the database.
 */

import type { SubmissionStage } from "../types";

type AssignParticipantData = {
  submissionId: string;
  stage: SubmissionStage;
  userId: string;
  role: string;
  recommendOnly?: boolean;
  canChangeMetadata?: boolean;
};

type UpdateParticipantData = {
  submissionId: string;
  stage: SubmissionStage;
  userId: string;
  recommendOnly?: boolean;
  canChangeMetadata?: boolean;
};

type ActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

/**
 * Assign Participant (Editor, Copyeditor, Layout Editor, Proofreader)
 * Based on OJS PKP 3.3 createStageAssignment
 */
export async function assignParticipant(
  data: AssignParticipantData
): Promise<ActionResult> {
  try {
    // TODO: Implement actual database save
    // For now, simulate success with dummy data
    console.log("[DUMMY] Assign Participant:", data);
    
    return {
      ok: true,
      message: "Participant assigned successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to assign participant",
    };
  }
}

/**
 * Update Participant Permissions
 * Based on OJS PKP 3.3 updateStageAssignment
 */
export async function updateParticipantPermissions(
  data: UpdateParticipantData
): Promise<ActionResult> {
  try {
    // TODO: Implement actual database update
    console.log("[DUMMY] Update Participant Permissions:", data);
    
    return {
      ok: true,
      message: "Participant permissions updated successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update participant permissions",
    };
  }
}

/**
 * Remove Participant
 * Based on OJS PKP 3.3 deleteStageAssignment
 */
export async function removeParticipant(
  submissionId: string,
  stage: SubmissionStage,
  userId: string,
  role: string
): Promise<ActionResult> {
  try {
    // TODO: Implement actual database delete
    console.log("[DUMMY] Remove Participant:", { submissionId, stage, userId, role });
    
    return {
      ok: true,
      message: "Participant removed successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to remove participant",
    };
  }
}

/**
 * Assign Editor
 */
export async function assignEditor(data: {
  submissionId: string;
  stage: SubmissionStage;
  userId: string;
  recommendOnly?: boolean;
  canChangeMetadata?: boolean;
}): Promise<ActionResult> {
  return await assignParticipant({
    ...data,
    role: "editor",
  });
}

/**
 * Assign Copyeditor
 */
export async function assignCopyeditor(data: {
  submissionId: string;
  stage: SubmissionStage;
  userId: string;
}): Promise<ActionResult> {
  return await assignParticipant({
    ...data,
    role: "copyeditor",
  });
}

/**
 * Assign Layout Editor
 */
export async function assignLayoutEditor(data: {
  submissionId: string;
  stage: SubmissionStage;
  userId: string;
}): Promise<ActionResult> {
  return await assignParticipant({
    ...data,
    role: "layout_editor",
  });
}

/**
 * Assign Proofreader
 */
export async function assignProofreader(data: {
  submissionId: string;
  stage: SubmissionStage;
  userId: string;
}): Promise<ActionResult> {
  return await assignParticipant({
    ...data,
    role: "proofreader",
  });
}
