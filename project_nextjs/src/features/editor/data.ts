import { cache } from "react";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  EditorDashboardStats,
  SubmissionActivityLog,
  SubmissionDetail,
  SubmissionFile,
  SubmissionParticipant,
  SubmissionStage,
  SubmissionStatus,
  SubmissionSummary,
  SubmissionVersion,
  SubmissionReviewRound,
  Query,
  SubmissionTask,
  PublicationGalley,
} from "./types";
import {
  calculateDashboardStats as calculateDummyStats,
  getFilteredSubmissions,
} from "./dummy-helpers";
import { ensureDummyEditorData } from "./dummy-sync";

type ListSubmissionsParams = {
  queue?: "my" | "unassigned" | "all" | "archived";
  stage?: SubmissionStage;
  search?: string;
  limit?: number;
  offset?: number;
  editorId?: string | null;
  journalId?: string;
};

const FALLBACK_STATS: EditorDashboardStats = {
  myQueue: 0,
  unassigned: 0,
  submission: 0,
  inReview: 0,
  copyediting: 0,
  production: 0,
  allActive: 0,
  archived: 0,
  tasks: 0,
};

export const getSessionUserId = cache(async () => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
});

export async function getEditorDashboardStats(editorId?: string | null, journalId?: string): Promise<EditorDashboardStats> {
  const supabase = getSupabaseAdminClient();

  const [myQueue, unassigned, submission, inReview, copyediting, production, allActive, archived, tasks] = await Promise.all([
    countSubmissions({ supabase, filter: { queue: "my", editorId, journalId } }),
    countSubmissions({ supabase, filter: { queue: "unassigned", journalId } }),
    countSubmissions({ supabase, filter: { stage: "submission", journalId } }),
    countSubmissions({ supabase, filter: { stage: "review", journalId } }),
    countSubmissions({ supabase, filter: { stage: "copyediting", journalId } }),
    countSubmissions({ supabase, filter: { stage: "production", journalId } }),
    countSubmissions({ supabase, filter: { journalId } }),
    countSubmissions({ supabase, filter: { queue: "archived", journalId } }),
    countTasks({ supabase, editorId, journalId }),
  ]);

  return {
    myQueue,
    unassigned,
    submission,
    inReview,
    copyediting,
    production,
    allActive,
    archived,
    tasks,
  };
}

export async function listSubmissions(params: ListSubmissionsParams = {}): Promise<SubmissionSummary[]> {
  const { queue = "all", stage, search, limit = 20, offset = 0, editorId, journalId } = params;
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("submissions")
    .select(
      `
        id`
    )
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (journalId) {
    query = query.eq("journal_id", journalId);
  }

  if (queue === "archived") {
    query = query.eq("is_archived", true);
  } else {
    query = query.eq("is_archived", false);
  }

  if (stage) {
    query = query.eq("current_stage", stage);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (queue === "my" && editorId) {
    const assignedIds = await getAssignedSubmissionIds(editorId);
    if (assignedIds.length === 0) {
      // If user has no assigned submissions, show unassigned ones as fallback
      const unassignedIds = await getAssignedSubmissionIdsForRoles();
      if (unassignedIds.length > 0) {
        query = query.not("id", "in", unassignedIds);
      }
      // If no unassigned either, return empty (no submissions available)
    } else {
      query = query.in("id", assignedIds);
    }
  }

  if (queue === "unassigned") {
    const assignedIds = await getAssignedSubmissionIdsForRoles();
    if (assignedIds.length > 0) {
      // Exclude submissions that already have editor/section_editor assigned
      // Supabase .not('in') expects a Postgres list; supabase-js supports array directly
      query = query.not("id", "in", assignedIds);
    }
  }

  const { data, error } = await query;
  if (error || !data) {
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    journalId: row.journal_id,
    journalTitle: (row.journal_info as { title?: string } | null)?.title,
    stage: row.current_stage as SubmissionStage,
    current_stage: row.current_stage as SubmissionStage,
    status: row.status as SubmissionStatus,
    isArchived: row.is_archived,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    author_name: (row.metadata as { author_name?: string } | null)?.author_name,
    assignees: [],
  }));
}

