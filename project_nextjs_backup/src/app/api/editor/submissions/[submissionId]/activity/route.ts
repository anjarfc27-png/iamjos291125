"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

export async function POST(request: Request, context: RouteParams) {
  const { submissionId } = await context.params;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  // Check permissions - only editors, section editors, and managers (or site admin) can add activity notes
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
  const canEdit = await hasUserJournalRole(user.id, submission.journal_id, [
    "manager",
    "editor",
    "section_editor",
  ]);

  if (!isSiteAdmin && !canEdit) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { message?: string } | null;
  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ ok: false, message: "Pesan wajib diisi." }, { status: 400 });
  }

  try {
    const { error } = await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "note",
      message,
      actor_id: user.id,
    });
    if (error) {
      throw error;
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Tidak dapat menambahkan catatan." }, { status: 500 });
  }
}

