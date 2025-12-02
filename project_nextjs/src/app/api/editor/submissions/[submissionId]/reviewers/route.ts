
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

export async function POST(request: Request, context: RouteParams) {
  const { submissionId } = await context.params;
  
  // Check permissions - only editors, section editors, and managers (or site admin) can assign reviewers
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
  const canAssign = await hasUserJournalRole(user.id, submission.journal_id, [
    "manager",
    "editor",
    "section_editor",
  ]);

  if (!isSiteAdmin && !canAssign) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
  
  const body = (await request.json().catch(() => null)) as { roundId?: string; reviewerId?: string; dueDate?: string } | null;
  const roundId = body?.roundId;
  const reviewerId = body?.reviewerId;
  const dueDate = body?.dueDate ?? null;

  if (!roundId || !reviewerId) {
    return NextResponse.json({ ok: false, message: "Data reviewer tidak lengkap." }, { status: 400 });
  }

  const { error } = await supabase.from("submission_reviews").insert({
    review_round_id: roundId,
    reviewer_id: reviewerId,
    due_date: dueDate,
  });

  if (error) {
    return NextResponse.json({ ok: false, message: "Tidak dapat menugaskan reviewer." }, { status: 500 });
  }

  await supabase.from("submission_activity_logs").insert({
    submission_id: submissionId,
    category: "review",
    message: `Menugaskan reviewer ${reviewerId} pada round ${roundId}.`,
    metadata: { reviewerId, roundId },
    actor_id: user.id,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteParams) {
  const { submissionId } = await context.params;
  const body = (await request.json().catch(() => null)) as { reviewId?: string } | null;
  const reviewId = body?.reviewId;

  if (!reviewId) {
    return NextResponse.json({ ok: false, message: "Review tidak ditemukan." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("submission_reviews").delete().eq("id", reviewId);
  if (error) {
    return NextResponse.json({ ok: false, message: "Tidak dapat menghapus reviewer." }, { status: 500 });
  }

  await supabase.from("submission_activity_logs").insert({
    submission_id: submissionId,
    category: "review",
    message: `Menghapus reviewer dari round.`,
    metadata: { reviewId },
  });

  return NextResponse.json({ ok: true });
}

