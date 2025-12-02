"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { SUBMISSION_STAGES } from "@/features/editor/types";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { submissionId } = await context.params;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  try {
    // Check permissions - editors, section editors, and managers (or site admin) can view review rounds
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("journal_id")
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionError || !submission) {
      return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 404 });
    }

    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const canView = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canView) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }
    const { data, error } = await supabase
      .from("submission_review_rounds")
      .select(
        `
        id,
        stage,
        round,
        status,
        started_at,
        closed_at,
        notes,
        submission_reviews (
          id,
          reviewer_id,
          assignment_date,
          due_date,
          response_due_date,
          status,
          recommendation,
          submitted_at
        )
      `,
      )
      .eq("submission_id", submissionId)
      .order("round", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ ok: true, rounds: data ?? [] });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal memuat review round." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  const { submissionId } = await context.params;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  // Check permissions - only editors, section editors, and managers can create review rounds
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("journal_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submission) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 404 });
  }

  const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
  const canCreate = await hasUserJournalRole(user.id, submission.journal_id, [
    "manager",
    "editor",
    "section_editor",
  ]);

  if (!isSiteAdmin && !canCreate) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { stage?: string; notes?: string | null } | null;
  const stage = body?.stage ?? "review";
  if (!SUBMISSION_STAGES.includes(stage as (typeof SUBMISSION_STAGES)[number])) {
    return NextResponse.json({ ok: false, message: "Tahap review tidak valid." }, { status: 400 });
  }

  try {
    const { data: existingRounds } = await supabase
      .from("submission_review_rounds")
      .select("round")
      .eq("submission_id", submissionId)
      .eq("stage", stage);
    const nextRoundNumber = (existingRounds?.length ?? 0) + 1;

    const { error } = await supabase
      .from("submission_review_rounds")
      .insert({
        submission_id: submissionId,
        stage,
        round: nextRoundNumber,
        status: "active",
        notes: body?.notes ?? null,
      });
    if (error) throw error;

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "workflow",
      message: `Membuka review round ${nextRoundNumber} pada tahap ${stage}.`,
      metadata: { stage, round: nextRoundNumber },
      actor_id: user.id,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal membuat review round." }, { status: 500 });
  }
}
