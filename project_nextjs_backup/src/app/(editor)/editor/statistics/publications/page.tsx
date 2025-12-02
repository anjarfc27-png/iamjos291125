import { PageHeader } from "@/components/admin/page-header";

export default function PublicationsStatisticsPage() {
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
            Publications Statistics
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Statistik publikasi untuk jurnal.
          </p>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "0 1.5rem", // Safe padding horizontal
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e5e5",
          padding: "1.5rem",
          boxShadow: "none",
          borderRadius: 0,
        }}>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            margin: 0,
          }}>
            Fitur statistik publikasi akan diimplementasikan kemudian.
          </p>
        </div>
      </div>
    </section>
  );
}