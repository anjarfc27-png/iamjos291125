"use server";

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/permissions";
import { listSubmissionTasks } from "@/features/editor/data";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? undefined;
    const assignee = url.searchParams.get("assigneeId") ?? user.id;

    const tasks = await listSubmissionTasks({
      assigneeId: assignee,
      status: status === "all" ? undefined : status ?? "open",
      limit: 20,
    });

    return NextResponse.json({ ok: true, tasks });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load tasks",
      },
      { status: 500 },
    );
  }
}




