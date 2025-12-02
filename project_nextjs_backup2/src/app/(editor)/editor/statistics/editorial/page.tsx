import { PageHeader } from "@/components/admin/page-header";

const dummyStats = {
  totalSubmissions: 156,
  accepted: 45,
  rejected: 78,
  published: 42,
  acceptanceRate: "28.8%",
  averageDaysToDecision: 45,
  averageDaysToPublication: 120
};

export default function EditorialStatisticsPage() {
  return (
    <section style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}>
      {/* Page Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0", // Safe padding
      }}>
        <div style={{
          padding: "0 1.5rem", // Safe padding horizontal
        }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}>
            Editorial Statistics
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Statistik editorial untuk jurnal.
          </p>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "0 1.5rem", // Safe padding horizontal
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{
          width: "100%",
          maxWidth: "100%",
        }}>
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="text-2xl font-bold text-[var(--foreground)]">{dummyStats.totalSubmissions}</div>
          <div className="text-sm text-[var(--muted)]">Total Submissions</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{dummyStats.accepted}</div>
          <div className="text-sm text-[var(--muted)]">Accepted</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="text-2xl font-bold text-red-600">{dummyStats.rejected}</div>
          <div className="text-sm text-[var(--muted)]">Rejected</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="text-2xl font-bold text-[var(--primary)]">{dummyStats.published}</div>
          <div className="text-sm text-[var(--muted)]">Published</div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--primary)]">{dummyStats.acceptanceRate}</div>
            <div className="text-sm text-[var(--muted)]">Acceptance Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--primary)]">{dummyStats.averageDaysToDecision}</div>
            <div className="text-sm text-[var(--muted)]">Avg Days to Decision</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--primary)]">{dummyStats.averageDaysToPublication}</div>
            <div className="text-sm text-[var(--muted)]">Avg Days to Publication</div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}