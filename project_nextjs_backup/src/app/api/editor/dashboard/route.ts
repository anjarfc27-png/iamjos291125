"use server";

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/permissions";
import { getEditorDashboardStats } from "@/features/editor/data";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    let journalId = url.searchParams.get("journalId") ?? undefined;

    // Validate journalId is a valid UUID
    if (journalId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(journalId)) {
      journalId = undefined;
    }

    const stats = await getEditorDashboardStats(user.id, journalId);
    return NextResponse.json({ ok: true, stats });
  } catch (error: any) {
    console.error("API Error in /api/editor/dashboard:", error);
    const errorMsg = error instanceof Error
      ? `API Error: ${error.message}\nStack: ${error.stack}`
      : `Unknown API Error: ${typeof error === 'object' ? JSON.stringify(error) : String(error)}`;

    return NextResponse.json(
      {
        ok: false,
        error: errorMsg,
      },
      { status: 500 },
    );
  }
}
