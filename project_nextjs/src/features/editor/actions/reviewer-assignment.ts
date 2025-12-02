"use server";

/**
 * Reviewer Assignment Server Actions
 * Based on OJS PKP 3.3 ReviewAssignmentDAO
 * 
 * These actions simulate reviewer assignment operations using dummy data.
 * In production, these will interact with the database.
 */

import { randomUUID } from "node:crypto";

import type { SubmissionStage } from "../types";
import {
  assertEditorAccess,
  logActivity,
} from "./workflow-helpers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureDummyEditorData } from "../dummy-sync";

type AssignReviewerData = {
  submissionId: string;
  stage: SubmissionStage;
  reviewRoundId: string;
  reviewerId: string;
  dueDate?: string;
  responseDueDate?: string;
  reviewMethod: "anonymous" | "doubleAnonymous" | "open";
  personalMessage?: string;
};

type UpdateReviewerData = {
  reviewId: string;
  dueDate?: string;
  responseDueDate?: string;
  personalMessage?: string;
};

type ActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
  reviewId?: string;
};

/**
 * Assign Reviewer
 * Based on OJS PKP 3.3 createReviewAssignment
 */
export async function assignReviewer(
  data: AssignReviewerData
): Promise<ActionResult> {
  try {
    const { submissionId, reviewRoundId, reviewerId, dueDate, responseDueDate } = data;
    const { userId } = await assertEditorAccess(submissionId);
    const supabase = getSupabaseAdminClient();

    const reviewId = randomUUID();
    const { error } = await supabase.from("review_assignments").insert({
      id: reviewId,
      submission_id: submissionId,
      review_round_id: reviewRoundId,
      reviewer_id: reviewerId,
      stage_id: 3, // Review stage
      date_assigned: new Date().toISOString(),
      date_due: dueDate,
      date_response_due: responseDueDate,
      status: 0, // Pending
    });

    if (error) throw new Error(error.message);

    await logActivity({
      submissionId,
      actorId: userId,
      category: "review",
      message: "Reviewer assigned.",
    });

    return {
      ok: true,
      message: "Reviewer assigned successfully",
      reviewId,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to assign reviewer",
    };
  }
}

/**
 * Update Reviewer Assignment
 * Based on OJS PKP 3.3 updateReviewAssignment
 */
export async function updateReviewerAssignment(
  data: UpdateReviewerData
): Promise<ActionResult> {
  try {
    const { reviewId } = data;
    const supabase = getSupabaseAdminClient();

    const { data: existing, error: fetchError } = await supabase
      .from("review_assignments")
      .select("review_round_id, reviewer_id, date_due, date_response_due")
      .eq("id", reviewId)
      .maybeSingle();

    if (fetchError || !existing) {
      throw new Error("Review assignment not found");
    }

    const { data: round } = await supabase
      .from("review_rounds")
      .select("submission_id")
      .eq("id", existing.review_round_id)
      .maybeSingle();

    if (!round) {
      throw new Error("Review round not found");
    }

    const { userId } = await assertEditorAccess(round.submission_id);

    const payload: Record<string, unknown> = {};
    if (data.dueDate !== undefined) {
      payload.date_due = data.dueDate;
    }
    if (data.responseDueDate !== undefined) {
      payload.date_response_due = data.responseDueDate;
    }
    // Personal message usually goes to email log, not stored in review_assignments metadata in OJS 3.3
    // So we ignore personalMessage update here unless we want to log it.

    if (Object.keys(payload).length === 0) {
      return {
        ok: true,
        message: "No changes applied",
      };
    }

    const { error } = await supabase
      .from("review_assignments")
      .update(payload)
      .eq("id", reviewId);

    if (error) {
      throw new Error(error.message);
    }

    await logActivity({
      submissionId: round.submission_id,
      actorId: userId,
      category: "review",
      message: "Reviewer assignment updated.",
    });

    return {
      ok: true,
      message: "Reviewer assignment updated successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update reviewer assignment",
    };
  }
}

/**
 * Remove Reviewer Assignment
 * Based on OJS PKP 3.3 deleteReviewAssignment
 */
export async function removeReviewerAssignment(
  reviewId: string
): Promise<ActionResult> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("review_assignments")
      .select("review_round_id")
      .eq("id", reviewId)
      .maybeSingle();

    if (fetchError || !existing) {
      throw new Error("Review assignment not found");
    }

    const { data: round } = await supabase
      .from("review_rounds")
      .select("submission_id")
      .eq("id", existing.review_round_id)
      .maybeSingle();

    if (!round) {
      throw new Error("Review round not found");
    }

    const { userId } = await assertEditorAccess(round.submission_id);

    const { error } = await supabase.from("review_assignments").delete().eq("id", reviewId);
    if (error) {
      throw new Error(error.message);
    }

    await logActivity({
      submissionId: round.submission_id,
      actorId: userId,
      category: "review",
      message: "Reviewer assignment removed.",
    });

    return {
      ok: true,
      message: "Reviewer assignment removed successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to remove reviewer assignment",
    };
  }
}
