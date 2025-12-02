"use server";

import { NextRequest, NextResponse } from "next/server";

import { ensureDummyEditorData } from "@/features/editor/dummy-sync";
import { getCurrentUser, requireJournalRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  EDITOR_ROLES,
  LibraryFileRow,
  handleError,
  mapLibraryFile,
  uploadLibraryFile,
} from "./utils";

export async function GET(request: NextRequest) {
  try {
    const journalId = request.nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "journalId is required" }, { status: 400 });
    }

    await requireJournalRole(request, journalId, EDITOR_ROLES);
    await ensureDummyEditorData();

    const supabase = getSupabaseAdminClient();
    let query = supabase
      .from("library_files")
      .select("id, context_id, file_name, file_type, file_size, original_file_name, storage_path, metadata, created_at, updated_at")
      .eq("context_id", journalId)
      .order("created_at", { ascending: false });

    const search = request.nextUrl.searchParams.get("search");
    if (search) {
      query = query.ilike("file_name", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const files = (data ?? []).map(mapLibraryFile);
    return NextResponse.json({ ok: true, files });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const journalId = (formData.get("journalId") as string | null) ?? request.nextUrl.searchParams.get("journalId");

    if (!journalId) {
      return NextResponse.json({ ok: false, message: "journalId is required" }, { status: 400 });
    }

    await requireJournalRole(request, journalId, EDITOR_ROLES);
    await ensureDummyEditorData();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const file = formData.get("file") as File | null;
    const remoteUrl = formData.get("remoteUrl") as string | null;
    if (!file && !remoteUrl) {
      return NextResponse.json({ ok: false, message: "File or remoteUrl is required" }, { status: 400 });
    }

    const label = (formData.get("label") as string | null) || file?.name || "Library File";
    const stage = (formData.get("stage") as string | null) ?? "general";
    const description = (formData.get("description") as string | null) ?? null;

    const supabase = getSupabaseAdminClient();

    let storagePath: string | null = null;
    let fileSize = 0;
    let fileType = remoteUrl ? "remote/url" : file?.type || "application/octet-stream";

    if (file) {
      const uploadResult = await uploadLibraryFile(supabase, file, journalId, label);
      storagePath = uploadResult.path;
      fileSize = uploadResult.size;
    }

    const metadata: Record<string, unknown> = {
      stage,
      description,
      source: file ? "upload" : "remote",
    };

    if (remoteUrl) {
      metadata.remoteUrl = remoteUrl;
    }

    const insertPayload = {
      context_id: journalId,
      submission_id: null,
      file_name: label,
      file_type: fileType,
      file_size: fileSize,
      original_file_name: file?.name ?? label,
      file_stage: 1,
      storage_path: storagePath,
      uploader_user_id: user.id,
      metadata,
    };

    const { data, error } = await supabase
      .from("library_files")
      .insert(insertPayload)
      .select("id, context_id, file_name, file_type, file_size, original_file_name, storage_path, metadata, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, file: mapLibraryFile(data as LibraryFileRow) });
  } catch (error) {
    return handleError(error);
  }
}

