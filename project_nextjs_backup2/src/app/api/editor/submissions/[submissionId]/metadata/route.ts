"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserSiteRole, hasUserJournalRole } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { submissionId } = await context.params;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  // Check permissions - only editors, section editors, and managers (or site admin) can update metadata
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("journal_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submission) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 404 });
  }

  const isSiteAdmin = await hasUserSiteRole(user.id, "admin");
  const canEdit = await hasUserJournalRole(user.id, submission.journal_id, [
    "manager",
    "editor",
    "section_editor",
  ]);

  if (!isSiteAdmin && !canEdit) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    abstract?: string | null;
    keywords?: string[] | null;
    metadata?: Record<string, unknown> | null;
  } | null;

  if (!body) {
    return NextResponse.json({ ok: false, message: "Permintaan tidak valid." }, { status: 400 });
  }

  try {
    // Build updates – keep other metadata keys intact if provided
    const updates: Record<string, unknown> = {};
    if (typeof body.title === "string") {
      updates.title = body.title.trim();
    }

    // Merge metadata fields (abstract, keywords) into existing metadata object
    let metadataUpdates: Record<string, unknown> | null = null;
    if (body.metadata && typeof body.metadata === "object") {
      metadataUpdates = body.metadata;
    } else {
      const meta: Record<string, unknown> = {};
      if (typeof body.abstract === "string" || body.abstract === null) {
        meta.abstract = body.abstract ?? null;
      }
      if (Array.isArray(body.keywords) || body.keywords === null) {
        meta.keywords = body.keywords ?? null;
      }
      if (Object.keys(meta).length > 0) {
        metadataUpdates = meta;
      }
    }

    if (metadataUpdates) {
      updates.metadata = metadataUpdates;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, message: "Tidak ada perubahan yang dikirim." }, { status: 400 });
    }

    const { error } = await supabase.from("submissions").update(updates).eq("id", submissionId);
    if (error) throw error;

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "metadata",
      message: `Memperbarui metadata submission${updates.title ? " (judul)" : ""}.`,
      metadata: {
        changed: Object.keys(updates),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal memperbarui metadata." }, { status: 500 });
  }
}
