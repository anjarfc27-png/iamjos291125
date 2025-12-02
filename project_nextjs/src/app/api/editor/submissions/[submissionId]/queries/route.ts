
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { SUBMISSION_STAGES } from "@/features/editor/types";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

/**
 * Queries API
 * GET: List all queries for a submission
 * POST: Create a new query
 * Based on OJS 3.3 queries system
 */
export async function GET(request: Request, context: RouteParams) {
  try {
    const { submissionId } = await context.params;

    if (!submissionId) {
      return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
    }

    // Check permissions
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
    const isEditorLike = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
      "copyeditor",
      "layout-editor",
      "proofreader",
    ]);

    let isAuthor = false;
    if (!isSiteAdmin && !isEditorLike) {
      const { data: participant } = await supabase
        .from("submission_participants")
        .select("submission_id")
        .eq("submission_id", submissionId)
        .eq("user_id", user.id)
        .eq("role", "author")
        .maybeSingle();
      isAuthor = !!participant;
    }

    if (!isSiteAdmin && !isEditorLike && !isAuthor) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Get queries with notes and participants
    const { data: queries, error: queriesError } = await supabase
      .from("queries")
      .select(
        `
        *,
        query_participants(user_id),
        notes:query_notes(*)
      `
      )
      .eq("submission_id", submissionId)
      .order("date_posted", { ascending: false });

    if (queriesError) {
      console.error("Error fetching queries:", queriesError);
      return NextResponse.json({ ok: false, message: "Gagal memuat queries." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, queries: queries ?? [] });
  } catch (error) {
    console.error("Error in GET queries:", error);
    return NextResponse.json({ ok: false, message: "Gagal memuat queries." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteParams) {
  try {
    const { submissionId } = await context.params;

    if (!submissionId) {
      return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
    }

    // Check permissions
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      stage?: string;
      title?: string | null;
      message?: string;
      participantIds?: string[];
    } | null;

    if (!body?.message || !body.stage) {
      return NextResponse.json({ ok: false, message: "Stage dan message wajib diisi." }, { status: 400 });
    }

    if (!SUBMISSION_STAGES.includes(body.stage as (typeof SUBMISSION_STAGES)[number])) {
      return NextResponse.json({ ok: false, message: "Stage tidak valid." }, { status: 400 });
    }

    if (!body.participantIds || body.participantIds.length === 0) {
      return NextResponse.json({ ok: false, message: "Minimal satu participant harus dipilih." }, { status: 400 });
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

    // Get the next sequence number for this submission and stage
    const { data: existingQueries } = await supabase
      .from("queries")
      .select("seq")
      .eq("submission_id", submissionId)
      .eq("stage_id", body.stage)
      .order("seq", { ascending: false })
      .limit(1);

    const nextSeq = existingQueries && existingQueries.length > 0 ? (existingQueries[0].seq as number) + 1 : 1;

    // Create query
    const { data: newQuery, error: queryError } = await supabase
      .from("queries")
      .insert({
        submission_id: submissionId,
        assoc_type: 517,
        assoc_id: submissionId,
        stage_id: body.stage,
        seq: nextSeq,
        date_posted: new Date().toISOString(),
        closed: false,
      })
      .select()
      .single();

    if (queryError || !newQuery) {
      console.error("Error creating query:", queryError);
      return NextResponse.json({ ok: false, message: "Gagal membuat query." }, { status: 500 });
    }

    // Add participants
    const participants = [
      user.id, // Creator is always a participant
      ...(body.participantIds || []).filter((id) => id !== user.id), // Add other participants
    ];

    const { error: participantsError } = await supabase.from("query_participants").insert(
      participants.map((participantId) => ({
        query_id: newQuery.id,
        user_id: participantId,
      }))
    );

    if (participantsError) {
      console.error("Error adding participants:", participantsError);
      // Continue even if participants fail - query is created
    }

    // Create initial note
    const { error: noteError } = await supabase.from("query_notes").insert({
      query_id: newQuery.id,
      user_id: user.id,
      title: body.title || null,
      contents: body.message,
      date_created: new Date().toISOString(),
    });

    if (noteError) {
      console.error("Error creating initial note:", noteError);
      // Continue even if note fails - query is created
    }

    // Log activity
    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "queries",
      message: `Membuat query baru: ${body.title || "Untitled"}`,
      metadata: {
        queryId: newQuery.id,
        stage: body.stage,
        participantCount: participants.length,
      },
    });

    return NextResponse.json({
      ok: true,
      query: newQuery,
      message: "Query berhasil dibuat.",
    });
  } catch (error) {
    console.error("Error in POST queries:", error);
    return NextResponse.json({ ok: false, message: "Gagal membuat query." }, { status: 500 });
  }
}



