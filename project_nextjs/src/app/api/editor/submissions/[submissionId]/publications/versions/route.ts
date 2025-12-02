
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

/**
 * Create Publication Version API
 * POST: Create a new publication version
 * Based on OJS 3.3 version creation
 */
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
      description?: string;
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
    const canCreateVersion = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canCreateVersion) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Get current highest version number
    const { data: existingVersions } = await supabase
      .from("submission_versions")
      .select("version")
      .eq("submission_id", submissionId)
      .order("version", { ascending: false })
      .limit(1);

    const nextVersion = existingVersions && existingVersions.length > 0 ? ((existingVersions[0].version as number) || 1) + 1 : 1;

    // Create new version
    const { data: newVersion, error: createError } = await supabase
      .from("submission_versions")
      .insert({
        submission_id: submissionId,
        version: nextVersion,
        status: "queued",
        notes: body?.description || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError || !newVersion) {
      console.error("Error creating version:", createError);
      return NextResponse.json({ ok: false, message: "Gagal membuat versi baru." }, { status: 500 });
    }

    // Copy files from current version to new version
    // TODO: Implement file copying for new version

    // Log activity
    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "publication",
      message: `Created new version ${nextVersion}.`,
      metadata: {
        versionId: newVersion.id,
        version: nextVersion,
        description: body?.description,
      },
    });

    return NextResponse.json({
      ok: true,
      version: newVersion,
      message: `Version ${nextVersion} created successfully.`,
    });
  } catch (error) {
    console.error("Error in POST create version:", error);
    return NextResponse.json({ ok: false, message: "Gagal membuat versi baru." }, { status: 500 });
  }
}



