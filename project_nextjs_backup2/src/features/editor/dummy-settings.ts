import { USE_DUMMY } from "@/lib/dummy";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { DUMMY_SECTIONS, DUMMY_CATEGORIES } from "./settings-dummy-data";

type SectionSetting = typeof DUMMY_SECTIONS;
type CategorySetting = typeof DUMMY_CATEGORIES;

export async function ensureDummySettingsSeed(section: string, journalId: string | null | undefined) {
  if (!USE_DUMMY || !journalId) {
    return;
  }

  const supabase = getSupabaseAdminClient();

  if (section === "context") {
    await Promise.all([
      seedSettingIfMissing<SectionSetting>(supabase, journalId, "context_sections", DUMMY_SECTIONS),
      seedSettingIfMissing<CategorySetting>(supabase, journalId, "context_categories", DUMMY_CATEGORIES),
    ]);
  }
}

async function seedSettingIfMissing<T>(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  journalId: string,
  settingName: string,
  defaultValue: T,
) {
  const { data, error } = await supabase
    .from("journal_settings")
    .select("setting_name")
    .eq("journal_id", journalId)
    .eq("setting_name", settingName)
    .eq("locale", "")
    .maybeSingle();

  if (error || data) {
    return;
  }

  await supabase.from("journal_settings").insert({
    journal_id: journalId,
    setting_name: settingName,
    setting_value: JSON.stringify(defaultValue),
    setting_type: "object",
    locale: "",
  });
}




