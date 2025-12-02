
import { NextRequest, NextResponse } from "next/server";

import { ensureDummyEditorData } from "@/features/editor/dummy-sync";
import { requireJournalRole } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { EDITOR_ROLES, LIBRARY_BUCKET, handleError } from "../../utils";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ fileId: string }>;
};

export async function GET(request: Request, context: RouteParams) {
  try {
    const { fileId } = await context.params;
    const journalId = (request as any).nextUrl.searchParams.get("journalId");
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "journalId is required" }, { status: 400 });
    }

    await requireJournalRole(request, journalId, EDITOR_ROLES);
    await ensureDummyEditorData();

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("library_files")
      .select("id, context_id, storage_path, metadata")
      .eq("id", fileId)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, message: "Library file not found" }, { status: 404 });
    }

    if (data.context_id !== journalId) {
      return NextResponse.json({ ok: false, message: "Library file not found" }, { status: 404 });
    }

    const metadata = (data.metadata ?? {}) as Record<string, unknown>;
    const remoteUrl = metadata.remoteUrl as string | undefined;
    if (!data.storage_path && remoteUrl) {
      return NextResponse.json({ ok: true, url: remoteUrl });
    }

    if (!data.storage_path) {
      return NextResponse.json({ ok: false, message: "File is not stored in Supabase" }, { status: 400 });
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from(LIBRARY_BUCKET)
      .createSignedUrl(data.storage_path, 120);

    if (signedError || !signed?.signedUrl) {
      throw signedError ?? new Error("Failed to create signed URL");
    }

    return NextResponse.json({ ok: true, url: signed.signedUrl });
  } catch (error) {
    return handleError(error);
  }
}


