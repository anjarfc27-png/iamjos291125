import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserServer } from "@/lib/auth-server";
import { getReviewerAssignment } from "@/features/reviewer/data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUserServer();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify assignment belongs to user
    const assignment = await getReviewerAssignment(id, user.id);
    if (!assignment) {
      return NextResponse.json({ ok: false, error: "Assignment not found" }, { status: 404 });
    }

    const supabase = getSupabaseAdminClient();

    // Get submission files for this review round
    const { data: files, error } = await supabase
      .from("submission_files")
      .select("id, label, file_kind, storage_path, file_size, uploaded_at, round, stage")
      .eq("submission_id", assignment.submissionId)
      .eq("round", assignment.round)
      .eq("stage", "review")
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching submission files:", error);
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to fetch files" },
        { status: 500 }
      );
    }

    // Map files to include download URL (you'll need to implement file download URL generation)
    const filesWithUrls = (files || []).map((file) => ({
      id: file.id,
      label: file.label,
      fileKind: file.file_kind,
      uploadedAt: file.uploaded_at,
      fileSize: file.file_size || 0,
      downloadUrl: `/api/files/${file.id}/download`, // TODO: Implement actual download URL
    }));

    return NextResponse.json({
      ok: true,
      files: filesWithUrls,
    });
  } catch (error) {
    console.error("Error in GET /api/reviewer/assignments/[id]/files:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch files",
      },
      { status: 500 }
    );
  }
}