export async function getSubmissionDetail(id: string): Promise<SubmissionDetail | null> {
  try {
    await ensureDummyEditorData();
    const supabase = getSupabaseAdminClient();

    // Fetch all data in parallel, but handle errors gracefully
    const [
      { data: submission, error: submissionError },
      { data: versions, error: versionsError },
      { data: participants, error: participantsError },
      { data: files, error: filesError },
      { data: activity, error: activityError },
      { data: reviewRoundsData, error: reviewRoundsError },
      { data: queriesData, error: queriesError },
    ] = await Promise.all([
      supabase
        .from("submissions")
        .select(
          `
            id,
            title,
            status,
            current_stage,
            is_archived,
            submitted_at,
            updated_at,
            journal_id,
            metadata,
            journal_info:journals!submissions_journal_id_fkey (title)`
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("submission_versions")
        .select("id, version, status, metadata, published_at, created_at, issue_id, issues:issue_id (title, year, volume)")
        .eq("submission_id", id)
        .order("version", { ascending: false }),
      supabase
        .from("submission_participants")
        .select("user_id, role, stage, assigned_at")
        .eq("submission_id", id),
      supabase
        .from("submission_files")
        .select("id, label, stage, file_kind, storage_path, version_label, round, is_visible_to_authors, file_size, uploaded_at, uploaded_by")
        .eq("submission_id", id)
        .order("uploaded_at", { ascending: false })
        .limit(50),
      supabase
        .from("submission_activity_logs")
        .select("id, message, category, created_at, actor_id")
        .eq("submission_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("submission_review_rounds")
        .select(
          `
            id,
            stage,
            round,
            status,
            started_at,
            closed_at,
            notes,
            submission_reviews (
              id,
              reviewer_id,
              assignment_date,
              due_date,
              response_due_date,
              status,
              recommendation,
              submitted_at
            )
          `,
        )
        .eq("submission_id", id)
        .order("round", { ascending: true }),
      supabase
        .from("queries")
        .select(
          `
            id,
            stage_id,
            seq,
            date_posted,
            date_modified,
            closed,
            query_participants (user_id),
            notes:query_notes (
              id,
              user_id,
              title,
              contents,
              date_created,
              date_modified
            )
          `
        )
        .eq("submission_id", id)
        .order("seq", { ascending: true }),
    ]);

    // Log errors for debugging (but don't fail if non-critical queries fail)
    if (versionsError) {
      console.warn("Error fetching versions:", versionsError);
    }
    if (participantsError) {
      console.warn("Error fetching participants:", participantsError);
    }
    if (filesError) {
      console.warn("Error fetching files:", filesError);
    }
    if (activityError) {
      console.warn("Error fetching activity:", activityError);
    }
    if (reviewRoundsError) {
      console.warn("Error fetching review rounds:", reviewRoundsError);
    }
    if (queriesError) {
      console.warn("Error fetching queries:", queriesError);
    }

    if (submissionError) {
      console.error("Error fetching submission:", submissionError);
      return null;
    }

    if (!submission) {
      console.warn(`Submission with ID ${id} not found`);
      // Try to check if any submissions exist at all
      const { data: anySubmission } = await supabase
        .from("submissions")
        .select("id, title")
        .limit(1);
      if (anySubmission && anySubmission.length > 0) {
        console.warn(`Found ${anySubmission.length} submission(s) in database, but not with ID ${id}`);
        console.warn(`Example submission ID: ${anySubmission[0]?.id}`);
      } else {
        console.warn("No submissions found in database at all. Dummy data may not have been seeded.");
      }
      return null;
    }

    const summary: SubmissionSummary = {
      id: submission.id,
      title: submission.title,
      journalId: submission.journal_id,
      journalTitle: (submission.journal_info as { title?: string } | null)?.title,
      stage: submission.current_stage as SubmissionStage,
      current_stage: submission.current_stage as SubmissionStage,
      status: submission.status as SubmissionStatus,
      isArchived: submission.is_archived,
      submittedAt: submission.submitted_at,
      updatedAt: submission.updated_at,
      assignees: [],
    };

    const mappedVersionsBase =
      versions?.map((item) => ({
        id: item.id,
        version: item.version,
        status: item.status,
        metadata: (item.metadata as Record<string, unknown>) ?? {},
        issue: item.issues
          ? {
            id: item.issue_id,
            title: (item.issues as { title?: string | null; year?: number | null; volume?: number | null }).title,
            year: (item.issues as { year?: number | null }).year,
            volume: (item.issues as { volume?: number | null }).volume,
          }
          : undefined,
        publishedAt: item.published_at,
        createdAt: item.created_at,
        galleys: [] as PublicationGalley[],
      })) ?? [];

    const versionIds = mappedVersionsBase.map((version) => version.id);
    let galleysByVersion = new Map<string, PublicationGalley[]>();
    if (versionIds.length > 0) {
      const { data: galleysData } = await supabase
        .from("galleys")
        .select(
          `
          id,
          submission_version_id,
          label,
          locale,
          file_storage_path,
          file_size,
          is_public,
          is_primary,
          sequence,
          remote_url,
          submission_file_id,
          created_at,
          updated_at,
          submission_files:submission_file_id (
            id,
            label,
            storage_path,
            file_size
          )
        `,
        )
        .in("submission_version_id", versionIds);

      galleysByVersion = (galleysData ?? []).reduce<Map<string, PublicationGalley[]>>((acc, galley) => {
        const versionId = galley.submission_version_id as string;
        const entry: PublicationGalley = {
          id: galley.id,
          submissionVersionId: versionId,
          label: galley.label,
          locale: galley.locale,
          isApproved: Boolean(galley.is_public),
          isPublic: Boolean(galley.is_public),
          isPrimary: Boolean(galley.is_primary),
          sequence: galley.sequence ?? 0,
          submissionFileId: galley.submission_file_id ?? undefined,
          fileStoragePath:
            galley.file_storage_path ??
            ((galley.submission_files as { storage_path?: string } | null)?.storage_path ?? null),
          fileSize:
            galley.file_size ??
            ((galley.submission_files as { file_size?: number } | null)?.file_size ?? 0),
          remoteUrl: galley.remote_url ?? null,
          createdAt: galley.created_at,
          updatedAt: galley.updated_at,
        };
        const list = acc.get(versionId) ?? [];
        list.push(entry);
        acc.set(versionId, list.sort((a, b) => a.sequence - b.sequence));
        return acc;
      }, new Map());
    }

    const mappedVersions: SubmissionVersion[] = mappedVersionsBase.map((version) => ({
      ...version,
      galleys: galleysByVersion.get(version.id) ?? [],
    }));

    const userIds = new Set<string>();
    participants?.forEach((p) => userIds.add(p.user_id));
    queriesData?.forEach((query) => {
      (query.query_participants as { user_id: string }[] | null)?.forEach((participant) => userIds.add(participant.user_id));
      (query.notes as { user_id: string }[] | null)?.forEach((note) => userIds.add(note.user_id));
    });

    const userMap = await getUserDisplayMap(supabase, Array.from(userIds));

    const mappedParticipants: SubmissionParticipant[] =
      participants?.map((p) => ({
        userId: p.user_id,
        role: p.role,
        stage: p.stage,
        assignedAt: p.assigned_at,
        name: userMap[p.user_id]?.name ?? `User ${p.user_id}`,
        email: userMap[p.user_id]?.email,
      })) ?? [];

    const mappedFiles: SubmissionFile[] =
      files?.map((file) => ({
        id: file.id,
        label: file.label,
        stage: file.stage,
        kind: (file as { file_kind?: string }).file_kind ?? "manuscript",
        storagePath: (file as { storage_path: string }).storage_path,
        versionLabel: (file as { version_label?: string | null }).version_label ?? null,
        round: (file as { round?: number }).round ?? 1,
        isVisibleToAuthors: Boolean((file as { is_visible_to_authors?: boolean }).is_visible_to_authors),
        size: file.file_size,
        uploadedAt: file.uploaded_at,
        uploadedBy: file.uploaded_by,
      })) ?? [];

    const mappedActivity: SubmissionActivityLog[] =
      activity?.map((log) => ({
        id: log.id,
        message: log.message,
        category: log.category,
        createdAt: log.created_at,
        actorId: log.actor_id,
      })) ?? [];

    const reviewRounds: SubmissionReviewRound[] =
      reviewRoundsData?.map((round) => ({
        id: round.id,
        stage: round.stage as SubmissionStage,
        round: round.round,
        status: round.status,
        startedAt: round.started_at,
        closedAt: round.closed_at,
        notes: round.notes,
        reviews:
          (round.submission_reviews as {
            id: string;
            reviewer_id: string;
            assignment_date: string;
            due_date?: string | null;
            response_due_date?: string | null;
            status: string;
            recommendation?: string | null;
            submitted_at?: string | null;
          }[])?.map((review) => ({
            id: review.id,
            reviewerId: review.reviewer_id,
            assignmentDate: review.assignment_date,
            dueDate: review.due_date ?? null,
            responseDueDate: review.response_due_date ?? null,
            status: review.status,
            recommendation: review.recommendation ?? null,
            submittedAt: review.submitted_at ?? null,
          })) ?? [],
      })) ?? [];

    const mappedQueries = queriesData?.map((query) => ({
      id: query.id,
      submissionId: id,
      stage: (query.stage_id as SubmissionStage) ?? (submission.current_stage as SubmissionStage),
      stageId: query.stage_id,
      seq: query.seq,
      datePosted: query.date_posted,
      dateModified: query.date_modified ?? null,
      closed: Boolean(query.closed),
      participants: (query.query_participants as { user_id: string }[] | null)?.map((p) => p.user_id) ?? [],
      notes: (query.notes as {
        id: string;
        user_id: string;
        title?: string | null;
        contents: string;
        date_created: string;
        date_modified?: string | null;
      }[])?.map((note) => ({
        id: note.id,
        queryId: query.id,
        userId: note.user_id,
        userName: userMap[note.user_id]?.name ?? `User ${note.user_id}`,
        title: note.title ?? null,
        contents: note.contents,
        dateCreated: note.date_created,
        dateModified: note.date_modified ?? null,
      })) ?? [],
    })) ?? [];

    return {
      summary,
      metadata: submission.metadata ?? {},
      versions: mappedVersions,
      participants: mappedParticipants,
      files: mappedFiles,
      activity: mappedActivity,
      reviewRounds,
      queries: mappedQueries,
    };
  } catch (error) {
    console.error("Error in getSubmissionDetail:", error);
    return null;
  }
}

type ListTasksParams = {
  assigneeId?: string | null;
  status?: string;
  limit?: number;
};

export async function listSubmissionTasks(params: ListTasksParams = {}): Promise<SubmissionTask[]> {
  const { assigneeId, status, limit = 20 } = params;
  await ensureDummyEditorData();
  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from("submission_tasks")
    .select(
      `
        id,
        submission_id,
        stage,
        title,
        status,
        assignee_id,
        due_date,
        created_at,
        submissions:submission_id (title)
      `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (assigneeId) {
    // First try to get tasks assigned to this user
    query = query.eq("assignee_id", assigneeId);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  // If no tasks found for this user and we're looking for open tasks, also show unassigned ones
  if (assigneeId && (!data || data.length === 0) && (!status || status === "open")) {
    const unassignedQuery = supabase
      .from("submission_tasks")
      .select(
        `
          id,
          submission_id,
          stage,
          title,
          status,
          assignee_id,
          due_date,
          created_at,
          submissions:submission_id (title)
        `
      )
      .is("assignee_id", null)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: unassignedData, error: unassignedError } = await unassignedQuery;
    if (!unassignedError && unassignedData) {
      const mapped = unassignedData.map((row) => ({
        id: row.id,
        submissionId: row.submission_id,
        submissionTitle: (row.submissions as { title?: string } | null)?.title ?? null,
        stage: row.stage as SubmissionStage,
        title: row.title,
        status: row.status,
        assigneeId: row.assignee_id ?? null,
        dueDate: row.due_date ?? null,
        createdAt: row.created_at,
      }));
      return mapped;
    }
  }

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    submissionId: row.submission_id,
    submissionTitle: (row.submissions as { title?: string } | null)?.title ?? null,
    stage: row.stage as SubmissionStage,
    title: row.title,
    status: row.status,
    assigneeId: row.assignee_id ?? null,
    dueDate: row.due_date ?? null,
    createdAt: row.created_at,
  }));
}

