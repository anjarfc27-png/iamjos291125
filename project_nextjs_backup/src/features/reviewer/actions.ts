"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserServer } from "@/lib/auth-server";

export type ActionResult<T = void> = {
  ok: boolean;
  error?: string;
  data?: T;
};

/**
 * Accept a review request
 */
export async function acceptReviewRequest(
  assignmentId: string,
  data?: {
    competingInterests?: string | null;
    privacyConsent?: boolean;
  }
): Promise<ActionResult> {
  try {
    const user = await getCurrentUserServer();
    
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdminClient();

    // Update review status to accepted
    const updateData: any = {
      status: "accepted",
      metadata: {
        date_confirmed: new Date().toISOString(),
      },
    };

    if (data?.competingInterests !== undefined) {
      updateData.metadata.competing_interests = data.competingInterests;
    }

    const { error } = await supabase
      .from("submission_reviews")
      .update(updateData)
      .eq("id", assignmentId)
      .eq("reviewer_id", user.id);

    if (error) {
      console.error("Error accepting review request:", error);
      return { ok: false, error: error.message || "Failed to accept review request" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error in acceptReviewRequest:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Decline a review request
 */
export async function declineReviewRequest(
  assignmentId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const user = await getCurrentUserServer();

    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    if (!reason || !reason.trim()) {
      return { ok: false, error: "Reason for declining is required" };
    }

    const supabase = getSupabaseAdminClient();

    // Update review status to declined
    const { error } = await supabase
      .from("submission_reviews")
      .update({
        status: "declined",
        metadata: {
          decline_reason: reason,
          date_declined: new Date().toISOString(),
        },
      })
      .eq("id", assignmentId)
      .eq("reviewer_id", user.id);

    if (error) {
      console.error("Error declining review request:", error);
      return { ok: false, error: error.message || "Failed to decline review request" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error in declineReviewRequest:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Save review draft
 */
export async function saveReviewDraft(data: {
  assignmentId: string;
  recommendation?: "accept" | "minor_revision" | "major_revision" | "reject" | null;
  commentsToAuthor?: string;
  commentsToEditor?: string;
  competingInterests?: string;
  reviewFormResponses?: Array<{ questionId: string; value: any }>;
}): Promise<ActionResult> {
  try {
    const user = await getCurrentUserServer();

    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdminClient();

    // Update review with draft data (don't change status)
    const updateData: any = {
      metadata: {
        draft_recommendation: data.recommendation,
        draft_comments_to_author: data.commentsToAuthor || "",
        draft_comments_to_editor: data.commentsToEditor || "",
        draft_competing_interests: data.competingInterests || "",
        draft_review_form_responses: data.reviewFormResponses || [],
        draft_saved_at: new Date().toISOString(),
      },
    };

    const { error } = await supabase
      .from("submission_reviews")
      .update(updateData)
      .eq("id", data.assignmentId)
      .eq("reviewer_id", user.id);

    if (error) {
      console.error("Error saving review draft:", error);
      return { ok: false, error: error.message || "Failed to save draft" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error in saveReviewDraft:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Submit a review
 */
export async function submitReview(data: {
  assignmentId: string;
  recommendation: "accept" | "minor_revision" | "major_revision" | "reject";
  commentsToAuthor: string;
  commentsToEditor: string;
  competingInterests?: string;
  reviewFormResponses?: Array<{ questionId: string; value: any }>;
}): Promise<ActionResult> {
  try {
    const user = await getCurrentUserServer();

    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdminClient();

    // Update review with submission data
    const updateData: any = {
      status: "completed",
      recommendation: data.recommendation,
      submitted_at: new Date().toISOString(),
      metadata: {
        comments_to_author: data.commentsToAuthor,
        comments_to_editor: data.commentsToEditor,
        competing_interests: data.competingInterests || "",
        date_completed: new Date().toISOString(),
        review_form_responses: data.reviewFormResponses || [],
      },
    };

    const { error } = await supabase
      .from("submission_reviews")
      .update(updateData)
      .eq("id", data.assignmentId)
      .eq("reviewer_id", user.id);

    if (error) {
      console.error("Error submitting review:", error);
      return { ok: false, error: error.message || "Failed to submit review" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error in submitReview:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

