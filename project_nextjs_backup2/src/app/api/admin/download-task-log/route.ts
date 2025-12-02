import { NextRequest, NextResponse } from "next/server";
import { requireSiteAdmin } from "@/lib/permissions";

// Dummy log data for now
const generateDummyLog = () => {
  const logs = [
    { task: "Reminder email", executedAt: "2025-03-10 02:00", status: "success", duration: "1.2s" },
    { task: "Subscription renewal", executedAt: "2025-03-09 04:30", status: "success", duration: "0.8s" },
    { task: "Usage statistics", executedAt: "2025-03-08 23:45", status: "success", duration: "2.1s" },
    { task: "Backup database", executedAt: "2025-03-08 01:00", status: "success", duration: "15.3s" },
  ];

  return logs.map((log) => `[${log.executedAt}] ${log.task} - ${log.status} (${log.duration})\n`).join("");
};

export async function GET(request: NextRequest) {
  try {
    await requireSiteAdmin();

    const logContent = generateDummyLog();
    const filename = `scheduled-task-logs-${new Date().toISOString().split("T")[0]}.txt`;

    return new NextResponse(logContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}






