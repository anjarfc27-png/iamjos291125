"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserServer } from "@/lib/auth-server";

export type ActionResult<T = void> = {
  ok: boolean;
  error?: string;
  data?: T;
};

// Helper to map recommendation string to int
function mapRecommendationToInt(rec: string): number | null {
  switch (rec) {
    case "accept": return 1;
    case "minor_revision": return 2;
    case "major_revision": return 3; // Resubmit for Review
    case "reject": return 5; // Decline Submission
    default: return null;
  }
}

/**
 * Accept a review request
 */
export async function acceptReviewRequest(
  assignmentId: string,
  data?: {
    competingInterests?: string | null;
    privacyConsent?: boolean;
  },
  userId?: string
): Promise<ActionResult> {
  try {
    let user;
    if (userId) {
      user = { id: userId };
    } else {
      user = await getCurrentUserServer();
    }

    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdminClient();

    // Update review status to accepted (3)
    const updateData: any = {
      status: 3, // Accepted
    };

    const { error } = await supabase
      .from("review_assignments")
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
  reason: string,
  userId?: string
): Promise<ActionResult> {
  try {
    let user;
    if (userId) {
      user = { id: userId };
    } else {
      user = await getCurrentUserServer();
    }

    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    if (!reason || !reason.trim()) {
      return { ok: false, error: "Reason for declining is required" };
    }

    const supabase = getSupabaseAdminClient();

    // Update review status to declined (1)
    const { error } = await supabase
      .from("review_assignments")
      .update({
        status: 1, // Declined
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
}, userId?: string): Promise<ActionResult> {
  try {
    let user;
    if (userId) {
      user = { id: userId };
    } else {
      user = await getCurrentUserServer();
    }

    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdminClient();

    // Update review with draft data
    if (data.recommendation) {
      const recInt = mapRecommendationToInt(data.recommendation);
      if (recInt) {
        const { error } = await supabase
          .from("review_assignments")
          .update({ recommendation: recInt })
          .eq("id", data.assignmentId)
          .eq("reviewer_id", user.id);

        if (error) throw error;
      }
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
}, userId?: string): Promise<ActionResult> {
  try {
    let user;
    if (userId) {
      user = { id: userId };
    } else {
      user = await getCurrentUserServer();
    }

    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdminClient();

    const recInt = mapRecommendationToInt(data.recommendation);

    // Update review with submission data
    const updateData: any = {
      status: 5, // Completed
      recommendation: recInt,
      date_completed: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("review_assignments")
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
