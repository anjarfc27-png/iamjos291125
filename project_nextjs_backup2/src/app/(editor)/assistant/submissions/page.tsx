"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";

export default function AssistantSubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/editor/assistant/submissions");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Failed to load submissions");
        }

        setSubmissions(data.submissions || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load submissions";
        setError(errorMessage);
        console.error("Error loading submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [user]);

  return (
    <div style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
      padding: 0,
      margin: 0,
    }}>
      {/* Page Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0",
      }}>
        <div style={{
          padding: "0 1.5rem",
        }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}>
            Submissions
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            View submissions assigned to you as an editorial assistant.
          </p>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "1.5rem",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
        {loading ? (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '2rem',
            textAlign: 'center',
            color: '#666666',
          }}>
            <p style={{ fontSize: '0.9375rem', margin: 0 }}>Loading submissions...</p>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            padding: '1.5rem',
            color: '#856404',
          }}>
            <p style={{ fontSize: '0.9375rem', margin: 0 }}>Error: {error}</p>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '2rem',
            textAlign: 'center',
            color: '#666666',
          }}>
            <p style={{ fontSize: '0.9375rem', margin: 0 }}>
              No submissions assigned to you yet.
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <PkpTable>
              <PkpTableHeader>
                <PkpTableRow isHeader>
                  <PkpTableHead>Title</PkpTableHead>
                  <PkpTableHead>Stage</PkpTableHead>
                  <PkpTableHead>Status</PkpTableHead>
                  <PkpTableHead>Updated</PkpTableHead>
                  <PkpTableHead>Actions</PkpTableHead>
                </PkpTableRow>
              </PkpTableHeader>
              <tbody>
                {submissions.map((submission) => (
                  <PkpTableRow key={submission.id}>
                    <PkpTableCell>
                      <Link
                        href={`/editor/submissions/${submission.id}`}
                        style={{ color: '#006798', textDecoration: 'none' }}
                      >
                        {submission.title}
                      </Link>
                    </PkpTableCell>
                    <PkpTableCell>{submission.stage}</PkpTableCell>
                    <PkpTableCell>{submission.status}</PkpTableCell>
                    <PkpTableCell>
                      {submission.updatedAt ? new Date(submission.updatedAt).toLocaleDateString() : '-'}
                    </PkpTableCell>
                    <PkpTableCell>
                      <Link
                        href={`/editor/submissions/${submission.id}`}
                        style={{ color: '#006798', textDecoration: 'none', fontSize: '0.875rem' }}
                      >
                        View
                      </Link>
                    </PkpTableCell>
                  </PkpTableRow>
                ))}
              </tbody>
            </PkpTable>
          </div>
        )}
      </div>
    </div>
  );
}

