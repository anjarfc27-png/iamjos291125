"use client";

import Link from "next/link";
import { FileText, Users } from "lucide-react";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableBody, PkpTableCell } from "@/components/ui/pkp-table";

type ManagerStats = {
  totalSubmissions: number;
  inReview: number;
  inCopyediting: number;
  inProduction: number;
  published: number;
  declined: number;
  totalUsers: number;
  recentSubmissions: Array<{
    id: string;
    title: string | null;
    status: string;
    current_stage: string;
    submitted_at: string | null;
    updated_at: string | null;
  }>;
};

type Props = {
  stats: ManagerStats;
};

export function ManagerDashboardClient({ stats }: Props) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0.5rem 0.25rem 0.75rem 0.25rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#002C40",
            margin: 0,
            marginBottom: "0.25rem",
          }}
        >
          Journal Manager
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#666666",
            margin: 0,
          }}
        >
          Ringkasan singkat workflow dan pengguna jurnal Anda.
        </p>
      </div>

      {/* Top grid: Submission overview (left) + Users overview (right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.3fr)",
          gap: "1.25rem",
          alignItems: "flex-start",
        }}
      >
        {/* Submission Overview */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "3px",
            padding: "1.25rem 1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#002C40",
                }}
              >
                Submission Overview
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  marginTop: "0.15rem",
                }}
              >
                Ringkasan status naskah di semua stage.
              </div>
            </div>
            <Link
              href="/manager/submissions"
              style={{
                fontSize: "0.8rem",
                color: "#006798",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Lihat semua
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  borderRadius: "999px",
                  backgroundColor: "rgba(0,103,152,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText style={{ width: "1.1rem", height: "1.1rem", color: "#006798" }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  {stats.totalSubmissions}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  Total submissions
                </div>
              </div>
            </div>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "0.5rem",
              fontSize: "0.8rem",
            }}
          >
            <thead>
              <tr
                style={{
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.5rem 0.25rem",
                    fontWeight: 500,
                  }}
                >
                  Stage / Status
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "0.5rem 0.25rem",
                    fontWeight: 500,
                    width: "90px",
                  }}
                >
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    color: "#374151",
                  }}
                >
                  In review
                </td>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#ea580c",
                  }}
                >
                  {stats.inReview}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    color: "#374151",
                  }}
                >
                  In copyediting
                </td>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#7e22ce",
                  }}
                >
                  {stats.inCopyediting}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    color: "#374151",
                  }}
                >
                  In production
                </td>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#4f46e5",
                  }}
                >
                  {stats.inProduction}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    color: "#374151",
                  }}
                >
                  Published
                </td>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#16a34a",
                  }}
                >
                  {stats.published}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    color: "#374151",
                  }}
                >
                  Declined
                </td>
                <td
                  style={{
                    padding: "0.4rem 0.25rem",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#dc2626",
                  }}
                >
                  {stats.declined}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Users Overview */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "3px",
            padding: "1.25rem 1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#002C40",
                }}
              >
                Users Overview
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  marginTop: "0.15rem",
                }}
              >
                Total akun yang terdaftar di jurnal ini.
              </div>
            </div>
            <Link
              href="/manager/users"
              style={{
                fontSize: "0.8rem",
                color: "#006798",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Kelola pengguna
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginTop: "0.5rem",
            }}
          >
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "999px",
                backgroundColor: "rgba(37,99,235,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users style={{ width: "1.1rem", height: "1.1rem", color: "#2563eb" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                {stats.totalUsers}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                }}
              >
                Registered users
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions as flat PKP table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "3px",
        }}
      >
        <div
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#002C40",
              }}
            >
              Recent Submissions
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                marginTop: "0.15rem",
              }}
            >
              Daftar datar naskah terbaru (tidak ada hover-card atau ikon).
            </div>
          </div>
          <Link
            href="/manager/submissions"
            style={{
              fontSize: "0.8rem",
              color: "#006798",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            View all
          </Link>
        </div>

        {stats.recentSubmissions.length === 0 ? (
          <div
            style={{
              padding: "1.75rem 1.5rem",
              textAlign: "center",
              fontSize: "0.85rem",
              color: "#6b7280",
              fontStyle: "italic",
            }}
          >
            No recent submissions.
          </div>
        ) : (
          <div
            style={{
              padding: "0.25rem 0 0.75rem 0",
              overflowX: "auto",
            }}
          >
            <PkpTable>
              <PkpTableHeader>
                <PkpTableRow isHeader>
                  <PkpTableHead
                    style={{
                      width: "45%",
                    }}
                  >
                    Title
                  </PkpTableHead>
                  <PkpTableHead
                    style={{
                      width: "15%",
                    }}
                  >
                    Status
                  </PkpTableHead>
                  <PkpTableHead
                    style={{
                      width: "15%",
                    }}
                  >
                    Stage
                  </PkpTableHead>
                  <PkpTableHead
                    style={{
                      width: "25%",
                    }}
                  >
                    Updated
                  </PkpTableHead>
                </PkpTableRow>
              </PkpTableHeader>
              <PkpTableBody>
                {stats.recentSubmissions.map((submission) => (
                  <PkpTableRow key={submission.id}>
                    <PkpTableCell>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: "#111827",
                          marginBottom: "0.1rem",
                        }}
                      >
                        {submission.title || "Untitled submission"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                        }}
                      >
                        ID: {submission.id}
                      </div>
                    </PkpTableCell>
                    <PkpTableCell>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          textTransform: "capitalize",
                          color: "#374151",
                        }}
                      >
                        {submission.status.replace("_", " ")}
                      </span>
                    </PkpTableCell>
                    <PkpTableCell>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          textTransform: "capitalize",
                          color: "#374151",
                        }}
                      >
                        {submission.current_stage}
                      </span>
                    </PkpTableCell>
                    <PkpTableCell>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#374151",
                        }}
                      >
                        {formatDate(submission.updated_at)}
                      </span>
                    </PkpTableCell>
                  </PkpTableRow>
                ))}
              </PkpTableBody>
            </PkpTable>
          </div>
        )}
      </div>
    </div>
  );
}

