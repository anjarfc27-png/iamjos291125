import { randomUUID } from "node:crypto";

import { USE_DUMMY } from "@/lib/dummy";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { DUMMY_SUBMISSIONS } from "./dummy-data";
import { DUMMY_LIBRARY_FILES, DUMMY_REVIEW_FORMS } from "./settings-dummy-data";

type SupabaseClient = ReturnType<typeof getSupabaseAdminClient>;

const EDITOR_USER_ID = "00000000-0000-0000-0000-000000000002";
const MANAGER_USER_ID = "00000000-0000-0000-0000-000000000006";
const AUTHOR_USER_ID = "00000000-0000-0000-0000-000000000003";

let syncPromise: Promise<void> | null = null;

const DUMMY_TASKS = [
  {
    submissionId: "1",
    stage: "review" as const,
    title: "Follow up reviewer invitations",
    status: "open",
    assignee: EDITOR_USER_ID,
    dueDays: 3,
  },
  {
    submissionId: "2",
    stage: "copyediting" as const,
    title: "Upload copyedited files",
    status: "open",
    assignee: EDITOR_USER_ID,
    dueDays: 5,
  },
  {
    submissionId: "5",
    stage: "review" as const,
    title: "Check reviewer recommendations",
    status: "open",
    assignee: MANAGER_USER_ID,
    dueDays: 2,
  },
  {
    submissionId: "1",
    stage: "submission" as const,
    title: "Review initial submission",
    status: "open",
    assignee: null, // Unassigned - any editor can claim this
    dueDays: 7,
  },
  {
    submissionId: "3",
    stage: "review" as const,
    title: "Assign reviewers for round 1",
    status: "open",
    assignee: null, // Unassigned
    dueDays: 5,
  },
];

const DUMMY_QUERIES = [
  {
    submissionId: "1",
    stage: "review" as const,
    title: "Need reviewer confirmation",
    message: "Please confirm if Reviewer A agreed to proceed.",
    participants: [EDITOR_USER_ID, MANAGER_USER_ID],
    response: "Yes, reviewer confirmed and will submit next week.",
    closed: false,
  },
  {
    submissionId: "2",
    stage: "copyediting" as const,
    title: "Copyediting checklist",
    message: "We need clarification on figure formatting.",
    participants: [EDITOR_USER_ID, AUTHOR_USER_ID],
    response: "Author will provide updated figures tomorrow.",
    closed: false,
  },
];

/**
 * Pastikan data dummy untuk Editor tersimpan di Supabase supaya seluruh
 * operasi CRUD (list submissions, detail, assignments) tetap melewati DB.
 */
export async function ensureDummyEditorData() {
  if (!USE_DUMMY) {
    return;
  }

  if (!syncPromise) {
    syncPromise = syncDummyData().catch((error) => {
      // Better error logging for Supabase errors
      if (error && typeof error === "object") {
        // Supabase errors have code, message, details, hint properties
        const errorObj = error as any;
        console.error("Failed to sync dummy editor data:");
        console.error("  Code:", errorObj.code || "N/A");
        console.error("  Message:", errorObj.message || "N/A");
        console.error("  Details:", errorObj.details || "N/A");
        console.error("  Hint:", errorObj.hint || "N/A");
        console.error("  Full error:", error);
      } else if (error instanceof Error) {
        console.error("Failed to sync dummy editor data:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Failed to sync dummy editor data:", error);
      }
      syncPromise = null;
      // Don't throw - just log the error so pages can still load
      // The error will be logged but won't break the page
      return;
    });
  }

  return syncPromise;
}

