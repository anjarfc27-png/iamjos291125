
import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  EditorDecisionType,
  SubmissionStage,
  SubmissionStatus,
} from "@/features/editor/types";
import {
  SUBMISSION_EDITOR_DECISION_ACCEPT,
  SUBMISSION_EDITOR_DECISION_DECLINE,
  SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW,
  SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE,
  SUBMISSION_EDITOR_DECISION_NEW_ROUND,
  SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS,
  SUBMISSION_EDITOR_DECISION_RESUBMIT,
  SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
  SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
  SUBMISSION_STAGES,
} from "@/features/editor/types";
import { saveEditorDecision } from "@/features/editor/actions/editor-decisions";
import {
  assertEditorAccess,
  getSubmissionRow,
  requestAuthorCopyeditAction,
  logActivity,
} from "@/features/editor/actions/workflow-helpers";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

const ACTION_TO_DECISION: Partial<Record<string, EditorDecisionType>> = {
  send_to_review: SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW,
  send_to_copyediting: SUBMISSION_EDITOR_DECISION_ACCEPT,
  decline_submission: SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE,
  accept: SUBMISSION_EDITOR_DECISION_ACCEPT,
  pending_revisions: SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS,
  resubmit_for_review: SUBMISSION_EDITOR_DECISION_RESUBMIT,
  decline: SUBMISSION_EDITOR_DECISION_DECLINE,
  new_review_round: SUBMISSION_EDITOR_DECISION_NEW_ROUND,
  send_to_production: SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
  revert_decline: SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
};

const ACTION_TRANSITIONS: Record<
  string,
  { nextStage?: SubmissionStage; status?: SubmissionStatus }
> = {
  send_to_review: { nextStage: "review", status: "in_review" },
  send_to_copyediting: { nextStage: "copyediting", status: "accepted" },
  decline_submission: { status: "declined" },
  accept: { nextStage: "copyediting", status: "accepted" },
  pending_revisions: { status: "in_review" },
  resubmit_for_review: { status: "in_review" },
  decline: { status: "declined" },
  new_review_round: { status: "in_review" },
  send_to_production: { nextStage: "production", status: "accepted" },
  request_author_copyedit: { status: "accepted" },
  schedule_publication: { status: "scheduled" },
  publish: { status: "published" },
  send_to_issue: { status: "scheduled" },
};

const ACTION_MESSAGES: Record<string, string> = {
  send_to_review: "Submission sent to review stage",
  send_to_copyediting: "Submission sent to copyediting stage",
  decline_submission: "Submission declined at initial stage",
  accept: "Submission accepted",
  pending_revisions: "Revisions requested from author",
  resubmit_for_review: "Author requested to resubmit for review",
  decline: "Submission declined after review",
  new_review_round: "New review round initiated",
  send_to_production: "Submission sent to production",
  request_author_copyedit: "Author requested for copyediting",
  schedule_publication: "Publication scheduled",
  publish: "Submission published",
  send_to_issue: "Submission assigned to issue",
};

function getDecisionMessage(action: string, targetStage?: SubmissionStage, status?: SubmissionStatus) {
  const message = ACTION_MESSAGES[action];
  if (message) {
    return message;
  }
  if (targetStage || status) {
    return `Workflow updated${targetStage ? ` to stage ${targetStage}` : ""}${
      status ? ` with status ${status}` : ""
    }`;
  }
  return `Workflow updated: ${action}`;
}

function getManualUpdateMessage(targetStage?: SubmissionStage, status?: SubmissionStatus, note?: string) {
  if (note) {
    return note;
  }
  if (targetStage || status) {
    return `Workflow manually updated${targetStage ? ` to stage ${targetStage}` : ""}${
      status ? ` with status ${status}` : ""
    }`;
  }
  return "Workflow updated.";
}

