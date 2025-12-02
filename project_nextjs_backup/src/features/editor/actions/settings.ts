"use server";

import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";
import {
  loadSectionSettings,
  saveSectionSettings,
  loadSetting,
  saveSetting,
} from "@/lib/settings-helpers";
import { revalidatePath } from "next/cache";

export type SaveSettingsResult = {
  success: boolean;
  message: string;
  error?: string;
};

type SettingsRecord = Record<string, unknown>;

/**
 * Load settings for a specific section
 */
export async function loadSettings(
  section: string,
  journalId?: string
): Promise<{ success: boolean; settings?: SettingsRecord; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Journal ID must be provided explicitly for server actions
    const currentJournalId = journalId;
    if (!currentJournalId) {
      return {
        success: false,
        error: "Journal ID not found",
      };
    }

    // Check permissions: site admin or journal manager/editor/section_editor
    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const canManageSettings = await hasUserJournalRole(user.id, currentJournalId, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canManageSettings) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    const settings = await loadSectionSettings(currentJournalId, section);
    return {
      success: true,
      settings,
    };
  } catch (error) {
    console.error("Error loading settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load settings",
    };
  }
}

/**
 * Save settings for a specific section
 */
export async function saveSettings(
  section: string,
  settings: SettingsRecord,
  journalId?: string
): Promise<SaveSettingsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        error: "You must be logged in to save settings",
      };
    }

    // Journal ID must be provided explicitly for server actions
    const currentJournalId = journalId;
    if (!currentJournalId) {
      return {
        success: false,
        message: "Journal ID not found",
        error: "Journal ID is required",
      };
    }

    // Check permissions: site admin or journal manager/editor/section_editor
    const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
    const canManageSettings = await hasUserJournalRole(user.id, currentJournalId, [
      "manager",
      "editor",
      "section_editor",
    ]);

    if (!isSiteAdmin && !canManageSettings) {
      return {
        success: false,
        message: "Forbidden",
        error: "You don't have permission to save settings",
      };
    }

    // Transform settings to the format expected by saveSectionSettings
    const settingsToSave: Record<string, { value: unknown; type?: "string" | "bool" | "int" | "float" | "object" }> = {};
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

    await saveSectionSettings(currentJournalId, section, settingsToSave);

    // Revalidate the settings page
    revalidatePath(`/editor/settings/${section}`);

    return {
      success: true,
      message: "Settings saved successfully",
    };
  } catch (error) {
    console.error("Error saving settings:", error);
    return {
      success: false,
      message: "Failed to save settings",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Load a single setting value
 */
export async function loadSettingValue(
  settingName: string,
  defaultValue: unknown = null,
  journalId?: string
): Promise<{ success: boolean; value?: unknown; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Journal ID must be provided explicitly for server actions
    const currentJournalId = journalId;
    if (!currentJournalId) {
      return {
        success: false,
        error: "Journal ID not found",
      };
    }

    const value = await loadSetting(currentJournalId, settingName, defaultValue);
    return {
      success: true,
      value,
    };
  } catch (error) {
    console.error("Error loading setting:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load setting",
    };
  }
}

/**
 * Save a single setting value
 */
export async function saveSettingValue(
  settingName: string,
  value: unknown,
  settingType: "string" | "bool" | "int" | "float" | "object" = "string",
  journalId?: string
): Promise<SaveSettingsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        error: "You must be logged in to save settings",
      };
    }

    if (!journalId) {
      return {
        success: false,
        message: "Journal ID not found",
        error: "Journal ID is required",
      };
    }

    await saveSetting(journalId, settingName, value, settingType);

    return {
      success: true,
      message: "Setting saved successfully",
    };
  } catch (error) {
    console.error("Error saving setting:", error);
    return {
      success: false,
      message: "Failed to save setting",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

