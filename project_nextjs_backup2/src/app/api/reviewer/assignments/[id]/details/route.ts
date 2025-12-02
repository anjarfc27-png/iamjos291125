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

    // Get review request message from metadata or generate default
    const reviewRequestMessage = assignment.metadata?.review_request_message || 
      "You have been invited to review the following submission. Please review the details below and decide whether you can accept or must decline this review request.";

    // Get review method (default to Double-blind)
    const reviewMethod = assignment.metadata?.review_method || "Double-blind";

    // Get competing interests if already set
    const competingInterests = assignment.metadata?.competing_interests || null;

    return NextResponse.json({
      ok: true,
      reviewRequestMessage,
      reviewMethod,
      competingInterests,
    });
  } catch (error) {
    console.error("Error in GET /api/reviewer/assignments/[id]/details:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch details",
      },
      { status: 500 }
    );
  }
}


