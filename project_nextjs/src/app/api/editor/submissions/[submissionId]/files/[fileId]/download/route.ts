
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ submissionId: string; fileId: string }>;
};

/**
 * File Download API
 * Download a submission file
 * Based on OJS 3.3 FileManager::downloadByPath()
 */
export async function GET(request: Request, context: RouteParams) {
  try {
    const { submissionId, fileId } = await context.params;

    if (!submissionId || !fileId) {
      return NextResponse.json({ ok: false, message: "Submission ID atau File ID tidak ditemukan." }, { status: 400 });
    }

    // Check permissions - editors, section editors, and managers (or site admin) can download files
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();

    // Get submission to resolve journal/context
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("journal_id")
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionError || !submission) {
      return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 404 });
    }

    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const canAccess = await hasUserJournalRole(user.id, submission.journal_id, [
      "manager",
      "editor",
      "section_editor",
      "copyeditor",
      "layout-editor",
      "proofreader",
    ]);

    if (!isSiteAdmin && !canAccess) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Get file information from database
    const { data: file, error: fileError } = await supabase
      .from("submission_files")
      .select("id, label, storage_path, file_size, file_kind")
      .eq("id", fileId)
      .eq("submission_id", submissionId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ ok: false, message: "File tidak ditemukan." }, { status: 404 });
    }

    // Get file from Supabase Storage
    // Assumption: Files are stored in 'submission-files' bucket
    // storage_path format: submissions/{submissionId}/{fileId}/{filename}
    const bucketName = "submission-files";
    const storagePath = file.storage_path;

    // Try to download from Supabase Storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from(bucketName)
      .download(storagePath);

    if (storageError || !fileData) {
      // If file doesn't exist in storage, try to generate a signed URL as fallback
      // This handles cases where file is stored externally or URL is provided
      if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
        // If storage_path is a URL, redirect to that URL
        return NextResponse.redirect(storagePath);
      }

      // If file doesn't exist, return error
      console.error("Error downloading file from storage:", storageError);
      return NextResponse.json(
        { ok: false, message: "File tidak dapat diakses. File mungkin tidak ada di storage." },
        { status: 404 }
      );
    }

    // Convert Blob to ArrayBuffer and then to Buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type based on file kind or file extension
    const contentType = getContentType(file.file_kind) || "application/octet-stream";

    // Return file with proper headers (based on OJS 3.3 FileManager::downloadByPath)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Accept-Ranges": "none",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.label)}"`,
        "Cache-Control": "private",
        "Pragma": "public",
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json({ ok: false, message: "Gagal mengunduh file." }, { status: 500 });
  }
}

function getContentType(fileKind: string): string | null {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    word: "application/msword",
    excel: "application/vnd.ms-excel",
    image: "image/jpeg",
    html: "text/html",
    epub: "application/epub+zip",
    zip: "application/zip",
  };
  return mimeTypes[fileKind] || null;
}

