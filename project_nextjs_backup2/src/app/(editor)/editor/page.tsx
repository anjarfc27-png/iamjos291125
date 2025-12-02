"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";

import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { SubmissionTable } from "@/features/editor/components/submission-table";
import { useAuth } from "@/contexts/AuthContext";
import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpInput } from "@/components/ui/pkp-input";
import { FormMessage } from "@/components/ui/form-message";
import type {
  EditorDashboardStats,
  SubmissionSummary,
  SubmissionTask,
} from "@/features/editor/types";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = await res.json();
  if (!res.ok || !json?.ok) {
    const errorMessage = typeof json?.error === "string" ? json.error : `Request failed ${res.status}`;
    throw new Error(errorMessage);
  }
  return json as T;
}

export default function EditorPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EditorDashboardStats | null>(null);
  const [myQueue, setMyQueue] = useState<SubmissionSummary[]>([]);
  const [unassigned, setUnassigned] = useState<SubmissionSummary[]>([]);
  const [active, setActive] = useState<SubmissionSummary[]>([]);
  const [archived, setArchived] = useState<SubmissionSummary[]>([]);
  const [tasks, setTasks] = useState<SubmissionTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [tasksFilter, setTasksFilter] = useState<"open" | "completed" | "all">("open");
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [taskActionError, setTaskActionError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<SubmissionTask | null>(null);
  const [editParticipants, setEditParticipants] = useState<
    Array<{ userId: string; name: string; role: string }>
  >([]);
  const [editAssigneeId, setEditAssigneeId] = useState<string>("");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isManagerOrAdmin = useMemo(() => {
    return user?.roles?.some((r) => r.role_path === "admin" || r.role_path === "manager") ?? false;
  }, [user]);

  const showAllTabsForTesting = true;
  const currentUserId = user?.id ?? null;

  useEffect(() => {
    let activeRequest = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [statsRes, myRes, unassignedRes, allRes, archivedRes] = await Promise.all([
          fetchJson<{ stats: EditorDashboardStats }>("/api/editor/dashboard"),
          fetchJson<{ submissions: SubmissionSummary[] }>("/api/editor/submissions?queue=my"),
          fetchJson<{ submissions: SubmissionSummary[] }>("/api/editor/submissions?queue=unassigned"),
          fetchJson<{ submissions: SubmissionSummary[] }>("/api/editor/submissions?queue=all"),
          fetchJson<{ submissions: SubmissionSummary[] }>("/api/editor/submissions?queue=archived"),
        ]);
        if (!activeRequest) return;
        setStats(statsRes.stats);
        setMyQueue(myRes.submissions);
        setUnassigned(unassignedRes.submissions);
        setActive(allRes.submissions);
        setArchived(archivedRes.submissions);
      } catch (err) {
        if (!activeRequest) return;
        setError(err instanceof Error ? err.message : "Failed to load submissions");
      } finally {
        if (activeRequest) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      activeRequest = false;
    };
  }, []);

  useEffect(() => {
    let activeRequest = true;
    async function loadTasks() {
      try {
        setTasksLoading(true);
        setTasksError(null);
        const params = new URLSearchParams();
        params.set("status", tasksFilter);
        const result = await fetchJson<{ tasks: SubmissionTask[] }>(`/api/editor/tasks?${params.toString()}`);
        if (!activeRequest) return;
        setTasks(result.tasks);
      } catch (err) {
        if (!activeRequest) return;
        setTasksError(err instanceof Error ? err.message : "Failed to load tasks");
        setTasks([]);
      } finally {
        if (activeRequest) {
          setTasksLoading(false);
        }
      }
    }
    loadTasks();
    return () => {
      activeRequest = false;
    };
  }, [tasksFilter, tasksRefreshKey]);

  const onTaskAction = async (task: SubmissionTask, action: "complete" | "reopen" | "claim") => {
    if (action === "claim" && !currentUserId) {
      setTaskActionError("Anda harus masuk untuk mengklaim task.");
      return;
    }

    const payload =
      action === "complete"
        ? { status: "completed" as const }
        : action === "reopen"
          ? { status: "open" as const }
          : { assigneeId: currentUserId };

    setTaskActionError(null);
    setUpdatingTaskId(task.id);
    try {
      const res = await fetch(`/api/editor/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Failed to update task");
      }

      if (payload.status) {
        setStats((prev) => {
          if (!prev) return prev;
          const wasCompleted = task.status === "completed";
          const willBeCompleted = payload.status === "completed";
          if (wasCompleted === willBeCompleted) {
            return prev;
          }
          const delta = willBeCompleted ? -1 : 1;
          return { ...prev, tasks: Math.max(0, prev.tasks + delta) };
        });
      }

      setTasksRefreshKey((key) => key + 1);
    } catch (err) {
      setTaskActionError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const openTaskEditor = async (task: SubmissionTask) => {
    setEditingTask(task);
    setEditParticipants([]);
    setEditAssigneeId(task.assigneeId ?? "");
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setEditError(null);
    setEditLoading(true);
    try {
      const res = await fetch(`/api/editor/submissions/${task.submissionId}/participants`);
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message ?? "Gagal memuat peserta");
      }
      setEditParticipants(json.participants ?? []);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Gagal memuat data peserta.");
    } finally {
      setEditLoading(false);
    }
  };

  const closeTaskEditor = () => {
    setEditingTask(null);
    setEditParticipants([]);
    setEditAssigneeId("");
    setEditDueDate("");
    setEditError(null);
    setEditSubmitting(false);
  };

  const handleSaveTaskDetails = async () => {
    if (!editingTask) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const payload = {
        assigneeId: editAssigneeId || null,
        dueDate: editDueDate || null,
      };
      const res = await fetch(`/api/editor/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Gagal menyimpan task");
      }
      setTasksRefreshKey((key) => key + 1);
      closeTaskEditor();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Gagal menyimpan task.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Update tab active styling based on Tabs context
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const updateTabStyling = () => {
      const triggers = container.querySelectorAll('[data-value]');
      triggers.forEach((trigger) => {
        const el = trigger as HTMLElement;
        const value = el.getAttribute('data-value');
        const isActive = el.getAttribute('data-state') === 'active';

        if (isActive) {
          el.style.backgroundColor = '#ffffff'; // White background for active tab
          el.style.color = 'rgba(0, 0, 0, 0.84)'; // Dark grey text
          el.style.borderTop = 'none';
          el.style.borderRight = 'none';
          el.style.borderBottom = '2px solid #006798'; // Blue underline at bottom
          el.style.borderLeft = 'none';
          el.style.marginBottom = '0';
          el.classList.add('pkp_tab_active');

          // Active badge styling - dark grey border and text
          const badge = el.querySelector('span');
          if (badge) {
            badge.style.backgroundColor = '#ffffff';
            badge.style.border = '1px solid rgba(0, 0, 0, 0.2)';
            badge.style.color = 'rgba(0, 0, 0, 0.54)';
          }
        } else {
          el.style.backgroundColor = 'transparent';
          el.style.color = '#006798'; // Blue text for inactive tabs
          el.style.borderTop = 'none';
          el.style.borderRight = 'none';
          el.style.borderBottom = '2px solid transparent';
          el.style.borderLeft = 'none';
          el.classList.remove('pkp_tab_active');

          // Inactive badge styling - blue border and text
          const badge = el.querySelector('span');
          if (badge) {
            badge.style.backgroundColor = '#ffffff';
            badge.style.border = '1px solid #006798';
            badge.style.color = '#006798';
          }
        }
      });
    };

    // Initial update
    updateTabStyling();

    // Watch for changes
    const observer = new MutationObserver(updateTabStyling);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="pkp_submission_list"
      style={{
        padding: 0,
        backgroundColor: "#eaedee",
        minHeight: "100%",
        marginTop: 0,
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Page Header - OJS 3.3 Exact Layout with Safe Area */}
      <div
        className="pkp_page_header"
        style={{
          padding: "1.5rem 2rem 0 2rem",
        }}
      >
        <h1
          className="app__pageHeading pkp_page_title text-2xl font-bold text-[#002C40] mb-2"
        >
          Submissions
        </h1>
      </div>

      {/* Tabs - OJS 3.3 Style */}
      <PkpTabs defaultValue="tasks" className="w-full">
        <div
          ref={tabsContainerRef}
          style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0 2rem",
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            margin: 0,
          }}
        >
          <div style={{ display: "flex", flex: 1 }}>
            <PkpTabsList style={{ flex: 1 }}>
              {/* Tasks Tab */}
              <PkpTabsTrigger value="tasks">
                Tasks
                {stats?.tasks && stats.tasks > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    color: '#006798',
                    padding: '0 0.25rem',
                    borderRadius: '50%',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    lineHeight: '1',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stats.tasks}
                  </span>
                )}
              </PkpTabsTrigger>

              {/* My Queue Tab */}
              <PkpTabsTrigger value="myQueue">
                My Queue
                {(stats?.myQueue ?? 0) > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    color: 'rgba(0, 0, 0, 0.54)',
                    padding: '0 0.25rem',
                    borderRadius: '50%',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    lineHeight: '1',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stats?.myQueue ?? 0}
                  </span>
                )}
              </PkpTabsTrigger>

              {/* Unassigned Tab - Only visible for Manager/Admin */}
              {(isManagerOrAdmin || showAllTabsForTesting) && (
                <PkpTabsTrigger value="unassigned">
                  Unassigned
                  {(stats?.unassigned ?? 0) > 0 && (
                    <span style={{
                      marginLeft: '0.5rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(0, 0, 0, 0.2)',
                      color: '#006798',
                      padding: '0 0.25rem',
                      borderRadius: '50%',
                      minWidth: '20px',
                      height: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      lineHeight: '1',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {stats?.unassigned ?? 0}
                    </span>
                  )}
                </PkpTabsTrigger>
              )}

              {/* All Active Tab - Only visible for Manager/Admin */}
              {(isManagerOrAdmin || showAllTabsForTesting) && (
                <PkpTabsTrigger value="active">
                  All Active
                  {(stats?.allActive ?? 0) > 0 && (
                    <span style={{
                      marginLeft: '0.5rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(0, 0, 0, 0.2)',
                      color: '#006798',
                      padding: '0 0.25rem',
                      borderRadius: '50%',
                      minWidth: '20px',
                      height: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      lineHeight: '1',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {stats?.allActive ?? 0}
                    </span>
                  )}
                </PkpTabsTrigger>
              )}

              {/* Archives Tab - Always visible for Editor */}
              <PkpTabsTrigger value="archive">
                Archives
                {(stats?.archived ?? 0) > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    color: '#006798',
                    padding: '0 0.25rem',
                    borderRadius: '50%',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    lineHeight: '1',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stats?.archived ?? 0}
                  </span>
                )}
              </PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* Help Link - Right side of tabs */}
          <div style={{
            padding: '0 0 0 1rem',
            display: 'flex',
            alignItems: 'center',
            height: '3rem'
          }}>
            <a
              href="#"
              title="Help"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '0.875rem'
              }}
              className="hover:opacity-80"
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#00B24E',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: '1',
                flexShrink: 0
              }}>
                i
              </span>
              <span style={{
                color: '#006798',
                fontSize: '0.875rem',
                fontWeight: 400
              }}>
                Help
              </span>
            </a>
          </div>
        </div>

        {/* Tab Contents */}
        <PkpTabsContent value="tasks" style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}>
          {tasksLoading ? (
            <p className="text-sm text-[var(--muted)]">Loading tasksâ€¦</p>
          ) : tasksError ? (
            <p className="text-sm text-red-500">{tasksError}</p>
          ) : tasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--muted)]">
              No outstanding tasks.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Filter:</label>
                <select
                  value={tasksFilter}
                  onChange={(e) => setTasksFilter(e.target.value as typeof tasksFilter)}
                  className="border border-[var(--border)] rounded px-2 py-1 text-sm"
                >
                  <option value="open">Open</option>
                  <option value="completed">Completed</option>
                  <option value="all">All</option>
                </select>
              </div>
              {taskActionError && (
                <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  {taskActionError}
                </div>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-md border border-[var(--border)] bg-white px-4 py-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm text-[var(--foreground)]">
                      {task.title}
                    </div>
                    <span className="text-xs font-semibold uppercase text-[var(--muted)]">
                      {task.stage}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    Submission: {task.submissionTitle ?? task.submissionId}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    Assignee: {task.assigneeId ? (task.assigneeId === currentUserId ? "You" : task.assigneeId) : "Unassigned"}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    Due: {task.dueDate ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(task.dueDate)) : "â€”"}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    Status: {task.status}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(isManagerOrAdmin || task.assigneeId === currentUserId) && (
                      <button
                        type="button"
                        onClick={() => openTaskEditor(task)}
                        className="text-xs font-semibold rounded border border-slate-400 px-2 py-1 text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    )}
                    {task.status !== "completed" ? (
                      <button
                        type="button"
                        onClick={() => onTaskAction(task, "complete")}
                        disabled={updatingTaskId === task.id}
                        className="text-xs font-semibold rounded border border-green-600 px-2 py-1 text-green-700 hover:bg-green-50 disabled:opacity-50"
                      >
                        {updatingTaskId === task.id ? "Updatingâ€¦" : "Mark Complete"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onTaskAction(task, "reopen")}
                        disabled={updatingTaskId === task.id}
                        className="text-xs font-semibold rounded border border-gray-500 px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {updatingTaskId === task.id ? "Updatingâ€¦" : "Reopen"}
                      </button>
                    )}
                    {!task.assigneeId && currentUserId && (
                      <button
                        type="button"
                        onClick={() => onTaskAction(task, "claim")}
                        disabled={updatingTaskId === task.id}
                        className="text-xs font-semibold rounded border border-blue-600 px-2 py-1 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        {updatingTaskId === task.id ? "Updatingâ€¦" : "Claim Task"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
          }
        </PkpTabsContent >

        <PkpTabsContent value="myQueue" style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}>
          {loading && !myQueue.length ? (
            <p className="text-sm text-[var(--muted)]">Loadingâ€¦</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <SubmissionTable
              submissions={myQueue}
              emptyMessage="Tidak ada submission di My Queue."
              tabLabel="My Assigned"
            />
          )}
        </PkpTabsContent>

        {
          (isManagerOrAdmin || showAllTabsForTesting) && (
            <>
              <PkpTabsContent value="unassigned" style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}>
                {loading && !unassigned.length ? (
                  <p className="text-sm text-[var(--muted)]">Loadingâ€¦</p>
                ) : error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : (
                  <SubmissionTable
                    submissions={unassigned}
                    emptyMessage="Tidak ada submission yang belum ditugaskan."
                    tabLabel="Unassigned"
                  />
                )}
              </PkpTabsContent>

              <PkpTabsContent value="active" style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}>
                {loading && !active.length ? (
                  <p className="text-sm text-[var(--muted)]">Loadingâ€¦</p>
                ) : error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : (
                  <SubmissionTable
                    submissions={active}
                    emptyMessage="Tidak ada submission aktif."
                    tabLabel="All Active"
                  />
                )}
              </PkpTabsContent>
            </>
          )
        }

        <PkpTabsContent value="archive" style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}>
          {loading && !archived.length ? (
            <p className="text-sm text-[var(--muted)]">Loadingâ€¦</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <SubmissionTable
              submissions={archived}
              emptyMessage="Tidak ada submission yang diarsipkan."
              tabLabel="Archives"
            />
          )}
        </PkpTabsContent>

        {
          editingTask && (
            <PkpModal
              isOpen={Boolean(editingTask)}
              onClose={closeTaskEditor}
              title="Ubah Task"
              footer={
                <>
                  <PkpButton variant="onclick" onClick={closeTaskEditor} disabled={editSubmitting}>
                    Batal
                  </PkpButton>
                  <PkpButton
                    variant="primary"
                    onClick={handleSaveTaskDetails}
                    disabled={editSubmitting}
                    loading={editSubmitting}
                  >
                    Simpan
                  </PkpButton>
                </>
              }
            >
              <div className="flex flex-col gap-4">
                <div className="text-sm text-[var(--muted)]">
                  Submission: {editingTask.submissionTitle ?? editingTask.submissionId}
                </div>
                {editError && <FormMessage tone="error">{editError}</FormMessage>}
                <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
                  Assignee
                  {editLoading ? (
                    <p className="text-xs text-[var(--muted)]">Memuat daftar pesertaâ€¦</p>
                  ) : (
                    <PkpSelect
                      value={editAssigneeId}
                      onChange={(e) => setEditAssigneeId(e.target.value)}
                    >
                      <option value="">Tidak ada (unassigned)</option>
                      {editParticipants.map((participant) => (
                        <option key={participant.userId} value={participant.userId}>
                          {participant.name} ({participant.role})
                        </option>
                      ))}
                    </PkpSelect>
                  )}
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
                  Due Date
                  <PkpInput
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                </label>
              </div>
            </PkpModal>
          )
        }
      </PkpTabs >
    </section >
  );
}
