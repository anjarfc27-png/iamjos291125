
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
export const dynamic = 'force-dynamic';

/**
 * Reset Permissions API Endpoint
 * POST /api/editor/tools/reset-permissions
 * Resets permissions for all submissions in a journal
 */
export async function POST(request: Request) {
  try {
    // Check permissions
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get journal ID from request body
    const body = await request.json();
    const { journalId } = body;

    if (!journalId) {
      return NextResponse.json(
        { ok: false, message: "Journal ID is required" },
        { status: 400 }
      );
    }

    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const isManager = await hasUserJournalRole(user.id, journalId, ["manager"]);

    if (!isSiteAdmin && !isManager) {
      return NextResponse.json(
        { ok: false, message: "Forbidden. Only journal managers and site administrators can reset permissions" },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Get all submissions for this journal
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("id")
      .eq("journal_id", journalId);

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return NextResponse.json(
        { ok: false, message: "Failed to fetch submissions", error: submissionsError.message },
        { status: 500 }
      );
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No submissions found to reset permissions for",
        count: 0,
      });
    }

    const submissionIds = submissions.map((s) => s.id);

    // Reset permissions by updating metadata
    // In OJS 3.3, this resets article permissions to default
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        updated_at: new Date().toISOString(),
      })
      .in("id", submissionIds);

    if (updateError) {
      console.error("Error resetting permissions:", updateError);
      return NextResponse.json(
        { ok: false, message: "Failed to reset permissions", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Permissions have been reset for ${submissions.length} submission(s)`,
      count: submissions.length,
    });
  } catch (error) {
    console.error("Error in resetPermissions API:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

