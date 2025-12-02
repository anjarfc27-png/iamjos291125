
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ taskId: string }>;
};

export async function PATCH(request: Request, context: RouteParams) {
  try {
    const { taskId } = await context.params;
    if (!taskId) {
      return NextResponse.json({ ok: false, error: "Task ID tidak ditemukan." }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      status?: "open" | "completed";
      assigneeId?: string | null;
      dueDate?: string | null;
    } | null;

    if (!body || (!body.status && body.assigneeId === undefined && body.dueDate === undefined)) {
      return NextResponse.json({ ok: false, error: "Tidak ada perubahan yang dikirimkan." }, { status: 400 });
    }

    if (body.status && !["open", "completed"].includes(body.status)) {
      return NextResponse.json({ ok: false, error: "Status task tidak valid." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingTask, error: fetchError } = await supabase
      .from("submission_tasks")
      .select("id, submission_id, stage, title, status, assignee_id")
      .eq("id", taskId)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ ok: false, error: "Task tidak ditemukan." }, { status: 404 });
    }

    // Resolve journal from submission
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("journal_id")
      .eq("id", existingTask.submission_id)
      .maybeSingle();

    if (submissionError || !submission) {
      return NextResponse.json({ ok: false, error: "Submission tidak ditemukan." }, { status: 404 });
    }

    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const isEditorRole = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
    ]);
    const isAssignee = existingTask.assignee_id === user.id;

    if (!isSiteAdmin && !isEditorRole && !isAssignee) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const payload: Record<string, unknown> = {};
    if (body.status) {
      payload.status = body.status;
    }
    if (body.assigneeId !== undefined) {
      payload.assignee_id = body.assigneeId || null;
    }
    if (body.dueDate !== undefined) {
      payload.due_date = body.dueDate || null;
    }
    payload.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase.from("submission_tasks").update(payload).eq("id", taskId);
    if (updateError) {
      throw updateError;
    }

    const actions: string[] = [];
    if (body.status) {
      actions.push(`status menjadi ${body.status}`);
    }
    if (body.assigneeId !== undefined) {
      actions.push(body.assigneeId ? `ditugaskan ke ${body.assigneeId}` : "dilepas dari assignee");
    }
    if (body.dueDate !== undefined) {
      actions.push(body.dueDate ? `jatuh tempo ${body.dueDate}` : "jatuh tempo dihapus");
    }

    if (actions.length > 0) {
      await supabase.from("submission_activity_logs").insert({
        submission_id: existingTask.submission_id,
        category: "tasks",
        message: `Task "${existingTask.title}" ${actions.join(", ")}.`,
        metadata: {
          taskId,
          stage: existingTask.stage,
          updatedBy: user.id,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ ok: false, error: "Gagal memperbarui task." }, { status: 500 });
  }
}




