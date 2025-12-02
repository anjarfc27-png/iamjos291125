
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
 * File Copy API
 * Copy files from other stages to the target stage
 * Based on OJS 3.3 file copying functionality
 */
export async function POST(request: Request, context: RouteParams) {
  try {
    const { submissionId } = await context.params;

    if (!submissionId) {
      return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
    }

    // Check permissions - editors, section editors, and managers (or site admin) can copy files
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      fileIds?: string[];
      targetStage?: string;
    } | null;

    if (!body?.fileIds || !Array.isArray(body.fileIds) || body.fileIds.length === 0) {
      return NextResponse.json({ ok: false, message: "File IDs wajib diisi." }, { status: 400 });
    }

    if (!body.targetStage || !SUBMISSION_STAGES.includes(body.targetStage as (typeof SUBMISSION_STAGES)[number])) {
      return NextResponse.json({ ok: false, message: "Tahap target tidak valid." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Resolve journal/context from submission
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("journal_id")
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionError || !submission) {
      return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 404 });
    }

    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const canManage = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canManage) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Get the files to copy
    const { data: sourceFiles, error: sourceError } = await supabase
      .from("submission_files")
      .select("*")
      .eq("submission_id", submissionId)
      .in("id", body.fileIds);

    if (sourceError || !sourceFiles || sourceFiles.length === 0) {
      return NextResponse.json({ ok: false, message: "File yang dipilih tidak ditemukan." }, { status: 404 });
    }

    // Copy files to target stage
    // In OJS 3.3, this creates new file records with the target stage
    const copiedFiles = sourceFiles.map((file) => ({
      submission_id: submissionId,
      label: file.label,
      stage: body.targetStage!,
      file_kind: file.file_kind || "manuscript",
      storage_path: file.storage_path, // Same storage path, just different stage
      version_label: file.version_label,
      round: file.round || 1,
      is_visible_to_authors: file.is_visible_to_authors || false,
      file_size: file.file_size || 0,
      uploaded_by: user.id, // Current user as the copier
      uploaded_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase.from("submission_files").insert(copiedFiles);

    if (insertError) {
      console.error("Error copying files:", insertError);
      return NextResponse.json({ ok: false, message: "Gagal menyalin file." }, { status: 500 });
    }

    // Log activity
    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "files",
      message: `Menyalin ${copiedFiles.length} file ke tahap ${body.targetStage}.`,
      metadata: {
        stage: body.targetStage,
        fileCount: copiedFiles.length,
        fileIds: body.fileIds,
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Berhasil menyalin ${copiedFiles.length} file ke tahap ${body.targetStage}.`,
    });
  } catch (error) {
    console.error("Error copying files:", error);
    return NextResponse.json({ ok: false, message: "Gagal menyalin file." }, { status: 500 });
  }
}



