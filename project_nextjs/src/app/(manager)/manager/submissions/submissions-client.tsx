"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { SubmissionSummary } from "@/features/editor/types";

type Props = {
  submissions: SubmissionSummary[];
};

const stageOptions = [
  { value: "all", label: "All Stages" },
  { value: "submission", label: "Submission" },
  { value: "review", label: "Review" },
  { value: "copyediting", label: "Copyediting" },
  { value: "production", label: "Production" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "submitted", label: "Submitted" },
  { value: "in_review", label: "In Review" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "published", label: "Published" },
];

export function SubmissionsClient({ submissions: initialSubmissions }: Props) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredSubmissions = useMemo(() => {
    return initialSubmissions.filter((submission) => {
      const matchesSearch =
        !search ||
        submission.title?.toLowerCase().includes(search.toLowerCase()) ||
        submission.assignees.join(", ").toLowerCase().includes(search.toLowerCase());
      const matchesStage = stageFilter === "all" || submission.stage === stageFilter;
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
      return matchesSearch && matchesStage && matchesStatus;
    });
  }, [initialSubmissions, search, stageFilter, statusFilter]);

  return (
    <div style={{ minHeight: "100%", backgroundColor: "#eaedee" }}>
      {/* Header Bar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #dfe3e6",
          padding: "1.5rem 2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#002C40",
                margin: 0,
              }}
            >
              Submissions
            </h1>
            <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.875rem" }}>
              Kelola naskah dan lakukan aksi editorial sesuai peran Manager.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#006798",
                backgroundColor: "transparent",
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
            <div
              style={{
                fontSize: "0.875rem",
                color: "#374151",
              }}
            >
              Showing {filteredSubmissions.length} of {initialSubmissions.length} submissions
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Filter Row */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dfe3e6",
            borderRadius: "0.25rem",
            padding: "1rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <label style={{ flex: "1 1 260px" }}>
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                marginBottom: "0.35rem",
              }}
            >
              Quick Search
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Masukkan judul atau assignment"
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.25rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
              }}
            />
          </label>

          <label style={{ flex: "0 0 180px" }}>
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                marginBottom: "0.35rem",
              }}
            >
              Stage
            </span>
            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value)}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.25rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
              }}
            >
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ flex: "0 0 180px" }}>
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                marginBottom: "0.35rem",
              }}
            >
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.25rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
              }}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Table */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dfe3e6",
            borderRadius: "0.25rem",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "860px" }}>
            <thead>
              <tr
                style={{
                  backgroundColor: "#f9fafb",
                  textAlign: "left",
                  color: "#4b5563",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ padding: "0.75rem 1rem", width: "22%" }}>Title & Journal</th>
                <th style={{ padding: "0.75rem 1rem", width: "12%" }}>Stage</th>
                <th style={{ padding: "0.75rem 1rem", width: "12%" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", width: "18%" }}>Assigned</th>
                <th style={{ padding: "0.75rem 1rem", width: "14%" }}>Submitted</th>
                <th style={{ padding: "0.75rem 1rem", width: "14%" }}>Last Updated</th>
                <th style={{ padding: "0.75rem 1rem", width: "8%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "#6b7280",
                      fontSize: "0.875rem",
                    }}
                  >
                    Tidak ada submission yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission, index) => (
                  <tr
                    key={submission.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem" }}>
                        {submission.title || "Untitled Submission"}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        {submission.journalTitle || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "0.75rem",
                          backgroundColor: "#e0f2fe",
                          color: "#0369a1",
                          fontSize: "0.75rem",
                        }}
                      >
                        {submission.stage ? submission.stage.charAt(0).toUpperCase() + submission.stage.slice(1) : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "0.75rem",
                          backgroundColor: submission.status === "declined" ? "#fee2e2" : "#e4e4e7",
                          color: submission.status === "declined" ? "#b91c1c" : "#1f2937",
                          fontSize: "0.75rem",
                        }}
                      >
                        {submission.status ? submission.status.replace("_", " ") : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top", color: "#374151", fontSize: "0.8125rem" }}>
                      {submission.assignees.length > 0 ? submission.assignees.join(", ") : "Unassigned"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top", color: "#374151", fontSize: "0.8125rem" }}>
                      {formatDate(submission.submittedAt)}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top", color: "#374151", fontSize: "0.8125rem" }}>
                      {formatDate(submission.updatedAt)}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                      <Link
                        href={`/editor/submissions/${submission.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "0.25rem",
                          border: "1px solid #d1d5db",
                          fontSize: "0.75rem",
                          color: "#006798",
                          textDecoration: "none",
                        }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
