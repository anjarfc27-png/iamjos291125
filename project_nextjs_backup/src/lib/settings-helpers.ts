/**
 * Settings Helper Functions
 * 
 * OJS uses EAV (Entity-Attribute-Value) pattern for settings sto
 */

import { getSupabaseAdminClient } from "./supabase/admin";

export type SettingType = "string" | "bool" | "int" | "float" | "object";

/**
 * Key naming convention untuk settings
 * Format: section_subsection_settingName
 */
export const SETTINGS_KEYS = {
  // Workflow Settings
  workflow: {
    reviewSetup: {
      defaultReviewMode: "workflow_review_defaultReviewMode",
      restrictReviewerFileAccess: "workflow_review_restrictReviewerFileAccess",
      reviewerAccessKeysEnabled: "workflow_review_reviewerAccessKeysEnabled",
      numWeeksPerResponse: "workflow_review_numWeeksPerResponse",
      numWeeksPerReview: "workflow_review_numWeeksPerReview",
      numDaysBeforeInviteReminder: "workflow_review_numDaysBeforeInviteReminder",
      numDaysBeforeSubmitReminder: "workflow_review_numDaysBeforeSubmitReminder",
    },
    reviewerGuidance: {
      reviewGuidelines: "workflow_reviewerGuidance_reviewGuidelines",
      competingInterests: "workflow_reviewerGuidance_competingInterests",
      showEnsuringLink: "workflow_reviewerGuidance_showEnsuringLink",
    },
    authorGuidelines: "workflow_authorGuidelines",
    emailSetup: {
      emailSignature: "workflow_emailSetup_emailSignature",
      envelopeSender: "workflow_emailSetup_envelopeSender",
    },
  },
  // Context Settings
  context: {
    masthead: "context_masthead",
    contact: {
      contactName: "context_contact_contactName",
      contactEmail: "context_contact_contactEmail",
      contactPhone: "context_contact_contactPhone",
      contactAffiliation: "context_contact_contactAffiliation",
      mailingAddress: "context_contact_mailingAddress",
      supportName: "context_contact_supportName",
      supportEmail: "context_contact_supportEmail",
      supportPhone: "context_contact_supportPhone",
    },
  },
  // Website Settings
  website: {
    appearance: {
      theme: "website_appearance_theme",
      headerBg: "website_appearance_headerBg",
      useSiteTheme: "website_appearance_useSiteTheme",
      showLogo: "website_appearance_showLogo",
    },
    setup: {
      information: "website_setup_information",
      languages: "website_setup_languages",
      announcements: "website_setup_announcements",
      lists: "website_setup_lists",
      privacy: "website_setup_privacy",
      dateTime: "website_setup_dateTime",
      archiving: "website_setup_archiving",
    },
    navigation: "website_navigation",
  },
  // Distribution Settings
  distribution: {
    license: "distribution_license",
    searchIndexing: "distribution_searchIndexing",
    payments: "distribution_payments",
  },
  // Access Settings
  access: {
    siteAccess: {
      allowRegistrations: "access_siteAccess_allowRegistrations",
      requireReviewerInterests: "access_siteAccess_requireReviewerInterests",
      allowRememberMe: "access_siteAccess_allowRememberMe",
      sessionLifetime: "access_siteAccess_sessionLifetime",
      forceSSL: "access_siteAccess_forceSSL",
    },
  },
} as const;

/**
 * Load a single setting value from journal_settings table
 */
export async function loadSetting(
  journalId: string,
  settingName: string,
  defaultValue: any = null
): Promise<any> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("journal_settings")
    .select("setting_value, setting_type")
    .eq("journal_id", journalId)
    .eq("setting_name", settingName)
    .eq("locale", "")
    .maybeSingle();

  if (error || !data) {
    return defaultValue;
  }

  return parseSettingValue(data.setting_value, data.setting_type as SettingType);
}

/**
 * Load multiple settings at once
 */
export async function loadSettings(
  journalId: string,
  settingNames: string[]
): Promise<Record<string, any>> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("journal_settings")
    .select("setting_name, setting_value, setting_type")
    .eq("journal_id", journalId)
    .in("setting_name", settingNames)
    .eq("locale", "");

  if (error || !data) {
    return {};
  }

  const result: Record<string, any> = {};
  for (const row of data) {
    result[row.setting_name] = parseSettingValue(
      row.setting_value,
      row.setting_type as SettingType
    );
  }

  return result;
}

/**
 * Save a single setting value to journal_settings table
 */
export async function saveSetting(
  journalId: string,
  settingName: string,
  value: any,
  settingType: SettingType = "string"
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const stringValue = stringifySettingValue(value, settingType);

  const { error } = await supabase
    .from("journal_settings")
    .upsert(
      {
        journal_id: journalId,
        setting_name: settingName,
        setting_value: stringValue,
        setting_type: settingType,
        locale: "",
      },
      {
        onConflict: "journal_id,setting_name,locale",
      }
    );

  if (error) {
    throw new Error(`Failed to save setting ${settingName}: ${error.message}`);
  }
}

/**
 * Save multiple settings at once
 */
export async function saveSettings(
  journalId: string,
  settings: Record<string, { value: any; type?: SettingType }>
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const rows = Object.entries(settings).map(([settingName, { value, type = "string" }]) => ({
    journal_id: journalId,
    setting_name: settingName,
    setting_value: stringifySettingValue(value, type),
    setting_type: type,
    locale: "",
  }));

  const { error } = await supabase.from("journal_settings").upsert(rows, {
    onConflict: "journal_id,setting_name,locale",
  });

  if (error) {
    throw new Error(`Failed to save settings: ${error.message}`);
  }
}

/**
 * Parse setting value based on type
 */
function parseSettingValue(value: string | null, type: SettingType): any {
  if (value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case "bool":
      return value === "1" || value === "true";
    case "int":
      return parseInt(value, 10);
    case "float":
      return parseFloat(value);
    case "object":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    case "string":
    default:
      return value;
  }
}

/**
 * Stringify setting value based on type
 */
function stringifySettingValue(value: any, type: SettingType): string {
  if (value === null || value === undefined) {
    return "";
  }

  switch (type) {
    case "bool":
      return value ? "1" : "0";
    case "int":
    case "float":
      return String(value);
    case "object":
      return JSON.stringify(value);
    case "string":
    default:
      return String(value);
  }
}

/**
 * Load all settings for a section
 */
export async function loadSectionSettings(
  journalId: string,
  section: string
): Promise<Record<string, any>> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("journal_settings")
    .select("setting_name, setting_value, setting_type")
    .eq("journal_id", journalId)
    .like("setting_name", `${section}_%`)
    .eq("locale", "");

  if (error || !data) {
    return {};
  }

  const result: Record<string, any> = {};
  for (const row of data) {
    // Remove section prefix from key
    const key = row.setting_name.replace(`${section}_`, "");
    result[key] = parseSettingValue(row.setting_value, row.setting_type as SettingType);
  }

  return result;
}

/**
 * Save all settings for a section
 */
export async function saveSectionSettings(
  journalId: string,
  section: string,
  settings: Record<string, { value: any; type?: SettingType }>
): Promise<void> {
  const rows = Object.entries(settings).map(([key, { value, type = "string" }]) => ({
    journal_id: journalId,
    setting_name: `${section}_${key}`,
    setting_value: stringifySettingValue(value, type),
    setting_type: type,
    locale: "",
  }));

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("journal_settings").upsert(rows, {
    onConflict: "journal_id,setting_name,locale",
  });

  if (error) {
    throw new Error(`Failed to save ${section} settings: ${error.message}`);
  }
}

