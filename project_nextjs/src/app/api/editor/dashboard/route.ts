
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/permissions";
import { getEditorDashboardStats } from "@/features/editor/data";
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getEditorDashboardStats(user.id);
    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load dashboard stats",
      },
      { status: 500 },
    );
  }
}




