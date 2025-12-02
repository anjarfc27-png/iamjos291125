"use client";

import { useAssistantTasks } from "@/features/assistant/hooks/useAssistantTasks";
import Link from "next/link";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";

export default function AssistantTasksPage() {
  const { tasks, loading, error } = useAssistantTasks();

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
            Tasks
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            View and manage tasks assigned to you as an editorial assistant.
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
            <p style={{ fontSize: '0.9375rem', margin: 0 }}>Loading tasks...</p>
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
        ) : tasks.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '2rem',
            textAlign: 'center',
            color: '#666666',
          }}>
            <p style={{ fontSize: '0.9375rem', margin: 0 }}>
              No tasks assigned to you yet.
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
                  <PkpTableHead>Submission</PkpTableHead>
                  <PkpTableHead>Stage</PkpTableHead>
                  <PkpTableHead>Status</PkpTableHead>
                  <PkpTableHead>Updated</PkpTableHead>
                  <PkpTableHead>Actions</PkpTableHead>
                </PkpTableRow>
              </PkpTableHeader>
              <tbody>
                {tasks.map((task) => (
                  <PkpTableRow key={task.id}>
                    <PkpTableCell>
                      <Link
                        href={`/editor/submissions/${task.submissionId}`}
                        style={{ color: '#006798', textDecoration: 'none' }}
                      >
                        {task.submissionTitle}
                      </Link>
                    </PkpTableCell>
                    <PkpTableCell>Stage {task.stage}</PkpTableCell>
                    <PkpTableCell>{task.status}</PkpTableCell>
                    <PkpTableCell>
                      {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : '-'}
                    </PkpTableCell>
                    <PkpTableCell>
                      <Link
                        href={`/editor/submissions/${task.submissionId}`}
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