async function syncDummyData() {
  try {
    const supabase = getSupabaseAdminClient();

    // Check if dummy data already exists by querying metadata JSONB field
    const { data: existing, error } = await supabase
      .from("submissions")
      .select("id")
      .eq("metadata->>source", "dummy")
      .limit(1);

    if (!error && existing && existing.length > 0) {
      return;
    }

    const journalMap = await ensureJournals(supabase);

  const submissionsPayload = DUMMY_SUBMISSIONS.map((submission) => {
    const journalUuid = journalMap.get(submission.journalId);
    if (!journalUuid) {
      throw new Error(`Missing journal mapping for dummy journal ${submission.journalId}`);
    }
    return {
      id: randomUUID(),
      journal_id: journalUuid,
      title: submission.title,
      status: submission.status,
      current_stage: submission.stage,
      is_archived: submission.isArchived,
      submitted_at: submission.submittedAt,
      updated_at: submission.updatedAt,
      corresponding_author: submission.author_name ? { name: submission.author_name } : null,
      metadata: {
        source: "dummy",
        dummy_id: submission.id,
        author_name: submission.author_name,
      },
    };
  });

  const { data: insertedSubmissions, error: insertError } = await supabase
    .from("submissions")
    .insert(submissionsPayload)
    .select("id, current_stage, is_archived, submitted_at, updated_at, metadata");

  if (insertError) {
    console.error("Error inserting submissions:", insertError);
    throw insertError;
  }

  const submissionIdMap = new Map<string, { id: string; stage: string; submitted_at: string; updated_at: string; is_archived: boolean }>();
  insertedSubmissions?.forEach((row) => {
    const dummyId = (row.metadata as { dummy_id?: string } | null)?.dummy_id;
    if (dummyId) {
      submissionIdMap.set(dummyId, {
        id: row.id,
        stage: row.current_stage,
        submitted_at: row.submitted_at,
        updated_at: row.updated_at,
        is_archived: row.is_archived,
      });
    }
  });

  if (submissionIdMap.size === 0) {
    // Fallback: map sequentially as last resort
    DUMMY_SUBMISSIONS.forEach((submission, index) => {
      const row = insertedSubmissions?.[index];
      if (row) {
        submissionIdMap.set(submission.id, {
          id: row.id,
          stage: row.current_stage,
          submitted_at: row.submitted_at,
          updated_at: row.updated_at,
          is_archived: row.is_archived,
        });
      }
    });
  }

  const versionRows = DUMMY_SUBMISSIONS.map((submission) => {
    const mapped = submissionIdMap.get(submission.id);
    if (!mapped) return null;
    return {
      submission_id: mapped.id,
      version: 1,
      status: submission.isArchived ? "published" : "draft",
      published_at: submission.isArchived ? mapped.updated_at : null,
      issue_id: null,
    };
  }).filter(Boolean) as Array<{
    submission_id: string;
    version: number;
    status: string;
    published_at: string | null;
    issue_id: string | null;
  }>;

  if (versionRows.length > 0) {
    const { error: versionsError } = await supabase.from("submission_versions").insert(versionRows);
    if (versionsError) {
      console.error("Error inserting submission versions:", versionsError);
      throw versionsError;
    }
  }

  const submissionDatabaseIds = Array.from(submissionIdMap.values()).map((row) => row.id);
  const { data: submissionVersions } = await supabase
    .from("submission_versions")
    .select("id, submission_id")
    .in("submission_id", submissionDatabaseIds);

  const versionIdMap = new Map<string, string>();
  submissionVersions?.forEach((row) => {
    if (!versionIdMap.has(row.submission_id)) {
      versionIdMap.set(row.submission_id, row.id);
    }
  });

  const participantRows = DUMMY_SUBMISSIONS.flatMap((submission) => {
    const mapped = submissionIdMap.get(submission.id);
    if (!mapped) return [];
    const rows: Array<{ submission_id: string; user_id: string; role: string; stage: string }> = [];

    if (submission.assignees && submission.assignees.length > 0) {
      submission.assignees.forEach((assignee) => {
        const targetUser = assignee === "current-user-id" ? EDITOR_USER_ID : MANAGER_USER_ID;
        rows.push({
          submission_id: mapped.id,
          user_id: targetUser,
          role: assignee === "current-user-id" ? "editor" : "section_editor",
          stage: mapped.stage,
        });
      });
    }

    rows.push({
      submission_id: mapped.id,
      user_id: AUTHOR_USER_ID,
      role: "author",
      stage: "submission",
    });

    return rows;
  });

  if (participantRows.length > 0) {
    const { error: participantError } = await supabase.from("submission_participants").insert(participantRows);
    if (participantError) {
      console.error("Error inserting submission participants:", participantError);
      throw participantError;
    }
  }

    await seedTasks(supabase, submissionIdMap);
    await seedQueries(supabase, submissionIdMap);
    await seedGalleys(supabase, submissionIdMap, versionIdMap);
    await seedLibraryFiles(supabase, journalMap);
    await seedReviewForms(supabase, journalMap);
  } catch (error) {
    // Log more details about the error
    console.error("Error in syncDummyData:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    // Re-throw to be caught by ensureDummyEditorData
    throw error;
  }
}

async function ensureJournals(supabase: SupabaseClient) {
  try {
    // Di schema OJS lama, tabel "journals" tidak punya kolom "title".
    // Untuk menghindari error 42703, hanya baca kolom yang pasti ada
    // dan map semua dummy journal ke jurnal pertama yang tersedia.
    const { data: existingJournals, error } = await supabase
      .from("journals")
      .select("id, path");

    if (error) {
      console.error("Error fetching journals:", error);
      throw error;
    }

    if (!existingJournals || existingJournals.length === 0) {
      return new Map<string, string>();
    }

    const defaultJournalId = existingJournals[0].id as string;
    const journalMap = new Map<string, string>();
    const uniqueDummyIds = new Set<string>();

    DUMMY_SUBMISSIONS.forEach((submission) => {
      if (!uniqueDummyIds.has(submission.journalId)) {
        uniqueDummyIds.add(submission.journalId);
      }
    });

    uniqueDummyIds.forEach((dummyId) => {
      journalMap.set(dummyId, defaultJournalId);
    });

    return journalMap;
  } catch (error) {
    console.error("Error in ensureJournals:", error);
    throw error;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || `journal-${randomUUID()}`;
}

async function seedTasks(
  supabase: SupabaseClient,
  submissionIdMap: Map<string, { id: string }>
) {
  const { data: existing } = await supabase
    .from("submission_tasks")
    .select("id")
    .limit(1);

  if (existing && existing.length > 0) {
    return;
  }

  const tasks = DUMMY_TASKS.map((task) => {
    const mapped = submissionIdMap.get(task.submissionId);
    if (!mapped) {
      return null;
    }
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + task.dueDays);
    return {
      id: randomUUID(),
      submission_id: mapped.id,
      stage: task.stage,
      title: task.title,
      status: task.status,
      assignee_id: task.assignee,
      due_date: dueDate.toISOString().slice(0, 10),
    };
  }).filter(Boolean) as Array<{
    id: string;
    submission_id: string;
    stage: string;
    title: string;
    status: string;
    assignee_id: string;
    due_date: string;
  }>;

  if (tasks.length > 0) {
    const { error } = await supabase.from("submission_tasks").insert(tasks);
    if (error) {
      console.error("Error inserting tasks:", error);
      throw error;
    }
  }
}
async function seedQueries(
  supabase: SupabaseClient,
  submissionIdMap: Map<string, { id: string }>
) {
  const { data: existing } = await supabase
    .from("queries")
    .select("id")
    .limit(1);

  if (existing && existing.length > 0) {
    return;
  }

  const queries: Array<{
    id: string;
    submission_id: string;
    assoc_type: number;
    assoc_id: string;
    stage_id: string;
    seq: number;
    date_posted: string;
    closed: boolean;
  }> = [];
  const participantsRows: Array<{ query_id: string; user_id: string }> = [];
  const notesRows: Array<{
    id: string;
    query_id: string;
    user_id: string;
    title?: string | null;
    contents: string;
    date_created: string;
  }> = [];

  DUMMY_QUERIES.forEach((query, index) => {
    const mapped = submissionIdMap.get(query.submissionId);
    if (!mapped) {
      return;
    }
    const queryId = randomUUID();
    queries.push({
      id: queryId,
      submission_id: mapped.id,
      assoc_type: 517,
      assoc_id: mapped.id,
      stage_id: query.stage,
      seq: index + 1,
      date_posted: new Date().toISOString(),
      closed: query.closed ?? false,
    });

    const uniqueParticipants = Array.from(new Set([EDITOR_USER_ID, ...query.participants]));
    uniqueParticipants.forEach((participantId) => {
      participantsRows.push({
        query_id: queryId,
        user_id: participantId,
      });
    });

    notesRows.push({
      id: randomUUID(),
      query_id: queryId,
      user_id: EDITOR_USER_ID,
      title: query.title,
      contents: query.message,
      date_created: new Date().toISOString(),
    });

    if (query.response) {
      notesRows.push({
        id: randomUUID(),
        query_id: queryId,
        user_id: query.participants[query.participants.length - 1] ?? AUTHOR_USER_ID,
        contents: query.response,
        date_created: new Date().toISOString(),
      });
    }
  });

  if (queries.length > 0) {
    const { error: queriesError } = await supabase.from("queries").insert(queries);
    if (queriesError) {
      console.error("Error inserting queries:", queriesError);
      throw queriesError;
    }
  }

  if (participantsRows.length > 0) {
    const { error: participantsError } = await supabase.from("query_participants").insert(participantsRows);
    if (participantsError) {
      console.error("Error inserting query participants:", participantsError);
      throw participantsError;
    }
  }

  if (notesRows.length > 0) {
    const { error: notesError } = await supabase.from("query_notes").insert(notesRows);
    if (notesError) {
      console.error("Error inserting query notes:", notesError);
      throw notesError;
    }
  }
}

async function seedGalleys(
  supabase: SupabaseClient,
  submissionIdMap: Map<string, { id: string }>,
  versionIdMap: Map<string, string>,
) {
  const { data: existing } = await supabase.from("galleys").select("id").limit(1);
  if (existing && existing.length > 0) {
    return;
  }

  const rows = DUMMY_SUBMISSIONS.flatMap((submission, index) => {
    const mapped = submissionIdMap.get(submission.id);
    if (!mapped) {
      return [];
    }
    const versionId = versionIdMap.get(mapped.id);
    if (!versionId) {
      return [];
    }
    const isPdf = index % 2 === 0;
    const remoteUrl = `https://dummy-journal.local/${mapped.id}/${isPdf ? "article.pdf" : "index.html"}`;
    return [
      {
        id: randomUUID(),
        submission_version_id: versionId,
        label: isPdf ? "PDF" : "HTML",
        locale: "en",
        file_storage_path: remoteUrl,
        file_size: isPdf ? 524288 : 262144,
        is_public: isPdf,
        is_primary: index === 0,
        sequence: index,
        remote_url: remoteUrl,
      },
    ];
  });

  if (rows.length > 0) {
    const { error } = await supabase.from("galleys").insert(rows);
    if (error) {
      console.error("Error inserting galleys:", error);
      throw error;
    }
  }
}

async function seedLibraryFiles(
  supabase: SupabaseClient,
  journalMap: Map<string, string>,
) {
  const { data: existing } = await supabase.from("library_files").select("id").limit(1);
  if (existing && existing.length > 0) {
    return;
  }

  const journalId = getFirstJournalId(journalMap);
  if (!journalId) {
    return;
  }

  const rows = DUMMY_LIBRARY_FILES.map((file, index) => {
    const createdAt = file.dateUploaded ? new Date(file.dateUploaded) : new Date();
    return {
      id: randomUUID(),
      context_id: journalId,
      submission_id: null,
      file_name: file.fileName,
      file_type: file.fileType,
      file_size: parseSizeLabel(file.size),
      original_file_name: file.fileName,
      file_stage: 1,
      storage_path: null,
      metadata: {
        source: "dummy",
        sizeLabel: file.size,
        stage: "general",
        index,
      },
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    };
  });

  if (rows.length > 0) {
    const { error } = await supabase.from("library_files").insert(rows);
    if (error) {
      console.error("Error inserting library files:", error);
      throw error;
    }
  }
}

async function seedReviewForms(
  supabase: SupabaseClient,
  journalMap: Map<string, string>,
) {
  const { data: existing } = await supabase.from("review_forms").select("id").limit(1);
  if (existing && existing.length > 0) {
    return;
  }

  const journalId = getFirstJournalId(journalMap);
  if (!journalId) {
    return;
  }

  const rows: Array<{
    id: string;
    context_id: string;
    assoc_type: number;
    assoc_id: string;
    seq: number;
    is_active: boolean;
    metadata: Record<string, unknown>;
  }> = [];
  const settingsRows: Array<{
    review_form_id: string;
    setting_name: string;
    setting_value: string;
    setting_type: string;
    locale: string;
  }> = [];

  DUMMY_REVIEW_FORMS.forEach((form, index) => {
    const id = randomUUID();
    rows.push({
      id,
      context_id: journalId,
      assoc_type: 256,
      assoc_id: journalId,
      seq: index + 1,
      is_active: form.active,
      metadata: {
        source: "dummy",
        questions: form.questions,
      },
    });

    settingsRows.push(
      {
        review_form_id: id,
        setting_name: "title",
        setting_value: form.title,
        setting_type: "string",
        locale: "en_US",
      },
      {
        review_form_id: id,
        setting_name: "description",
        setting_value: form.description ?? "",
        setting_type: "string",
        locale: "en_US",
      },
    );
  });

  if (rows.length > 0) {
    const { error } = await supabase.from("review_forms").insert(rows);
    if (error) {
      console.error("Error inserting review forms:", error);
      throw error;
    }
  }

  if (settingsRows.length > 0) {
    const { error } = await supabase.from("review_form_settings").insert(settingsRows);
    if (error) {
      console.error("Error inserting review form settings:", error);
      throw error;
    }
  }
}

function getFirstJournalId(journalMap: Map<string, string>) {
  for (const [, journalId] of journalMap.entries()) {
    if (journalId) {
      return journalId;
    }
  }
  return null;
}

function parseSizeLabel(label: string) {
  if (!label) {
    return 0;
  }
  const matches = label.trim().match(/^([\d.,]+)\s*(kb|mb|gb)$/i);
  if (!matches) {
    return 0;
  }
  const value = parseFloat(matches[1].replace(",", "."));
  const unit = matches[2].toLowerCase();
  const factor = unit === "gb" ? 1024 * 1024 * 1024 : unit === "mb" ? 1024 * 1024 : 1024;
  return Math.round(value * factor);
}

