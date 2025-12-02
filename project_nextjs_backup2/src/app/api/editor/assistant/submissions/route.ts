"use server";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasUserJournalRole, hasUserSiteRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/editor/assistant/submissions
 * Get submissions assigned to the current assistant user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();

    // Untuk sekarang, asumsikan assistant beroperasi dalam konteks satu jurnal yang dipilih
    const journalId = request.nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "Missing journalId" }, { status: 400 });
    }

    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const isAssistant = await hasUserJournalRole(user.id, journalId, ["copyeditor", "proofreader", "layout-editor"]);

    if (!isSiteAdmin && !isAssistant) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Get submissions assigned to this assistant via stage_assignments
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select(`
        id,
        title,
        current_stage,
        status,
        journal_id,
        created_at,
        updated_at,
        stage_assignments!inner(
          id,
          user_id,
          user_group_id,
          date_assigned
        )
      `)
      .eq("journal_id", journalId)
      .eq("stage_assignments.user_id", user.id);

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return NextResponse.json(
        { ok: false, message: "Failed to fetch submissions", error: submissionsError.message },
        { status: 500 }
      );
    }

    // Format submissions
    const formattedSubmissions = (submissions || []).map((submission: any) => ({
      id: submission.id,
      title: submission.title || "Untitled",
      stage: submission.current_stage,
      status: submission.status || "in_progress",
      journalId: submission.journal_id,
      createdAt: submission.created_at,
      updatedAt: submission.updated_at,
    }));

    return NextResponse.json({ ok: true, submissions: formattedSubmissions });
  } catch (error) {
    console.error("Error in GET /api/editor/assistant/submissions:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to fetch submissions",
      },
      { status: 500 }
    );
  }
}

