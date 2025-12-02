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
    const { submissionId, reviewRoundId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await ensureDummyEditorData();

    const supabase = getSupabaseAdminClient();

    const { data: round } = await supabase
      .from("submission_review_rounds")
      .select("id, stage")
      .eq("id", reviewRoundId)
      .maybeSingle();

    if (!round) {
      throw new Error("Review round not found");
    }

    const reviewId = randomUUID();
    const metadata = {
      reviewMethod: data.reviewMethod,
      personalMessage: data.personalMessage,
    };

    const { error } = await supabase.from("submission_reviews").insert({
      id: reviewId,
      review_round_id: reviewRoundId,
      reviewer_id: data.reviewerId,
      assignment_date: new Date().toISOString(),
      due_date: data.dueDate ?? null,
      response_due_date: data.responseDueDate ?? null,
      status: "pending",
      metadata,
    });

    if (error) {
      throw new Error(error.message);
    }

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
      .from("submission_reviews")
      .select("review_round_id, reviewer_id, metadata, due_date, response_due_date")
      .eq("id", reviewId)
      .maybeSingle();

    if (fetchError || !existing) {
      throw new Error("Review assignment not found");
    }

    const { data: round } = await supabase
      .from("submission_review_rounds")
      .select("submission_id")
      .eq("id", existing.review_round_id)
      .maybeSingle();

    if (!round) {
      throw new Error("Review round not found");
    }

    const { userId } = await assertEditorAccess(round.submission_id);

    const updatedMetadata =
      data.personalMessage !== undefined
        ? { ...(existing.metadata ?? {}), personalMessage: data.personalMessage }
        : existing.metadata ?? {};

    const payload: Record<string, unknown> = {};
    if (data.dueDate !== undefined) {
      payload.due_date = data.dueDate;
    }
    if (data.responseDueDate !== undefined) {
      payload.response_due_date = data.responseDueDate;
    }
    if (data.personalMessage !== undefined) {
      payload.metadata = updatedMetadata;
    }

    if (Object.keys(payload).length === 0) {
      return {
        ok: true,
        message: "No changes applied",
      };
    }

    const { error } = await supabase
      .from("submission_reviews")
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
      .from("submission_reviews")
      .select("review_round_id")
      .eq("id", reviewId)
      .maybeSingle();

    if (fetchError || !existing) {
      throw new Error("Review assignment not found");
    }

    const { data: round } = await supabase
      .from("submission_review_rounds")
      .select("submission_id")
      .eq("id", existing.review_round_id)
      .maybeSingle();

    if (!round) {
      throw new Error("Review round not found");
    }

    const { userId } = await assertEditorAccess(round.submission_id);

    const { error } = await supabase.from("submission_reviews").delete().eq("id", reviewId);
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
