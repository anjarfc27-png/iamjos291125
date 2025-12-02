"use server";

import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteParams = {
  params: Promise<{ journalId: string }>;
};

export async function GET(_: Request, context: RouteParams) {
  try {
    const { journalId } = await context.params;
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "Journal tidak ditemukan." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: sections, error } = await supabase
      .from("sections")
      .select("id, journal_id, seq, is_inactive")
      .eq("journal_id", journalId)
      .order("seq", { ascending: true });

    if (error) {
      throw error;
    }

    const sectionIds = (sections ?? []).map((section) => section.id);
    let titleMap = new Map<string, string>();

    if (sectionIds.length > 0) {
      const { data: settings } = await supabase
        .from("section_settings")
        .select("section_id, setting_value")
        .eq("setting_name", "title")
        .in("section_id", sectionIds)
        .eq("locale", "en_US");

      titleMap = new Map((settings ?? []).map((setting) => [setting.section_id as string, setting.setting_value as string]));
    }

    const normalized = (sections ?? []).map((section) => ({
      id: section.id,
      title: titleMap.get(section.id) ?? "Untitled Section",
      seq: section.seq,
      isInactive: section.is_inactive,
    }));

    return NextResponse.json({
      ok: true,
      sections: normalized,
    });
  } catch (error) {
    console.error("Error loading sections:", error);
    return NextResponse.json({ ok: false, message: "Gagal memuat daftar section." }, { status: 500 });
  }
}

