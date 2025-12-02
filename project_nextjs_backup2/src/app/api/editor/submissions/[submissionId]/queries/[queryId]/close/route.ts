"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string; queryId: string }>;
};

/**
 * Close Query API
 * POST: Close a query
 * Based on OJS 3.3 query close functionality
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
    const canClose = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canClose) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Verify query exists
    const { data: query, error: queryError } = await supabase
      .from("queries")
      .select("*")
      .eq("id", queryId)
      .eq("submission_id", submissionId)
      .single();

    if (queryError || !query) {
      return NextResponse.json({ ok: false, message: "Query tidak ditemukan." }, { status: 404 });
    }

    // Check if already closed
    if (query.closed) {
      return NextResponse.json({ ok: false, message: "Query sudah ditutup." }, { status: 400 });
    }

    // Close query
    const { error: updateError } = await supabase
      .from("queries")
      .update({
        closed: true,
        date_modified: new Date().toISOString(),
      })
      .eq("id", queryId);

    if (updateError) {
      console.error("Error closing query:", updateError);
      return NextResponse.json({ ok: false, message: "Gagal menutup query." }, { status: 500 });
    }

    // Log activity
    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "queries",
      message: `Menutup query.`,
      metadata: {
        queryId,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Query berhasil ditutup.",
    });
  } catch (error) {
    console.error("Error closing query:", error);
    return NextResponse.json({ ok: false, message: "Gagal menutup query." }, { status: 500 });
  }
}



