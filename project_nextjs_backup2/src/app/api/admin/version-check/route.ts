import { NextRequest, NextResponse } from "next/server";
import { requireSiteAdmin } from "@/lib/permissions";

// Dummy version check - in production, this would check against OJS PKP API
export async function GET(request: NextRequest) {
  try {
    await requireSiteAdmin();

    // Dummy data for now
    const currentVersion: string = "3.3.0";
    const latestVersion: string = "3.3.1";
    const hasUpdate: boolean = currentVersion !== latestVersion;

    return NextResponse.json({
      currentVersion,
      latestVersion,
      hasUpdate,
      updateUrl: hasUpdate ? "https://github.com/pkp/ojs/releases" : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}






