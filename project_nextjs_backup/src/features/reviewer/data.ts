import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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
      .from("submission_reviews")
      .select(
        `
        id,
        reviewer_id,
        assignment_date,
        due_date,
        response_due_date,
        status,
        recommendation,
        submitted_at,
        metadata,
        review_round_id,
        submission_review_rounds!inner (
          id,
          submission_id,
          round,
          stage,
          submissions!inner (
            id,
            title,
            submitted_at,
            metadata,
            journal_id,
            journals:journal_id (
              title
            )
          )
        )
      `
      )
      .eq("reviewer_id", userId)
      .order("assignment_date", { ascending: false });

    if (error) {
      console.error("Error fetching reviewer assignments:", error);
      return [];
    }

    if (!reviews || reviews.length === 0) {
      return [];
    }

    // Map to our format
    const assignments: ReviewerAssignment[] = reviews.map((review: any) => {
      const roundData: any = review.submission_review_rounds;
      const round = Array.isArray(roundData) ? roundData[0] : roundData;
      const submissionsList: any[] | undefined = round?.submissions;
      const submission = Array.isArray(submissionsList) ? submissionsList[0] : submissionsList;

      // Extract author names from metadata
      const metadata = submission?.metadata as any;
      const authors = metadata?.authors || [];
      const authorNames = authors
        .map((a: any) => `${a.givenName || ""} ${a.familyName || ""}`.trim())
        .filter(Boolean)
        .join(", ");

      return {
        id: review.id,
        submissionId: submission?.id || "",
        submissionTitle: submission?.title || "Untitled",
        journalTitle: submission?.journals?.[0]?.title || undefined,
        reviewRoundId: round?.id || "",
        round: round?.round || 1,
        stage: round?.stage || "review",
        status: (review.status || "pending") as ReviewerAssignmentStatus,
        recommendation: (review.recommendation || null) as ReviewerRecommendation,
        assignmentDate: review.assignment_date,
        dueDate: review.due_date,
        responseDueDate: review.response_due_date,
        submittedAt: review.submitted_at,
        metadata: review.metadata || {},
        authorNames: authorNames || undefined,
        abstract: metadata?.abstract || undefined,
        submittedAtSubmission: submission?.submitted_at || undefined,
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
      .from("submission_reviews")
      .select(
        `
        id,
        reviewer_id,
        assignment_date,
        due_date,
        response_due_date,
        status,
        recommendation,
        submitted_at,
        metadata,
        review_round_id,
        submission_review_rounds!inner (
          id,
          submission_id,
          round,
          stage,
          submissions!inner (
            id,
            title,
            submitted_at,
            metadata,
            journal_id,
            journals:journal_id (
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

    const roundData: any = review.submission_review_rounds;
    const round = Array.isArray(roundData) ? roundData[0] : roundData;
    const submissionsList: any[] | undefined = round?.submissions;
    const submission = Array.isArray(submissionsList) ? submissionsList[0] : submissionsList;

    // Extract author names from metadata
    const metadata = submission?.metadata as any;
    const authors = metadata?.authors || [];
    const authorNames = authors
      .map((a: any) => `${a.givenName || ""} ${a.familyName || ""}`.trim())
      .filter(Boolean)
      .join(", ");

    return {
      id: review.id,
      submissionId: submission?.id || "",
      submissionTitle: submission?.title || "Untitled",
      journalTitle: submission?.journals?.[0]?.title || undefined,
      reviewRoundId: round?.id || "",
      round: round?.round || 1,
      stage: round?.stage || "review",
      status: (review.status || "pending") as ReviewerAssignmentStatus,
      recommendation: (review.recommendation || null) as ReviewerRecommendation,
      assignmentDate: review.assignment_date,
      dueDate: review.due_date,
      responseDueDate: review.response_due_date,
      submittedAt: review.submitted_at,
      metadata: review.metadata || {},
      authorNames: authorNames || undefined,
      abstract: metadata?.abstract || undefined,
      submittedAtSubmission: submission?.submitted_at || undefined,
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


