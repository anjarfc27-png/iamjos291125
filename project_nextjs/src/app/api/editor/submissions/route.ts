
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/permissions";
import { listSubmissions } from "@/features/editor/data";
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    const url = new URL(request.url);
    const queueParam = (url.searchParams.get("queue") ?? "all") as "my" | "unassigned" | "all" | "archived";
    const stageParam = (url.searchParams.get("stage") ?? undefined) as | undefined | "submission" | "review" | "copyediting" | "production";
    const search = url.searchParams.get("search") ?? undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 20;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : 0;

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
    });

    return NextResponse.json({ ok: true, submissions });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load submissions",
      },
      { status: 500 },
    );
  }
}




