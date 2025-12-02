"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { SubmissionTable } from "@/features/editor/components/submission-table";
import { useAuth } from "@/contexts/AuthContext";
import type { EditorDashboardStats, SubmissionSummary } from "@/features/editor/types";

type FetchResult<T> = { ok: boolean; error?: string;[key: string]: any } & T;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as FetchResult<T>;
  if (!res.ok || !json?.ok) {
    const errorMessage = typeof json?.error === "string" ? json.error : `Request failed ${res.status}`;
    throw new Error(errorMessage);
  }
  return json as unknown as T;
}

export function ManagerDashboardSubmissionsClient() {
  const { user } = useAuth();

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

              {/* Archive */}
              <PkpTabsTrigger value="archive">
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

          {/* Help Button */}
          <div style={{ marginBottom: "0.5rem" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#006798",
                backgroundColor: "#ffffff",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "#006798",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                i
              </span>
              Help
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <PkpTabsContent
          value="myQueue"
          style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}
        >
          <SubmissionTable
            submissions={myQueue}
            emptyMessage="No submissions found."
            tabLabel="My Assigned"
            isLoading={loading && !myQueue.length}
            error={error}
          />
        </PkpTabsContent>

        {isManagerOrAdmin && (
          <PkpTabsContent
            value="unassigned"
            style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}
          >
            <SubmissionTable
              submissions={unassigned}
              emptyMessage="No submissions found."
              tabLabel="Unassigned"
              isLoading={loading && !unassigned.length}
              error={error}
            />
          </PkpTabsContent>
        )}

        {isManagerOrAdmin && (
          <PkpTabsContent
            value="active"
            style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}
          >
            <SubmissionTable
              submissions={active}
              emptyMessage="No submissions found."
              tabLabel="All Active"
              isLoading={loading && !active.length}
              error={error}
            />
          </PkpTabsContent>
        )}

        <PkpTabsContent
          value="archive"
          style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}
        >
          <SubmissionTable
            submissions={archived}
            emptyMessage="No submissions found."
            tabLabel="Archives"
            isLoading={loading && !archived.length}
            error={error}
          />
        </PkpTabsContent>
      </PkpTabs>
    </section>
  );
}


