"use client";

export default function AssistantTasksPage() {
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
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '2rem',
          textAlign: 'center',
          color: '#666666',
        }}>
          <p style={{
            fontSize: '0.9375rem',
            margin: 0,
          }}>
            Tasks list will be displayed here. This page shows tasks assigned to you as an editorial assistant.
          </p>
        </div>
      </div>
    </div>
  );
}

