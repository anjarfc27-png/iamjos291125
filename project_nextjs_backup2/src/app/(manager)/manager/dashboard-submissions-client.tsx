"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { SubmissionTable } from "@/features/editor/components/submission-table";
import { useAuth } from "@/contexts/AuthContext";
import type { EditorDashboardStats, SubmissionSummary } from "@/features/editor/types";
import { useI18n } from "@/contexts/I18nContext";

type FetchResult<T> = { ok: boolean; error?: string;[key: string]: any } & T;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as FetchResult<T>;
  if (!res.ok || !json?.ok) {
    const errorMessage = typeof json?.error === "string" ? json.error : `Request failed ${res.status}`;
    console.error(`Fetch failed for ${url}:`, errorMessage);
    throw new Error(errorMessage);
  }
  return json as unknown as T;
}

interface ManagerDashboardSubmissionsClientProps {
  journalId?: string;
}

export function ManagerDashboardSubmissionsClient({ journalId }: ManagerDashboardSubmissionsClientProps) {
  const { user } = useAuth();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EditorDashboardStats | null>(null);
  const [myQueue, setMyQueue] = useState<SubmissionSummary[]>([]);
  const [unassigned, setUnassigned] = useState<SubmissionSummary[]>([]);
  const [active, setActive] = useState<SubmissionSummary[]>([]);
  const [archived, setArchived] = useState<SubmissionSummary[]>([]);

  const isManagerOrAdmin = useMemo(
    () => user?.roles?.some((r) => r.role_path === "admin" || r.role_path === "manager") ?? false,
    [user],
  );

  // Load stats + submissions (mirrors OJS dashboard/index.tpl queues)
  useEffect(() => {
    let activeRequest = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Construct URLs with journalId if present
        const statsUrl = journalId ? `/api/editor/dashboard?journalId=${journalId}` : "/api/editor/dashboard";
        const myUrl = journalId ? `/api/editor/submissions?queue=my&journalId=${journalId}` : "/api/editor/submissions?queue=my";
        const unassignedUrl = journalId ? `/api/editor/submissions?queue=unassigned&journalId=${journalId}` : "/api/editor/submissions?queue=unassigned";
        const allUrl = journalId ? `/api/editor/submissions?queue=all&journalId=${journalId}` : "/api/editor/submissions?queue=all";
        const archivedUrl = journalId ? `/api/editor/submissions?queue=archived&journalId=${journalId}` : "/api/editor/submissions?queue=archived";

        const [statsRes, myRes, unassignedRes, allRes, archivedRes] = await Promise.all([
          fetchJson<{ stats: EditorDashboardStats }>(statsUrl),
          fetchJson<{ submissions: SubmissionSummary[] }>(myUrl),
          fetchJson<{ submissions: SubmissionSummary[] }>(unassignedUrl),
          fetchJson<{ submissions: SubmissionSummary[] }>(allUrl),
          fetchJson<{ submissions: SubmissionSummary[] }>(archivedUrl),
        ]);

        if (!activeRequest) return;
        setStats(statsRes.stats);
        setMyQueue(myRes.submissions);
        setUnassigned(unassignedRes.submissions);
        setActive(allRes.submissions);
        setArchived(archivedRes.submissions);
      } catch (err) {
        if (!activeRequest) return;
        console.error("Dashboard data load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load submissions");
      } finally {
        if (activeRequest) {
          setLoading(false);
        }
      }
    }
    if (user) {
      loadData();
    }
    return () => {
      activeRequest = false;
    };
  }, [user, journalId]);

  // Styling active/inactive tabs (same logic as editor page)
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const updateTabStyling = () => {
      const triggers = container.querySelectorAll("[data-value]");
      triggers.forEach((trigger) => {
        const el = trigger as HTMLElement;
        const isActive = el.getAttribute("data-state") === "active";

        if (isActive) {
          el.style.backgroundColor = "#ffffff";
          el.style.color = "rgba(0, 0, 0, 0.84)";
          el.style.borderTop = "none";
          el.style.borderRight = "none";
          el.style.borderBottom = "2px solid #006798";
          el.style.borderLeft = "none";
          el.style.marginBottom = "0";

          const badge = el.querySelector("span");
          if (badge) {
            (badge as HTMLElement).style.backgroundColor = "#ffffff";
            (badge as HTMLElement).style.border = "1px solid rgba(0, 0, 0, 0.2)";
            (badge as HTMLElement).style.color = "rgba(0, 0, 0, 0.54)";
          }
        } else {
          el.style.backgroundColor = "transparent";
          el.style.color = "#006798";
          el.style.borderTop = "none";
          el.style.borderRight = "none";
          el.style.borderBottom = "2px solid transparent";
          el.style.borderLeft = "none";

          const badge = el.querySelector("span");
          if (badge) {
            (badge as HTMLElement).style.backgroundColor = "#ffffff";
            (badge as HTMLElement).style.border = "1px solid #006798";
            (badge as HTMLElement).style.color = "#006798";
          }
        }
      });
    };

    updateTabStyling();

    const observer = new MutationObserver(updateTabStyling);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ["data-state"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h3 className="font-bold">Error loading dashboard</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section
      className="pkp_submission_list"
      style={{
        padding: 0,
        backgroundColor: "#eaedee",
        minHeight: "100%",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* Page Header: "Submissions" (OJS 3.3) */}
      <div
        className="pkp_page_header"
        style={{
          padding: "1.5rem 2rem 0 2rem",
          backgroundColor: "#ffffff",
          borderBottom: "2px solid #e5e5e5",
        }}
      >
        <h1
          className="app__pageHeading pkp_page_title"
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}
        >
          Submissions
        </h1>
      </div>

      {/* Tabs: My Queue, Unassigned, Active, Archive (mirroring dashboard/index.tpl) */}
      <PkpTabs defaultValue="myQueue" className="w-full">
        <div
          ref={tabsContainerRef}
          style={{
            borderBottom: "1px solid #ddd",
            background: "transparent",
            padding: "0 2rem",
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            margin: 0,
          }}
        >
          <div style={{ display: "flex", flex: 1, alignItems: "flex-end" }}>
            <PkpTabsList style={{ flex: 1, borderBottom: "none", padding: 0 }}>
              {/* My Queue */}
              <PkpTabsTrigger value="myQueue">
                My Queue
                {(stats?.myQueue ?? 0) > 0 && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(0, 0, 0, 0.2)",
                      color: "rgba(0, 0, 0, 0.54)",
                      padding: "0 0.25rem",
                      borderRadius: "50%",
                      minWidth: "20px",
                      height: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      lineHeight: "1",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stats?.myQueue ?? 0}
                  </span>
                )}
              </PkpTabsTrigger>

              {/* Unassigned (Manager/Admin only) */}
              {isManagerOrAdmin && (
                <PkpTabsTrigger value="unassigned">
                  Unassigned
                  {(stats?.unassigned ?? 0) > 0 && (
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        color: "#006798",
                        padding: "0 0.25rem",
                        borderRadius: "50%",
                        minWidth: "20px",
                        height: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        lineHeight: "1",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {stats?.unassigned ?? 0}
                    </span>
                  )}
                </PkpTabsTrigger>
              )}

              {/* Active (All Active in our stats) */}
              {isManagerOrAdmin && (
                <PkpTabsTrigger value="active">
                  All Active
                  {(stats?.allActive ?? 0) > 0 && (
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        color: "#006798",
                        padding: "0 0.25rem",
                        borderRadius: "50%",
                        minWidth: "20px",
                        height: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        lineHeight: "1",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {stats?.allActive ?? 0}
                    </span>
                  )}
                </PkpTabsTrigger>
              )}

              {/* Archives */}
              <PkpTabsTrigger value="archives">
                Archives
                {(stats?.archived ?? 0) > 0 && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(0, 0, 0, 0.2)",
                      color: "#006798",
                      padding: "0 0.25rem",
                      borderRadius: "50%",
                      minWidth: "20px",
                      height: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      lineHeight: "1",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stats?.archived ?? 0}
                  </span>
                )}
              </PkpTabsTrigger>
            </PkpTabsList>
          </div>
        </div>

        <div style={{ padding: "2rem" }}>
          <PkpTabsContent value="myQueue">
            <SubmissionTable submissions={myQueue} />
          </PkpTabsContent>

          {isManagerOrAdmin && (
            <>
              <PkpTabsContent value="unassigned">
                <SubmissionTable submissions={unassigned} />
              </PkpTabsContent>

              <PkpTabsContent value="active">
                <SubmissionTable submissions={active} />
              </PkpTabsContent>
            </>
          )}

          <PkpTabsContent value="archives">
            <SubmissionTable submissions={archived} />
          </PkpTabsContent>
        </div>
      </PkpTabs>
    </section>
  );
}
