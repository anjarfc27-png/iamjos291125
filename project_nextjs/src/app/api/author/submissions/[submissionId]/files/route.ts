import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserServer } from "@/lib/auth-server";

type RouteContext = {
  params: Promise<{ submissionId: string }>;
};

/**
 * Author File Upload API Route
 * Allows authors to upload files to their own submissions
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { submissionId } = await context.params;
    
    // Get current user
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    // Verify that the user is the author of this submission
    const adminSupabase = getSupabaseAdminClient();
    const { data: submission, error: submissionError } = await adminSupabase
      .from("submissions")
      .select("id, current_stage, journal_id")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { ok: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // Check if user is the author via submission_participants
    const { data: participant, error: participantError } = await adminSupabase
      .from("submission_participants")
      .select("submission_id")
      .eq("submission_id", submissionId)
      .eq("user_id", user.id)
      .eq("role", "author")
      .maybeSingle();

    if (participantError || !participant) {
      return NextResponse.json(
        { ok: false, message: "You can only upload files to your own submissions" },
        { status: 403 }
      );
    }

    // Check if upload is allowed based on stage
    const allowedStages = ['submission', 'review', 'copyediting'];
    if (!allowedStages.includes(submission.current_stage)) {
      return NextResponse.json(
        { ok: false, message: `File upload not allowed at ${submission.current_stage} stage` },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const label = formData.get("label") as string | null;
    const stage = formData.get("stage") as string | null;
    const kind = formData.get("kind") as string | null;
    const uploadedBy = formData.get("uploadedBy") as string | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, message: "File is required" },
        { status: 400 }
      );
    }

    if (!label || !label.trim()) {
      return NextResponse.json(
        { ok: false, message: "File label is required" },
        { status: 400 }
      );
    }

    if (!stage) {
      return NextResponse.json(
        { ok: false, message: "Stage is required" },
        { status: 400 }
      );
    }

    if (!kind) {
      return NextResponse.json(
        { ok: false, message: "File kind is required" },
        { status: 400 }
      );
    }

    if (uploadedBy && uploadedBy !== user.id) {
      return NextResponse.json(
        { ok: false, message: "Upload user ID mismatch" },
        { status: 403 }
      );
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop() || "bin";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${submissionId}/${timestamp}_${randomStr}.${fileExt}`;
    const storagePath = `submissions/${fileName}`;

    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await adminSupabase.storage
      .from("files")
      .upload(storagePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("File upload error:", uploadError);
      return NextResponse.json(
        { ok: false, message: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Create file record in database
    const { data: fileRecord, error: fileError } = await adminSupabase
      .from("files")
      .insert({
        journal_id: submission.journal_id,
        file_name: fileName,
        original_file_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_size: file.size,
        storage_path: storagePath,
      })
      .select("id")
      .single();

    if (fileError || !fileRecord) {
      // Cleanup uploaded file if database insert fails
      await adminSupabase.storage.from("files").remove([storagePath]);
      console.error("File record creation error:", fileError);
      return NextResponse.json(
        { ok: false, message: `Failed to create file record: ${fileError?.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    // Create submission file record
    const { error: submissionFileError } = await adminSupabase
      .from("submission_files")
      .insert({
        submission_id: submissionId,
        file_id: fileRecord.id,
        label: label.trim(),
        stage: stage as string,
        file_kind: kind as string,
        round: 1,
        is_visible_to_authors: true,
        uploaded_at: new Date().toISOString(),
        uploaded_by: user.id,
      });

    if (submissionFileError) {
      // Cleanup if submission file creation fails
      await adminSupabase.storage.from("files").remove([storagePath]);
      await adminSupabase.from("files").delete().eq("id", fileRecord.id);
      console.error("Submission file creation error:", submissionFileError);
      return NextResponse.json(
        { ok: false, message: `Failed to create submission file: ${submissionFileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error in author file upload:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}

