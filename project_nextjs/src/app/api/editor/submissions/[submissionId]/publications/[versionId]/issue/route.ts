
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, hasUserJournalRole, hasUserSiteRole } from "@/lib/permissions";
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ submissionId: string; versionId: string }>;
};

export async function POST(request: Request, context: RouteParams) {
  try {
    const { submissionId, versionId } = await context.params;
    if (!submissionId || !versionId) {
      return NextResponse.json({ ok: false, message: "Parameter tidak lengkap." }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      issueId?: string;
      sectionId?: string | null;
      pages?: string | null;
      urlPath?: string | null;
      datePublished?: string | null;
    } | null;

    if (!body?.issueId) {
      return NextResponse.json({ ok: false, message: "Issue wajib dipilih." }, { status: 400 });
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
    const canManage = await hasUserJournalRole(user.id, submission.journal_id, ["manager", "editor", "section_editor"]);

    if (!isSiteAdmin && !canManage) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const { data: version, error: versionError } = await supabase
      .from("submission_versions")
      .select("id, submission_id, metadata")
      .eq("id", versionId)
      .eq("submission_id", submissionId)
      .maybeSingle();

    if (versionError || !version) {
      return NextResponse.json({ ok: false, message: "Versi submission tidak ditemukan." }, { status: 404 });
    }

    const currentMetadata = (version.metadata as Record<string, unknown>) ?? {};
    const updatedMetadata = {
      ...currentMetadata,
      issuePages: body.pages ?? null,
      issueSectionId: body.sectionId ?? null,
      issueUrlPath: body.urlPath ?? null,
      issueDatePublished: body.datePublished ?? null,
    };

    const updates: Record<string, unknown> = {
      issue_id: body.issueId,
      metadata: updatedMetadata,
    };

    if (body.datePublished) {
      updates.published_at = body.datePublished;
    }

    const { error: updateError } = await supabase
      .from("submission_versions")
      .update(updates)
      .eq("id", versionId)
      .eq("submission_id", submissionId);

    if (updateError) {
      throw updateError;
    }

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      actor_id: user.id,
      category: "publication",
      message: "Submission assigned to issue.",
      metadata: {
        versionId,
        issueId: body.issueId,
        sectionId: body.sectionId ?? null,
        pages: body.pages ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Issue assignment saved.",
    });
  } catch (error) {
    console.error("Error assigning issue:", error);
    return NextResponse.json({ ok: false, message: "Gagal menyimpan issue assignment." }, { status: 500 });
  }
}

