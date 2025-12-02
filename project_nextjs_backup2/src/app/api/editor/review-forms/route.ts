"use server";

import { NextRequest, NextResponse } from "next/server";

import { ensureDummyEditorData } from "@/features/editor/dummy-sync";
import { requireJournalRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { EDITOR_ROLES, handleError } from "../library-files/utils";

type ReviewFormRow = {
  id: string;
  context_id: string;
  seq: number;
  is_active: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  review_form_settings?: Array<{
    setting_name: string;
    setting_value: string | null;
  }> | null;
};

export async function GET(request: NextRequest) {
  try {
    const journalId = request.nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "journalId is required" }, { status: 400 });
    }

    await requireJournalRole(request, journalId, EDITOR_ROLES);
    await ensureDummyEditorData();

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("review_forms")
      .select(
        `
          id,
          context_id,
          seq,
          is_active,
          metadata,
          created_at,
          updated_at,
          review_form_settings (
            setting_name,
            setting_value
          )
        `,
      )
      .eq("context_id", journalId)
      .order("seq", { ascending: true });

    if (error) {
      throw error;
    }

    const forms = (data ?? []).map(mapReviewForm);
    return NextResponse.json({ ok: true, forms });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      journalId?: string;
      title: string;
      description?: string | null;
      isActive?: boolean;
      questions?: number | null;
    };

    const journalId = body.journalId ?? request.nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "journalId is required" }, { status: 400 });
    }

    if (!body.title) {
      return NextResponse.json({ ok: false, message: "title is required" }, { status: 400 });
    }

    await requireJournalRole(request, journalId, EDITOR_ROLES);
    await ensureDummyEditorData();

    const supabase = getSupabaseAdminClient();

    const { data: seqRow } = await supabase
      .from("review_forms")
      .select("seq")
      .eq("context_id", journalId)
      .order("seq", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSeq = (seqRow?.seq ?? 0) + 1;

    const { data: inserted, error: insertError } = await supabase
      .from("review_forms")
      .insert({
        context_id: journalId,
        assoc_type: 256,
        assoc_id: journalId,
        seq: nextSeq,
        is_active: body.isActive ?? true,
        metadata: {
          questions: body.questions ?? 0,
        },
      })
      .select("id, context_id, seq, is_active, metadata, created_at, updated_at")
      .single();

    if (insertError || !inserted) {
      throw insertError;
    }

    const settingsRows = [
      {
        review_form_id: inserted.id,
        setting_name: "title",
        setting_value: body.title,
        setting_type: "string",
        locale: "en_US",
      },
      {
        review_form_id: inserted.id,
        setting_name: "description",
        setting_value: body.description ?? "",
        setting_type: "string",
        locale: "en_US",
      },
    ];

    const { error: settingsError } = await supabase.from("review_form_settings").insert(settingsRows);
    if (settingsError) {
      throw settingsError;
    }

    const form = mapReviewForm({
      ...inserted,
      review_form_settings: settingsRows.map((row) => ({
        setting_name: row.setting_name,
        setting_value: row.setting_value,
      })),
    });

    return NextResponse.json({ ok: true, form });
  } catch (error) {
    return handleError(error);
  }
}

function mapReviewForm(row: ReviewFormRow) {
  const settings = row.review_form_settings ?? [];
  const title = settings.find((s) => s.setting_name === "title")?.setting_value ?? "Untitled Form";
  const description = settings.find((s) => s.setting_name === "description")?.setting_value ?? "";
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    title,
    description,
    seq: row.seq,
    isActive: row.is_active,
    questions: (metadata.questions as number | undefined) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


