import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapReviewStatus, mapRecommendation, mapStageId } from "@/features/editor/data";

export type ReviewerAssignmentStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled";

export type ReviewerRecommendation = "accept" | "minor_revision" | "major_revision" | "reject" | null;

export interface ReviewerAssignment {
  id: string;
  submissionId: string;
  submissionTitle: string;
  journalTitle?: string;
  reviewRoundId: string;
  round: number;
  stage: string;
  status: ReviewerAssignmentStatus;
  recommendation: ReviewerRecommendation;
  assignmentDate: string;
  dueDate: string | null;
  responseDueDate: string | null;
  submittedAt: string | null;
  metadata: Record<string, any>;
  // Submission details
  authorNames?: string;
  abstract?: string;
  submittedAtSubmission?: string;
}

/**
 * Get all reviewer assignments for the current user
 */
export async function getReviewerAssignments(userId: string): Promise<ReviewerAssignment[]> {
  const supabase = getSupabaseAdminClient();

  try {
    const { data: reviews, error } = await supabase
      .from("review_assignments")
      .select(
        `
        id,
        reviewer_id,
        date_assigned,
        date_due,
        date_response_due,
        status,
        recommendation,
        date_completed,
        review_round_id,
        review_rounds!inner (
          id,
          submission_id,
          round,
          stage_id,
          submissions!inner (
            id,
            date_submitted,
            context_id,
            current_publication_id,
            journals:context_id (
              title
            )
          )
        )
      `
      )
      .eq("reviewer_id", userId)
      .order("date_assigned", { ascending: false });

    if (error) {
      console.error("Error fetching reviewer assignments:", error);
      return [];
    }

    if (!reviews || reviews.length === 0) {
      return [];
    }

    // Fetch titles
    const pubIds = reviews.map((r: any) => r.review_rounds?.submissions?.current_publication_id).filter(Boolean);
    let titleMap = new Map<string, string>();
    if (pubIds.length > 0) {
      const { data: titles } = await supabase
        .from("publication_settings")
        .select("publication_id, setting_value")
        .in("publication_id", pubIds)
        .eq("setting_name", "title");

      titles?.forEach((t: any) => titleMap.set(t.publication_id, t.setting_value));
    }

    // Map to our format
    const assignments: ReviewerAssignment[] = reviews.map((review: any) => {
      const round = review.review_rounds;
      const submission = round?.submissions;
      const journal = submission?.journals;

      // Extract author names from metadata - Not available in submissions table anymore
      // Would need to fetch from authors table or publication_authors
      // For now, leaving as undefined or "Unknown"
      const authorNames = undefined;

      return {
        id: review.id,
        submissionId: submission?.id || "",
        submissionTitle: titleMap.get(submission?.current_publication_id) || "Untitled",
        journalTitle: journal?.title || undefined,
        reviewRoundId: round?.id || "",
        round: round?.round || 1,
        stage: mapStageId(round?.stage_id || 3),
        status: mapReviewStatus(review.status) as ReviewerAssignmentStatus,
        recommendation: mapRecommendation(review.recommendation) as ReviewerRecommendation,
        assignmentDate: review.date_assigned,
        dueDate: review.date_due,
        responseDueDate: review.date_response_due,
        submittedAt: review.date_completed,
        metadata: {}, // No metadata in review_assignments
        authorNames: authorNames,
        abstract: undefined, // Need to fetch from publication_settings 'abstract'
        submittedAtSubmission: submission?.date_submitted || undefined,
      };
    });

    return assignments;
  } catch (error) {
    console.error("Error in getReviewerAssignments:", error);
    return [];
  }
}

/**
 * Get a single reviewer assignment by ID
 */
export async function getReviewerAssignment(
  assignmentId: string,
  userId: string
): Promise<ReviewerAssignment | null> {
  const supabase = getSupabaseAdminClient();

  try {
    const { data: review, error } = await supabase
      .from("review_assignments")
      .select(
        `
        id,
        reviewer_id,
        date_assigned,
        date_due,
        date_response_due,
        status,
        recommendation,
        date_completed,
        review_round_id,
        review_rounds!inner (
          id,
          submission_id,
          round,
          stage_id,
          submissions!inner (
            id,
            date_submitted,
            context_id,
            current_publication_id,
            journals:context_id (
              title
            )
          )
        )
      `
      )
      .eq("id", assignmentId)
      .eq("reviewer_id", userId)
      .single();

    if (error || !review) {
      console.error("Error fetching reviewer assignment:", error);
      return null;
    }

    const round = review.review_rounds as any;
    const submission = round?.submissions;
    const journal = submission?.journals;

    let title = "Untitled";
    let abstract = undefined;

    if (submission?.current_publication_id) {
      const { data: settings } = await supabase
        .from("publication_settings")
        .select("setting_name, setting_value")
        .eq("publication_id", submission.current_publication_id)
        .in("setting_name", ["title", "abstract"]);

      if (settings) {
        const t = settings.find((s: any) => s.setting_name === "title");
        if (t) title = t.setting_value;
        const a = settings.find((s: any) => s.setting_name === "abstract");
        if (a) abstract = a.setting_value;
      }
    }

    return {
      id: review.id,
      submissionId: submission?.id || "",
      submissionTitle: title,
      journalTitle: journal?.name || undefined,
      reviewRoundId: round?.id || "",
      round: round?.round || 1,
      stage: mapStageId(round?.stage_id || 3),
      status: mapReviewStatus(review.status) as ReviewerAssignmentStatus,
      recommendation: mapRecommendation(review.recommendation) as ReviewerRecommendation,
      assignmentDate: review.date_assigned,
      dueDate: review.date_due,
      responseDueDate: review.date_response_due,
      submittedAt: review.date_completed,
      metadata: {},
      authorNames: undefined,
      abstract: abstract,
      submittedAtSubmission: submission?.date_submitted || undefined,
    };
  } catch (error) {
    console.error("Error in getReviewerAssignment:", error);
    return null;
  }
}

/**
 * Get pending assignments (not yet accepted/declined)
 */
export async function getPendingReviewerAssignments(userId: string): Promise<ReviewerAssignment[]> {
  const assignments = await getReviewerAssignments(userId);
  return assignments.filter((a) => a.status === "pending");
}

/**
 * Get active assignments (accepted but not completed)
 */
export async function getActiveReviewerAssignments(userId: string): Promise<ReviewerAssignment[]> {
  const assignments = await getReviewerAssignments(userId);
  return assignments.filter((a) => a.status === "accepted" && !a.submittedAt);
}

/**
 * Get completed assignments
 */
export async function getCompletedReviewerAssignments(userId: string): Promise<ReviewerAssignment[]> {
  const assignments = await getReviewerAssignments(userId);
  return assignments.filter((a) => a.status === "completed" || a.submittedAt !== null);
}