export async function POST(request: Request, context: RouteParams) {
  const { submissionId } = await context.params;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as {
    action?: string;
    targetStage?: SubmissionStage;
    status?: SubmissionStatus;
    note?: string;
  } | null;

  if (!body || (!body.action && !body.targetStage && !body.status && !body.note)) {
    return NextResponse.json({ ok: false, message: "Permintaan tidak valid." }, { status: 400 });
  }

  if (body.targetStage && !SUBMISSION_STAGES.includes(body.targetStage)) {
    return NextResponse.json({ ok: false, message: "Tahap workflow tidak valid." }, { status: 400 });
  }

  const action = body.action;
  const mappedDecision = action ? ACTION_TO_DECISION[action] : undefined;
  const fallbackTransition = action ? ACTION_TRANSITIONS[action] : undefined;

  // Handle editorial decision actions using the canonical server action implementation
  if (action && mappedDecision) {
    try {
      const submission = await getSubmissionRow(submissionId);
      const result = await saveEditorDecision({
        submissionId,
        stage: submission.current_stage,
        decision: mappedDecision,
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan keputusan editorial.";
      const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
      return NextResponse.json({ ok: false, message }, { status });
    }
  }

  if (action === "request_author_copyedit") {
    try {
      await requestAuthorCopyeditAction(submissionId);
      return NextResponse.json({
        ok: true,
        message: "Copyediting request sent to author.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengirim permintaan copyediting.";
      const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
      return NextResponse.json({ ok: false, message }, { status });
    }
  }

  if (action === "send_to_issue") {
    try {
      const { userId } = await assertEditorAccess(submissionId);
      const supabase = getSupabaseAdminClient();

      const { data: latestVersion, error: versionError } = await supabase
        .from("submission_versions")
        .select("id, issue_id")
        .eq("submission_id", submissionId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (versionError || !latestVersion) {
        return NextResponse.json({ ok: false, message: "Versi submission tidak ditemukan." }, { status: 404 });
      }

      if (!latestVersion.issue_id) {
        return NextResponse.json(
          { ok: false, message: "Assign submission ke issue terlebih dahulu pada tab Publication → Issue." },
          { status: 400 }
        );
      }

      await supabase
        .from("submission_versions")
        .update({ status: "scheduled" })
        .eq("id", latestVersion.id);

      await supabase
        .from("submissions")
        .update({ status: "scheduled", updated_at: new Date().toISOString() })
        .eq("id", submissionId);

      await logActivity({
        submissionId,
        actorId: userId,
        category: "publication",
        message: "Submission marked as scheduled (issue assigned).",
      });

      return NextResponse.json({
        ok: true,
        message: "Submission telah dijadwalkan pada issue yang dipilih.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengirim submission ke issue.";
      const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
      return NextResponse.json({ ok: false, message }, { status });
    }
  }

  if (action && !fallbackTransition) {
    return NextResponse.json(
      { ok: false, message: "Editorial decision belum didukung oleh workflow iamJOS." },
      { status: 400 }
    );
  }

  // Manual stage/status update path (legacy / fallback)
  try {
    const { userId } = await assertEditorAccess(submissionId);
    const supabase = getSupabaseAdminClient();
    const updates: Record<string, unknown> = {};

    const targetStage = body.targetStage ?? fallbackTransition?.nextStage;
    const targetStatus = body.status ?? fallbackTransition?.status;

    if (targetStage) {
      updates.current_stage = targetStage;
    }
    if (targetStatus) {
      updates.status = targetStatus;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("submissions").update(updates).eq("id", submissionId);
      if (error) {
        throw error;
      }
    }

    const logMessage = action
      ? body.note || getDecisionMessage(action, targetStage, targetStatus)
      : getManualUpdateMessage(targetStage, targetStatus, body.note);

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "workflow",
      message: logMessage,
      actor_id: userId,
      metadata: {
        action: action || "manual_update",
        targetStage: targetStage ?? null,
        status: targetStatus ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui workflow.";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

