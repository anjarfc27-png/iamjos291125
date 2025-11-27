"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

/**
 * Unpublish Publication API
 * POST: Unpublish or unschedule a publication
 * Based on OJS 3.3 unpublish functionality
 */
export async function POST(request: NextRequest, context: RouteParams) {
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
      versionId?: string;
    } | null;

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
    const canUnpublish = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canUnpublish) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Get version to unpublish
    const versionId = body?.versionId;
    if (versionId) {
      // Update version status to unpublished
      const { error: updateError } = await supabase
        .from("submission_versions")
        .update({
          published_at: null,
          status: "queued",
        })
        .eq("id", versionId)
        .eq("submission_id", submissionId);

      if (updateError) {
        console.error("Error unpublishing version:", updateError);
        return NextResponse.json({ ok: false, message: "Gagal unpublish versi." }, { status: 500 });
      }
    } else {
      // Unpublish all versions
      const { error: updateError } = await supabase
        .from("submission_versions")
        .update({
          published_at: null,
          status: "queued",
        })
        .eq("submission_id", submissionId)
        .in("status", ["published", "scheduled"]);

      if (updateError) {
        console.error("Error unpublishing versions:", updateError);
        return NextResponse.json({ ok: false, message: "Gagal unpublish versi." }, { status: 500 });
      }
    }

    // Log activity
    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "publication",
      message: "Publication unpublished.",
      metadata: {
        versionId,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Publication unpublished successfully.",
    });
  } catch (error) {
    console.error("Error in POST unpublish:", error);
    return NextResponse.json({ ok: false, message: "Gagal unpublish." }, { status: 500 });
  }
}



