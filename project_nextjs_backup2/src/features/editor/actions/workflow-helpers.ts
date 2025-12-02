"use server";

import { randomUUID } from "node:crypto";

import { getCurrentUser, hasUserJournalRole, hasUserSiteRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { ensureDummyEditorData } from "../dummy-sync";
import type { SubmissionStage, SubmissionStatus } from "../types";
import { STAGE_NAME_TO_ID } from "../dummy-data";

export type SubmissionRow = {
  id: string;
  journal_id: string;
  current_stage: SubmissionStage;
  status: SubmissionStatus;
  is_archived: boolean;
  updated_at: string;
};

export type ReviewRoundStatus =
  | "active"
  | "completed"
  | "revisions_requested"
  | "resubmitted";

type RecordDecisionParams = {
  submissionId: string;
  stage: SubmissionStage;
  decision: number;
  actorId: string;
  reviewRoundId?: string;
};

export async function assertEditorAccess(submissionId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("journal_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  // Site admin always has access
  const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
  if (isSiteAdmin) {
    return { userId: user.id, journalId: data.journal_id };
  }

  // Check journal-level roles using OJS user_groups / user_user_groups
  const hasJournalRole = await hasUserJournalRole(user.id, data.journal_id, [
    "manager",
    "editor",
    "section_editor",
  ]);

  if (!hasJournalRole) {
    throw new Error("Forbidden");
  }

  return { userId: user.id, journalId: data.journal_id };
}

export async function getSubmissionRow(submissionId: string): Promise<SubmissionRow> {
  await ensureDummyEditorData();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id, journal_id, current_stage, status, is_archived, updated_at")
    .eq("id", submissionId)
    .single();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  return data as SubmissionRow;
}

export async function updateActiveReviewRoundStatus(
  submissionId: string,
  stage: SubmissionStage,
  status: ReviewRoundStatus
) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submission_review_rounds")
    .select("id")
    .eq("submission_id", submissionId)
    .eq("stage", stage)
    .order("round", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return;
  }

  const updatePayload: Record<string, unknown> = { status };
  if (status === "completed" || status === "resubmitted") {
    updatePayload.closed_at = new Date().toISOString();
  } else if (status === "revisions_requested") {
    updatePayload.closed_at = null;
  }

  const { error: updateError } = await supabase
    .from("submission_review_rounds")
    .update(updatePayload)
    .eq("id", data.id);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export async function logActivity(params: {
  submissionId: string;
  actorId: string;
  category: string;
  message: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("submission_activity_logs").insert({
    id: randomUUID(),
    submission_id: params.submissionId,
    actor_id: params.actorId,
    category: params.category,
    message: params.message,
    metadata: {},
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function getNextRoundNumber(submissionId: string, stage: SubmissionStage) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submission_review_rounds")
    .select("round")
    .eq("submission_id", submissionId)
    .eq("stage", stage)
    .order("round", { ascending: false })
    .limit(1);
  if (error) {
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    return 1;
  }
  return (data[0].round ?? 0) + 1;
}

export async function createReviewRound(submissionId: string, stage: SubmissionStage, round?: number) {
  const supabase = getSupabaseAdminClient();
  const nextRound = round ?? (await getNextRoundNumber(submissionId, stage));
  const { error } = await supabase.from("submission_review_rounds").insert({
    id: randomUUID(),
    submission_id: submissionId,
    stage,
    round: nextRound,
    status: "active",
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function requestAuthorCopyeditAction(submissionId: string) {
  const { userId } = await assertEditorAccess(submissionId);
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("submissions")
    .update({
      status: "in_copyediting",
      current_stage: "copyediting",
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }

  await logActivity({
    submissionId,
    actorId: userId,
    category: "copyediting",
    message: "Author copyediting has been requested.",
  });
}

async function getLatestReviewRoundId(submissionId: string, stage: SubmissionStage) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("submission_review_rounds")
    .select("id")
    .eq("submission_id", submissionId)
    .eq("stage", stage)
    .order("round", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

export async function recordEditorDecision({
  submissionId,
  stage,
  decision,
  actorId,
  reviewRoundId,
}: RecordDecisionParams) {
  const supabase = getSupabaseAdminClient();
  let roundId = reviewRoundId;

  if (!roundId && (stage === "review" || stage === "submission")) {
    roundId = await getLatestReviewRoundId(submissionId, "review");
  }

  const payload: Record<string, unknown> = {
    id: randomUUID(),
    submission_id: submissionId,
    stage_id: STAGE_NAME_TO_ID[stage] ?? null,
    editor_id: actorId,
    decision,
    date_decided: new Date().toISOString(),
  };

  if (roundId) {
    payload.review_round_id = roundId;
  }

  const { error } = await supabase.from("edit_decisions").insert(payload);
  if (error) {
    throw new Error(error.message);
  }
}

