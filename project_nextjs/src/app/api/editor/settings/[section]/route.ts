
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasUserJournalRole, hasUserSiteRole } from "@/lib/permissions";
import {
  loadSectionSettings,
  saveSectionSettings,
  loadSetting,
  saveSetting,
} from "@/lib/settings-helpers";
import { ensureDummySettingsSeed } from "@/features/editor/dummy-settings";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ section: string }>;
};

/**
 * GET /api/editor/settings/[section]
 * Load settings for a specific section
 */
export async function GET(request: Request, context: RouteParams) {
  try {
    const { section } = await context.params;
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get journal ID from query params
    const { searchParams } = new URL(request.url);
    const journalId = searchParams.get("journalId");

    if (!journalId) {
      return NextResponse.json(
        { ok: false, message: "Journal ID is required" },
        { status: 400 }
      );
    }

    // Check permissions - only journal managers, editors, and admins can view settings
    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const canView = await hasUserJournalRole(user.id, journalId, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canView) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    await ensureDummySettingsSeed(section, journalId);
    const settings = await loadSectionSettings(journalId, section);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("Error loading settings:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to load settings",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/editor/settings/[section]
 * Save settings for a specific section
 */
export async function POST(request: Request, context: RouteParams) {
  try {
    const { section } = await context.params;
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { journalId, settings } = body;

    if (!journalId) {
      return NextResponse.json(
        { ok: false, message: "Journal ID is required" },
        { status: 400 }
      );
    }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { ok: false, message: "Settings data is required" },
        { status: 400 }
      );
    }

    // Check permissions - only journal managers, editors, and admins can save settings
    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const canEdit = await hasUserJournalRole(user.id, journalId, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canEdit) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // Transform settings to the format expected by saveSectionSettings
    const settingsToSave: Record<string, { value: any; type?: "string" | "bool" | "int" | "float" | "object" }> = {};
    for (const [key, value] of Object.entries(settings)) {
      // Auto-detect type
      let type: "string" | "bool" | "int" | "float" | "object" = "string";
      if (typeof value === "boolean") {
        type = "bool";
      } else if (typeof value === "number") {
        type = Number.isInteger(value) ? "int" : "float";
      } else if (typeof value === "object" && value !== null) {
        type = "object";
      }
      settingsToSave[key] = { value, type };
    }

    await saveSectionSettings(journalId, section, settingsToSave);

    // Reload settings to return updated values
    const updatedSettings = await loadSectionSettings(journalId, section);
    return NextResponse.json({ ok: true, settings: updatedSettings });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to save settings",
      },
      { status: 500 }
    );
  }
}

