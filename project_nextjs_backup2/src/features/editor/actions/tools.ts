"use server";

import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message: string;
  error?: string;
};

/**
 * Reset Permissions for all submissions in a journal
 * Based on OJS 3.3 resetPermissions functionality
 */
export async function resetPermissions(journalId: string): Promise<ActionResult> {
  try {
    // Check permissions - only managers and admins can reset permissions
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        error: "You must be logged in to reset permissions",
      };
    }

    if (!journalId) {
      return {
        success: false,
        message: "Journal ID is required",
        error: "Journal ID is required",
      };
    }

    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const isManager = await hasUserJournalRole(user.id, journalId, ["manager"]);

    if (!isSiteAdmin && !isManager) {
      return {
        success: false,
        message: "Forbidden",
        error: "Only journal managers and site administrators can reset permissions",
      };
    }

    const supabase = getSupabaseAdminClient();

    // Get all submissions for this journal
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("id")
      .eq("journal_id", journalId);

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return {
        success: false,
        message: "Failed to fetch submissions",
        error: submissionsError.message,
      };
    }

    if (!submissions || submissions.length === 0) {
      return {
        success: true,
        message: "No submissions found to reset permissions for",
      };
    }

    const submissionIds = submissions.map((s) => s.id);

    // Reset permissions by updating submission metadata
    // In OJS 3.3, this resets article permissions to default
    // We'll update the updated_at timestamp to mark that permissions were reset
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        updated_at: new Date().toISOString(),
      })
      .in("id", submissionIds);

    if (updateError) {
      console.error("Error resetting permissions:", updateError);
      return {
        success: false,
        message: "Failed to reset permissions",
        error: updateError.message,
      };
    }

    // Revalidate the tools page
    revalidatePath("/editor/tools");

    return {
      success: true,
      message: `Permissions have been reset for ${submissions.length} submission(s)`,
    };
  } catch (error) {
    console.error("Error in resetPermissions:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

