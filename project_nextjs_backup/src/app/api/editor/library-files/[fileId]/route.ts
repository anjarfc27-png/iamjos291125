"use server";

import { NextRequest, NextResponse } from "next/server";

import { ensureDummyEditorData } from "@/features/editor/dummy-sync";
import { getCurrentUser, requireJournalRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  EDITOR_ROLES,
  LIBRARY_BUCKET,
  LibraryFileRow,
  handleError,
  mapLibraryFile,
} from "../utils";

type RouteParams = {
  params: Promise<{ fileId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { fileId } = await context.params;
    const journalId = request.nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "journalId is required" }, { status: 400 });
    }

    await requireJournalRole(request, journalId, EDITOR_ROLES);
    await ensureDummyEditorData();

    const body = (await request.json()) as {
      label?: string;
      description?: string | null;
      stage?: string | null;
    };

    const supabase = getSupabaseAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("library_files")
      .select("id, context_id, file_name, file_type, file_size, original_file_name, storage_path, metadata, created_at, updated_at")
      .eq("id", fileId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ ok: false, message: "Library file not found" }, { status: 404 });
    }

    if (existing.context_id !== journalId) {
      return NextResponse.json({ ok: false, message: "Library file not found" }, { status: 404 });
    }

    const metadata = { ...(existing.metadata ?? {}) } as Record<string, unknown>;
    if (body.description !== undefined) {
      metadata.description = body.description;
    }
    if (body.stage) {
      metadata.stage = body.stage;
    }

    const updatePayload: Record<string, unknown> = {
      metadata,
    };

    if (body.label) {
      updatePayload.file_name = body.label;
    }

    const { data: updated, error: updateError } = await supabase
      .from("library_files")
      .update(updatePayload)
      .eq("id", fileId)
      .select("id, context_id, file_name, file_type, file_size, original_file_name, storage_path, metadata, created_at, updated_at")
      .single();

    if (updateError || !updated) {
      throw updateError;
    }

    return NextResponse.json({ ok: true, file: mapLibraryFile(updated as LibraryFileRow) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { fileId } = await context.params;
    const journalId = request.nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "journalId is required" }, { status: 400 });
    }

    await requireJournalRole(request, journalId, EDITOR_ROLES);
    await ensureDummyEditorData();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("library_files")
      .select("id, context_id, storage_path")
      .eq("id", fileId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ ok: false, message: "Library file not found" }, { status: 404 });
    }

    if (existing.context_id !== journalId) {
      return NextResponse.json({ ok: false, message: "Library file not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from("library_files").delete().eq("id", fileId);
    if (deleteError) {
      throw deleteError;
    }

    if (existing.storage_path) {
      await supabase.storage.from(LIBRARY_BUCKET).remove([existing.storage_path]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}


