"use server";

import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireJournalRole } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ journalId: string }>;
};

/**
 * GET /api/journals/[journalId]/issues
 * List issues for a journal (used by editor Issue tab & manager views).
 *
 * Permissions:
 * - Journal managers, editors, section editors, and site admins can view.
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { journalId } = await context.params;
    if (!journalId) {
      return NextResponse.json({ ok: false, message: "Journal tidak ditemukan." }, { status: 400 });
    }

    // Allow managers/editors/section editors (and site admins) to view issues
    await requireJournalRole(request, journalId, ["manager", "editor", "section_editor"]);

    const supabase = getSupabaseAdminClient();

    const { data: issues, error } = await supabase
      .from("issues")
      .select("id, journal_id, year, volume, number, published, date_published, seq")
      .eq("journal_id", journalId)
      .order("year", { ascending: false })
      .order("volume", { ascending: false })
      .order("number", { ascending: false });

    if (error) {
      throw error;
    }

    const issueIds = (issues ?? []).map((issue) => issue.id);
    let titleMap = new Map<string, string>();

    if (issueIds.length > 0) {
      const { data: settings } = await supabase
        .from("issue_settings")
        .select("issue_id, setting_value")
        .eq("setting_name", "title")
        .in("issue_id", issueIds)
        .eq("locale", "en_US");

      titleMap = new Map(
        (settings ?? []).map((setting) => [setting.issue_id as string, setting.setting_value as string]),
      );
    }

    const normalized = (issues ?? []).map((issue) => ({
      id: issue.id,
      title:
        titleMap.get(issue.id) ??
        `Volume ${issue.volume ?? "-"} Number ${issue.number ?? "-"} (${issue.year ?? "-"})`,
      year: issue.year,
      volume: issue.volume,
      number: issue.number,
      published: issue.published,
      datePublished: issue.date_published,
      seq: issue.seq,
    }));

    return NextResponse.json({
      ok: true,
      issues: normalized,
    });
  } catch (error) {
    console.error("Error loading issues:", error);
    const message =
      error instanceof Error && (error as any).status === 403
        ? "Forbidden"
        : error instanceof Error && (error as any).status === 401
        ? "Unauthorized"
        : "Gagal memuat daftar issue.";
    const status =
      error instanceof Error && (error as any).status === 403
        ? 403
        : error instanceof Error && (error as any).status === 401
        ? 401
        : 500;

    return NextResponse.json({ ok: false, message }, { status });
  }
}

/**
 * POST /api/journals/[journalId]/issues
 * Create or update an issue for a journal.
 *
 * Body (create):
 * { volume?: number, number?: number, year?: number, title?: string }
 *
 * Body (update):
 * { id: string, volume?: number, number?: number, year?: number, title?: string, published?: boolean, datePublished?: string | null }
 */
export async function POST(request: NextRequest, context: RouteParams) {
  const { journalId } = await context.params;
  if (!journalId) {
    return NextResponse.json({ ok: false, message: "Journal tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        id?: string;
        volume?: number | null;
        number?: number | null;
        year?: number | null;
        title?: string | null;
        published?: boolean;
        datePublished?: string | null;
      }
    | null;

  if (!body) {
    return NextResponse.json({ ok: false, message: "Payload tidak valid." }, { status: 400 });
  }

  try {
    // Only managers (or site admins) can create/update issues
    await requireJournalRole(request, journalId, ["manager"]);

    const supabase = getSupabaseAdminClient();
    const isUpdate = !!body.id;

    if (isUpdate) {
      const updates: Record<string, unknown> = {};

      if (body.volume !== undefined) updates.volume = body.volume;
      if (body.number !== undefined) updates.number = body.number;
      if (body.year !== undefined) updates.year = body.year;
      if (body.published !== undefined) updates.published = body.published;
      if (body.datePublished !== undefined) updates.date_published = body.datePublished;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("issues")
          .update(updates)
          .eq("id", body.id)
          .eq("journal_id", journalId);
        if (error) throw error;
      }

      if (body.title !== undefined) {
        const { error: settingsError } = await supabase
          .from("issue_settings")
          .upsert(
            {
              issue_id: body.id,
              setting_name: "title",
              setting_value: body.title ?? "",
              setting_type: "string",
              locale: "en_US",
            },
            { onConflict: "issue_id,setting_name,locale" },
          );
        if (settingsError) throw settingsError;
      }
    } else {
      // Create new issue
      const insertPayload: any = {
        journal_id: journalId,
        volume: body.volume ?? null,
        number: body.number ?? null,
        year: body.year ?? null,
        published: body.published ?? false,
        date_published: body.datePublished ?? null,
      };

      const { data, error } = await supabase
        .from("issues")
        .insert(insertPayload)
        .select("id")
        .single();
      if (error) throw error;

      const issueId = data.id as string;

      if (body.title) {
        const { error: settingsError } = await supabase.from("issue_settings").insert({
          issue_id: issueId,
          setting_name: "title",
          setting_value: body.title,
          setting_type: "string",
          locale: "en_US",
        });
        if (settingsError) throw settingsError;
      }
    }

    const refreshed = await loadIssuesForJournal(journalId);
    return NextResponse.json({ ok: true, issues: refreshed });
  } catch (error) {
    console.error("Error saving issue:", error);
    const message =
      error instanceof Error && (error as any).status === 403
        ? "Forbidden"
        : error instanceof Error && (error as any).status === 401
        ? "Unauthorized"
        : "Gagal menyimpan issue.";
    const status =
      error instanceof Error && (error as any).status === 403
        ? 403
        : error instanceof Error && (error as any).status === 401
        ? 401
        : 500;

    return NextResponse.json({ ok: false, message }, { status });
  }
}

async function loadIssuesForJournal(journalId: string) {
  const supabase = getSupabaseAdminClient();

  const { data: issues, error } = await supabase
    .from("issues")
    .select("id, journal_id, year, volume, number, published, date_published, seq")
    .eq("journal_id", journalId)
    .order("year", { ascending: false })
    .order("volume", { ascending: false })
    .order("number", { ascending: false });

  if (error) {
    throw error;
  }

  const issueIds = (issues ?? []).map((issue) => issue.id);
  let titleMap = new Map<string, string>();

  if (issueIds.length > 0) {
    const { data: settings } = await getSupabaseAdminClient()
      .from("issue_settings")
      .select("issue_id, setting_value")
      .eq("setting_name", "title")
      .in("issue_id", issueIds)
      .eq("locale", "en_US");

    titleMap = new Map(
      (settings ?? []).map((setting) => [setting.issue_id as string, setting.setting_value as string]),
    );
  }

  return (issues ?? []).map((issue) => ({
    id: issue.id,
    title:
      titleMap.get(issue.id) ??
      `Volume ${issue.volume ?? "-"} Number ${issue.number ?? "-"} (${issue.year ?? "-"})`,
    year: issue.year,
    volume: issue.volume,
    number: issue.number,
    published: issue.published,
    datePublished: issue.date_published,
    seq: issue.seq,
  }));
}
