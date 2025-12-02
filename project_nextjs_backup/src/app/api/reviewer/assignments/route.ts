import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserServer } from "@/lib/auth-server";
import { getReviewerAssignments, getPendingReviewerAssignments, getActiveReviewerAssignments, getCompletedReviewerAssignments } from "@/features/reviewer/data";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has reviewer role
    const hasReviewerRole = user.roles?.some((r) => {
      const rolePath = r.role_path?.toLowerCase();
      return rolePath === "reviewer";
    });

    if (!hasReviewerRole) {
      return NextResponse.json(
        { ok: false, error: "Forbidden - Reviewer role required" },
        { status: 403 }
      );
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, pending, active, completed

    let assignments;

    switch (filter) {
      case "pending":
        assignments = await getPendingReviewerAssignments(user.id);
        break;
      case "active":
        assignments = await getActiveReviewerAssignments(user.id);
        break;
      case "completed":
        assignments = await getCompletedReviewerAssignments(user.id);
        break;
      default:
        assignments = await getReviewerAssignments(user.id);
    }

    return NextResponse.json({
      ok: true,
      assignments,
    });
  } catch (error) {
    console.error("Error in GET /api/reviewer/assignments:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch assignments",
      },
      { status: 500 }
    );
  }
}