async function countSubmissions({
  supabase,
  filter,
}: {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  filter: { queue?: "my" | "unassigned" | "archived"; stage?: SubmissionStage; editorId?: string | null; journalId?: string };
}) {
  await ensureDummyEditorData();
  let query = supabase.from("submissions").select("*", { head: true, count: "exact" });

  if (filter.journalId) {
    query = query.eq("journal_id", filter.journalId);
  }

  if (filter.queue === "archived") {
    query = query.eq("is_archived", true);
  } else {
    query = query.eq("is_archived", false);
  }

  if (filter.stage) {
    query = query.eq("current_stage", filter.stage);
  }

  if (filter.queue === "my" && filter.editorId) {
    const assignedIds = await getAssignedSubmissionIds(filter.editorId);
    if (assignedIds.length === 0) return 0;
    query = query.in("id", assignedIds);
  }

  if (filter.queue === "unassigned") {
    const assignedIds = await getAssignedSubmissionIdsForRoles();
    if (assignedIds.length > 0) {
      query = query.not("id", "in", assignedIds);
    }
  }

  const { count } = await query;
  return count ?? 0;
}

async function countTasks({
  supabase,
  editorId,
  journalId,
}: {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  editorId?: string | null;
  journalId?: string;
}) {
  let query = supabase.from("submission_tasks").select("*", { head: true, count: "exact" }).eq("status", "open");

  if (editorId) {
    query = query.eq("assignee_id", editorId);
  }

  // Note: submission_tasks doesn't have journal_id directly. 
  // We would need to join with submissions table to filter by journalId.
  // For now, we'll skip strict journal filtering on tasks count or assume tasks are filtered by user context.
  // If strict filtering is needed, we'd need a more complex query or a join.
  // However, since we are using Supabase client, we can't easily do a join in a count query without a view or RPC.
  // Let's check if we can filter by submission_id if we fetch submission IDs for the journal first.
  if (journalId) {
    // Fetch submission IDs for this journal first (optimization needed for large datasets)
    const { data: submissions } = await supabase.from("submissions").select("id").eq("journal_id", journalId);
    if (submissions && submissions.length > 0) {
      query = query.in("submission_id", submissions.map(s => s.id));
    } else {
      return 0; // No submissions in this journal, so no tasks
    }
  }

  const { count } = await query;
  return count ?? 0;
}

