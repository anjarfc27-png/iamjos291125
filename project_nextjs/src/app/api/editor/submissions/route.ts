import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { listSubmissions } from "@/features/editor/data";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const queue = (url.searchParams.get("queue") as any) || "all";
    const stage = (url.searchParams.get("stage") as any) || undefined;
    const search = url.searchParams.get("search") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    let journalId = url.searchParams.get("journalId") ?? undefined;

    // Validate journalId is a valid UUID
    if (journalId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(journalId)) {
      journalId = undefined;
    }

    const submissions = await listSubmissions({
      queue,
      stage,
      search,
      limit,
      offset,
      editorId: user.id,
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
