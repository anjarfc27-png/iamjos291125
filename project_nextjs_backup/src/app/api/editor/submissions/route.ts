"use server";

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/permissions";
import { listSubmissions } from "@/features/editor/data";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const url = new URL(request.url);
    const queueParam = (url.searchParams.get("queue") ?? "all") as "my" | "unassigned" | "all" | "archived";
    const stageParam = (url.searchParams.get("stage") ?? undefined) as | undefined | "submission" | "review" | "copyediting" | "production";
    const search = url.searchParams.get("search") ?? undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 20;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : 0;
    let journalId = url.searchParams.get("journalId") ?? undefined;

    // Validate journalId is a valid UUID
    if (journalId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(journalId)) {
      journalId = undefined;
    }

    if (queueParam === "my" && !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await listSubmissions({
      queue: queueParam,
      stage: stageParam,
      search: search ?? undefined,
      limit,
      offset,
      editorId: queueParam === "my" ? user?.id ?? null : undefined,
      journalId,
    });

    return NextResponse.json({ ok: true, submissions });
  } catch (error: any) {
    console.error("API Error in /api/editor/submissions:", error);
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




