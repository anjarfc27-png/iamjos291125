"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/permissions";

/**
 * Query Server Actions
 * Server actions for managing queries/discussions
 * Based on OJS 3.3 queries system
 */

export type ActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
  queryId?: string;
  noteId?: string;
};

export type CreateQueryData = {
  submissionId: string;
  stage: string;
  title?: string | null;
  message: string;
  participantIds: string[];
};

export type AddNoteData = {
  submissionId: string;
  queryId: string;
  contents: string;
  title?: string | null;
};

export type CloseQueryData = {
  submissionId: string;
  queryId: string;
};

/**
 * Create Query
 * Create a new discussion query/thread
 * Note: This server action uses the API route for consistency
 * For direct database access, use the API route instead: /api/editor/submissions/[submissionId]/queries
 */
export async function createQuery(data: CreateQueryData): Promise<ActionResult> {
  try {
    // Use API route for consistency and proper permission handling
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/editor/submissions/${data.submissionId}/queries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage: data.stage,
        title: data.title,
        message: data.message,
        participantIds: data.participantIds,
      }),
    });

    const json = await res.json();

    if (!json.ok) {
      return {
        ok: false,
        error: json.message ?? "Failed to create query",
      };
    }

    return {
      ok: true,
      message: json.message ?? "Query created successfully",
      queryId: json.query?.id,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create query",
    };
  }
}

/**
 * Add Note to Query
 * Add a note/message to an existing query
 * Note: This server action uses the API route for consistency
 * For direct database access, use the API route instead: /api/editor/submissions/[submissionId]/queries/[queryId]/notes
 */
export async function addQueryNote(data: AddNoteData): Promise<ActionResult> {
  try {
    // Use API route for consistency and proper permission handling
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/editor/submissions/${data.submissionId}/queries/${data.queryId}/notes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: data.contents,
          title: data.title,
        }),
      }
    );

    const json = await res.json();

    if (!json.ok) {
      return {
        ok: false,
        error: json.message ?? "Failed to add note",
      };
    }

    return {
      ok: true,
      message: json.message ?? "Note added successfully",
      noteId: json.note?.id,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to add note",
    };
  }
}

/**
 * Close Query
 * Close a query/discussion thread
 * Note: This server action uses the API route for consistency
 * For direct database access, use the API route instead: /api/editor/submissions/[submissionId]/queries/[queryId]/close
 */
export async function closeQuery(data: CloseQueryData): Promise<ActionResult> {
  try {
    // Use API route for consistency and proper permission handling
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/editor/submissions/${data.submissionId}/queries/${data.queryId}/close`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const json = await res.json();

    if (!json.ok) {
      return {
        ok: false,
        error: json.message ?? "Failed to close query",
      };
    }

    return {
      ok: true,
      message: json.message ?? "Query closed successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to close query",
    };
  }
}

