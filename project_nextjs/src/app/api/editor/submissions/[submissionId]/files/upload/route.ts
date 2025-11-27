"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { SUBMISSION_STAGES } from "@/features/editor/types";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

/**
 * File Upload API
 * Upload a file to Supabase Storage and create file record
 * Based on OJS 3.3 file upload functionality
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { submissionId } = await context.params;

    if (!submissionId) {
      return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
    }

    // Check permissions - only editors, section editors, and managers (or site admin) can upload files
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
    const canUpload = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canUpload) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const label = formData.get("label") as string | null;
    const stage = formData.get("stage") as string | null;
    const fileKind = (formData.get("kind") as string | null) || "manuscript";
    const versionLabel = formData.get("versionLabel") as string | null;
    const round = parseInt((formData.get("round") as string | null) || "1", 10);
    const isVisibleToAuthors = formData.get("isVisibleToAuthors") === "true";
    const reviewRoundId = formData.get("reviewRoundId") as string | null;

    if (!file) {
      return NextResponse.json({ ok: false, message: "File tidak ditemukan." }, { status: 400 });
    }

    if (!label || !stage) {
      return NextResponse.json({ ok: false, message: "Label dan stage wajib diisi." }, { status: 400 });
    }

    if (!SUBMISSION_STAGES.includes(stage as (typeof SUBMISSION_STAGES)[number])) {
      return NextResponse.json({ ok: false, message: "Tahap file tidak valid." }, { status: 400 });
    }

    const bucketName = "submission-files";

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedLabel = label.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileExtension = file.name.split(".").pop() || "";
    const storagePath = `submissions/${submissionId}/${stage}/${timestamp}-${sanitizedLabel}.${fileExtension}`;

    // Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error("Error uploading file to storage:", uploadError);
      return NextResponse.json({ ok: false, message: "Gagal mengunggah file ke storage." }, { status: 500 });
    }

    // Create file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from("submission_files")
      .insert({
        submission_id: submissionId,
        label: label,
        stage: stage,
        file_kind: fileKind,
        version_label: versionLabel || null,
        storage_path: storagePath,
        file_size: file.size,
        round: round,
        is_visible_to_authors: isVisibleToAuthors,
        uploaded_by: user.id,
        review_round_id: reviewRoundId || null,
      })
      .select()
      .single();

    if (dbError || !fileRecord) {
      // If database insert fails, try to delete uploaded file from storage
      await supabase.storage.from(bucketName).remove([storagePath]);
      console.error("Error creating file record:", dbError);
      return NextResponse.json({ ok: false, message: "Gagal membuat record file." }, { status: 500 });
    }

    // Log activity
    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "files",
      message: `Menambahkan file ${label} ke tahap ${stage}.`,
      metadata: {
        stage,
        label,
        fileId: fileRecord.id,
        fileSize: file.size,
      },
    });

    return NextResponse.json({
      ok: true,
      file: fileRecord,
      message: "File berhasil diunggah.",
    });
  } catch (error) {
    console.error("Error in POST file upload:", error);
    return NextResponse.json({ ok: false, message: "Gagal mengunggah file." }, { status: 500 });
  }
}



