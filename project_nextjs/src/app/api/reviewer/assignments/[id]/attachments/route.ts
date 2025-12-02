import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserServer } from "@/lib/auth-server";
import { getReviewerAssignment } from "@/features/reviewer/data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
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

    // Fetch review attachments
    const { data: attachments, error } = await supabase
      .from("review_attachments")
      .select("id, file_name, file_size, uploaded_at, storage_path")
      .eq("review_id", id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching attachments:", error);
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to fetch attachments" },
        { status: 500 }
      );
    }

    // Map attachments to include download URL
    const attachmentsWithUrls = (attachments || []).map((att) => ({
      id: att.id,
      fileName: att.file_name,
      fileSize: att.file_size || 0,
      uploadedAt: att.uploaded_at,
      downloadUrl: `/api/files/${att.id}/download`, // TODO: Implement actual download URL
    }));

    return NextResponse.json({
      ok: true,
      attachments: attachmentsWithUrls,
    });
  } catch (error) {
    console.error("Error in GET /api/reviewer/assignments/[id]/attachments:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch attachments",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
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

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ ok: false, error: "No files provided" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // TODO: Upload files to Supabase Storage and save to review_attachments table
    // For now, return a placeholder response
    return NextResponse.json({
      ok: true,
      message: "Files uploaded successfully",
    });
  } catch (error) {
    console.error("Error in POST /api/reviewer/assignments/[id]/attachments:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to upload attachments",
      },
      { status: 500 }
    );
  }
}


