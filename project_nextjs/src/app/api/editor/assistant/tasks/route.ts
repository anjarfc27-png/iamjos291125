
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasUserJournalRole, hasUserSiteRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
export const dynamic = 'force-dynamic';

/**
 * GET /api/editor/assistant/tasks
 * Get tasks assigned to the current assistant user
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();

    const journalId = (request as any).nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "Missing journalId" }, { status: 400 });
    }

    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const isAssistant = await hasUserJournalRole(user.id, journalId, ["copyeditor", "proofreader", "layout-editor"]);

    if (!isSiteAdmin && !isAssistant) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Get submissions assigned to this assistant
    // In OJS, assistants are assigned to submissions via stage_assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from("stage_assignments")
      .select(`
        id,
        submission_id,
        user_group_id,
        date_assigned,
        submissions!inner(
          id,
          title,
          current_stage,
          status,
          journal_id,
          created_at,
          updated_at
        )
      `)
      .eq("submissions.journal_id", journalId)
      .eq("user_id", user.id);

    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError);
      return NextResponse.json(
        { ok: false, message: "Failed to fetch tasks", error: assignmentsError.message },
        { status: 500 }
      );
    }

    // Format tasks
    const tasks = (assignments || []).map((assignment: any) => ({
      id: assignment.id,
      submissionId: assignment.submission_id,
      submissionTitle: assignment.submissions?.title || "Untitled",
      stage: assignment.submissions?.current_stage || 1,
      status: assignment.submissions?.status || "in_progress",
      dateAssigned: assignment.date_assigned,
      createdAt: assignment.submissions?.created_at,
      updatedAt: assignment.submissions?.updated_at,
    }));

    return NextResponse.json({ ok: true, tasks });
  } catch (error) {
    console.error("Error in GET /api/editor/assistant/tasks:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to fetch tasks",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/editor/assistant/tasks
 * Assign a task to an assistant
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const journalId = (request as any).nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "Missing journalId" }, { status: 400 });
    }

    // Only managers and editors (or site admin) can assign tasks in this journal
    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const canManage = await hasUserJournalRole(user.id, journalId, ["manager", "editor", "section_editor"]);

    if (!isSiteAdmin && !canManage) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { submissionId, assistantId, userGroupId } = body;

    if (!submissionId || !assistantId || !userGroupId) {
      return NextResponse.json(
        { ok: false, message: "submissionId, assistantId, and userGroupId are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Get the submission to verify it exists and get journal context
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("id, journal_id")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { ok: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // Create assignment
    const { data, error } = await supabase
      .from("stage_assignments")
      .insert({
        submission_id: submissionId,
        user_id: assistantId,
        user_group_id: userGroupId,
        date_assigned: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating assignment:", error);
      return NextResponse.json(
        { ok: false, message: "Failed to assign task", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, assignment: data });
  } catch (error) {
    console.error("Error in POST /api/editor/assistant/tasks:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to assign task",
      },
      { status: 500 }
    );
  }
}

