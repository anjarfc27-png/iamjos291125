import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type { HostedJournal } from "./types";

export async function fetchHostedJournals(): Promise<HostedJournal[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data) {
      throw error;
    }
    let journals = data.map((row) => {
      const anyRow = row as Record<string, any>;
      return {
        id: anyRow.id,
        name: anyRow.title ?? anyRow.name ?? anyRow.journal_title ?? "",
        path: anyRow.path ?? anyRow.slug ?? anyRow.journal_path ?? "",
        description: anyRow.description ?? anyRow.desc ?? undefined,
        isPublic: anyRow.is_public ?? anyRow.public ?? true,
      } as HostedJournal;
    });
    const missingNameIds = journals.filter((j) => !j.name || j.name.trim().length === 0).map((j) => j.id);
    if (missingNameIds.length) {
      const { data: js } = await supabase
        .from("journal_settings")
        .select("journal_id, setting_value")
        .eq("setting_name", "name")
        .in("journal_id", missingNameIds);
      const nameMap = new Map<string, string>();
      (js ?? []).forEach((row: any) => {
        if (row.setting_value) nameMap.set(row.journal_id, row.setting_value as string);
      });
      journals = journals.map((j) => ({ ...j, name: j.name || nameMap.get(j.id) || j.path }));
    }
    return journals;
  } catch {
    return [];
  }
}