async function getAssignedSubmissionIds(userId: string) {
  try {
    await ensureDummyEditorData();
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("submission_participants")
      .select("submission_id")
      .eq("user_id", userId)
      .in("role", ["editor", "section_editor"]);
    if (error || !data) {
      throw error;
    }
    return Array.from(new Set(data.map((row) => row.submission_id)));
  } catch {
    return [];
  }
}

async function getAssignedSubmissionIdsForRoles() {
  try {
    await ensureDummyEditorData();
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("submission_participants")
      .select("submission_id")
      .in("role", ["editor", "section_editor"]);
    if (error || !data) {
      throw error;
    }
    return Array.from(new Set(data.map((row) => row.submission_id)));
  } catch {
    return [];
  }
}

// Function removed - now using dummy-helpers.ts functions
// getDummySubmissions is now replaced by getFilteredSubmissions from dummy-helpers.ts

type UserDisplay = {
  name: string;
  email?: string;
};

async function getUserDisplayMap(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  userIds: string[],
): Promise<Record<string, UserDisplay>> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    uniqueIds.map(async (userId) => {
      try {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        if (error || !data.user) {
          return [userId, { name: `User ${userId}` }] as const;
        }
        const metadata = (data.user.user_metadata as { name?: string } | null) ?? {};
        const name = metadata.name ?? data.user.email ?? `User ${userId}`;
        return [userId, { name, email: data.user.email ?? undefined }] as const;
      } catch {
        return [userId, { name: `User ${userId}` }] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}

