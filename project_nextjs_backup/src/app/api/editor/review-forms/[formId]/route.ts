"use server";

import { NextRequest, NextResponse } from "next/server";

import { ensureDummyEditorData } from "@/features/editor/dummy-sync";
import { requireJournalRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { EDITOR_ROLES, handleError } from "../../library-files/utils";

type RouteParams = {
  params: Promise<{ formId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { formId } = await context.params;
    const journalId = request.nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "journalId is required" }, { status: 400 });
    }

    await requireJournalRole(request, journalId, EDITOR_ROLES);
    await ensureDummyEditorData();

    const body = (await request.json()) as {
      title?: string;
      description?: string | null;
      isActive?: boolean;
      questions?: number | null;
      seq?: number;
    };

    const supabase = getSupabaseAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("review_forms")
      .select("id, context_id, metadata, seq")
      .eq("id", formId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ ok: false, message: "Review form not found" }, { status: 404 });
    }

    if (existing.context_id !== journalId) {
      return NextResponse.json({ ok: false, message: "Review form not found" }, { status: 404 });
    }

    const metadata = { ...(existing.metadata ?? {}) } as Record<string, unknown>;
    if (body.questions !== undefined && body.questions !== null) {
      metadata.questions = body.questions;
    }

    const updatePayload: Record<string, unknown> = {
      metadata,
    };

    if (body.isActive !== undefined) {
      updatePayload.is_active = body.isActive;
    }

    if (body.seq !== undefined) {
      updatePayload.seq = body.seq;
    }

    const { error: updateError } = await supabase.from("review_forms").update(updatePayload).eq("id", formId);
    if (updateError) {
      throw updateError;
    }

    if (body.title !== undefined) {
      await upsertSetting(supabase, formId, "title", body.title);
    }
    if (body.description !== undefined) {
      await upsertSetting(supabase, formId, "description", body.description ?? "");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { formId } = await context.params;
    const journalId = request.nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "journalId is required" }, { status: 400 });
    }

    await requireJournalRole(request, journalId, EDITOR_ROLES);
    await ensureDummyEditorData();

    const supabase = getSupabaseAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("review_forms")
      .select("id, context_id")
      .eq("id", formId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ ok: false, message: "Review form not found" }, { status: 404 });
    }

    if (existing.context_id !== journalId) {
      return NextResponse.json({ ok: false, message: "Review form not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from("review_forms").delete().eq("id", formId);
    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

async function upsertSetting(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  formId: string,
  setting: string,
  value: string,
) {
  const { data: existing } = await supabase
    .from("review_form_settings")
    .select("setting_name")
    .eq("review_form_id", formId)
    .eq("setting_name", setting)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("review_form_settings")
      .update({ setting_value: value })
      .eq("review_form_id", formId)
      .eq("setting_name", setting);
  } else {
    await supabase.from("review_form_settings").insert({
      review_form_id: formId,
      setting_name: setting,
      setting_value: value,
      setting_type: "string",
      locale: "en_US",
    });
  }
}


