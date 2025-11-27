"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FormMessage } from "@/components/ui/form-message";
import type { SubmissionDetail } from "../../../types";

type IssueOption = {
  id: string;
  title: string;
  published: boolean;
};

type SectionOption = {
  id: string;
  title: string;
};

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  isPublished: boolean;
};

export function IssueTab({ submissionId, detail, isPublished }: Props) {
  const router = useRouter();
  const currentVersion = detail.versions?.[0];
  const journalId = detail.summary.journalId;
  const [issues, setIssues] = useState<IssueOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [issueId, setIssueId] = useState<string | null>(currentVersion?.issue?.id ?? null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [pages, setPages] = useState<string>("");
  const [urlPath, setUrlPath] = useState<string>("");
  const [datePublished, setDatePublished] = useState<string>(
    currentVersion?.publishedAt ?? new Date().toISOString().split("T")[0]
  );
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!journalId) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setFeedback(null);
      try {
        const [issuesRes, sectionsRes] = await Promise.all([
          fetch(`/api/journals/${journalId}/issues`).then((res) => res.json()),
          fetch(`/api/journals/${journalId}/sections`).then((res) => res.json()),
        ]);

        if (cancelled) {
          return;
        }

        if (issuesRes.ok) {
          setIssues(issuesRes.issues ?? []);
        } else {
          setFeedback({ tone: "error", message: issuesRes.message ?? "Failed to load issues." });
        }

        if (sectionsRes.ok) {
          setSections(sectionsRes.sections ?? []);
        } else {
          setFeedback({ tone: "error", message: sectionsRes.message ?? "Failed to load sections." });
        }
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            tone: "error",
            message: error instanceof Error ? error.message : "Failed to load issue data.",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [journalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVersion) {
      setFeedback({ tone: "error", message: "Submission version tidak ditemukan." });
      return;
    }
    if (!issueId) {
      setFeedback({ tone: "error", message: "Pilih issue terlebih dahulu." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/editor/submissions/${submissionId}/publications/${currentVersion.id}/issue`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueId,
            sectionId,
            pages: pages || null,
            urlPath: urlPath || null,
            datePublished,
          }),
        }
      );
      const json = await res.json();
      if (!json.ok) {
        setFeedback({ tone: "error", message: json.message ?? "Failed to save issue assignment." });
        return;
      }
      setFeedback({ tone: "success", message: json.message ?? "Issue assignment saved." });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to save issue assignment.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const disabled = isPublished || loading || isSaving;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#002C40",
          marginBottom: "0.5rem",
        }}
      >
        Issue
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "1.5rem",
        }}
      >
        {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}
        {/* Issue Assignment */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Issue
          </span>
          <select
            value={issueId ?? ""}
            onChange={(e) => setIssueId(e.target.value || null)}
            disabled={disabled}
            title="Select issue for publication"
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: disabled ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <option value="">{loading ? "Loading issues..." : "Select an issue..."}</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.title}
              </option>
            ))}
          </select>
        </label>

        {/* Section */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Section
          </span>
          <select
            value={sectionId ?? ""}
            onChange={(e) => setSectionId(e.target.value || null)}
            disabled={disabled}
            title="Select section for publication"
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: disabled ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <option value="">{loading ? "Loading sections..." : "Select a section..."}</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </label>

        {/* Pages */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Pages
          </span>
          <input
            type="text"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            disabled={disabled}
            placeholder="e.g., 1-10"
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* URL Path */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            URL Path
          </span>
          <input
            type="text"
            value={urlPath}
            onChange={(e) => setUrlPath(e.target.value)}
            disabled={disabled}
            placeholder="e.g., article-title"
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* Date Published */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Date Published
          </span>
          <input
            type="date"
            value={datePublished}
            onChange={(e) => setDatePublished(e.target.value)}
            disabled={disabled}
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {!isPublished && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="submit"
              disabled={disabled}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.25rem",
                border: "1px solid #006798",
                backgroundColor: disabled ? "#7baac0" : "#006798",
                color: "#ffffff",
                height: "2rem",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: disabled ? 0.8 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}



