import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserServer } from "@/lib/auth-server";
import { getReviewerAssignment } from "@/features/reviewer/data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteParams = {
  params: Promise<{ id: string; attachmentId: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, attachmentId } = await params;
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

    // Delete attachment
    const { error } = await supabase
      .from("review_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("review_id", id);

    if (error) {
      console.error("Error deleting attachment:", error);
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to delete attachment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in DELETE /api/reviewer/assignments/[id]/attachments/[attachmentId]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to delete attachment",
      },
      { status: 500 }
    );
  }
}


