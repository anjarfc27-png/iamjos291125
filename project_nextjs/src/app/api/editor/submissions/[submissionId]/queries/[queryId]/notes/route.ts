"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string; queryId: string }>;
};

/**
 * Query Notes API
 * POST: Add a note to a query
 * Based on OJS 3.3 query notes system
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { submissionId, queryId } = await context.params;

    if (!submissionId || !queryId) {
      return NextResponse.json({ ok: false, message: "Submission ID atau Query ID tidak ditemukan." }, { status: 400 });
    }

    // Check permissions
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      contents?: string;
      title?: string | null;
    } | null;

    if (!body?.contents || !body.contents.trim()) {
      return NextResponse.json({ ok: false, message: "Isi note wajib diisi." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Verify query exists and user is a participant
    const { data: query, error: queryError } = await supabase
      .from("queries")
      .select(
        `
        *,
        query_participants(user_id)
      `
      )
      .eq("id", queryId)
      .eq("submission_id", submissionId)
      .single();

    if (queryError || !query) {
      return NextResponse.json({ ok: false, message: "Query tidak ditemukan." }, { status: 404 });
    }

    // Check if user is a participant (or has editor permissions for the journal)
    const isParticipant = (query.query_participants as { user_id: string }[]).some((p) => p.user_id === user.id);

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("journal_id")
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionError || !submission) {
      return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 404 });
    }

    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const isEditorLike = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isParticipant && !isSiteAdmin && !isEditorLike) {
      return NextResponse.json({ ok: false, message: "Anda tidak memiliki akses ke query ini." }, { status: 403 });
    }

    // Add note
    const { data: newNote, error: noteError } = await supabase
      .from("query_notes")
      .insert({
        query_id: queryId,
        user_id: user.id,
        title: body.title || null,
        contents: body.contents.trim(),
        date_created: new Date().toISOString(),
      })
      .select()
      .single();

    if (noteError || !newNote) {
      console.error("Error adding note:", noteError);
      return NextResponse.json({ ok: false, message: "Gagal menambahkan note." }, { status: 500 });
    }

    // Update query modified date
    await supabase
      .from("queries")
      .update({ date_modified: new Date().toISOString() })
      .eq("id", queryId);

    // Log activity
    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "queries",
      message: `Menambahkan note ke query.`,
      metadata: {
        queryId,
        noteId: newNote.id,
      },
    });

    return NextResponse.json({
      ok: true,
      note: newNote,
      message: "Note berhasil ditambahkan.",
    });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json({ ok: false, message: "Gagal menambahkan note." }, { status: 500 });
  }
}



