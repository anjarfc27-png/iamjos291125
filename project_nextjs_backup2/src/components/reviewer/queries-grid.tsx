"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Eye } from "lucide-react";
import { PkpTable, PkpTableHead, PkpTableRow, PkpTableHeader, PkpTableBody, PkpTableCell } from "@/components/ui/pkp-table";

type Query = {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: string;
  lastMessageDate: string;
  closed: boolean;
};

type Props = {
  submissionId: string;
  disabled?: boolean;
};

export function QueriesGrid({ submissionId, disabled = false }: Props) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueries();
  }, [submissionId]);

  async function loadQueries() {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/queries?stage=review`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.ok) {
        setQueries(data.queries || []);
      }
    } catch (err) {
      console.error("Error loading queries:", err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        Loading queries...
      </div>
    );
  }

  return (
    <div>
      {!disabled && queries.length > 0 && (
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outline"
            size="sm"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            <Plus style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
            New Query
          </Button>
        </div>
      )}

      {queries.length === 0 ? (
        <div style={{
          padding: "2rem",
          textAlign: "center",
          color: "#666",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px"
        }}>
          <MessageSquare style={{ width: "3rem", height: "3rem", margin: "0 auto 1rem", opacity: 0.5 }} />
          <p>No discussion threads available.</p>
          {!disabled && (
            <Button
              variant="outline"
              size="sm"
              style={{ marginTop: "1rem" }}
            >
              <Plus style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
              Start Discussion
            </Button>
          )}
        </div>
      ) : (
        <div style={{
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          overflow: "hidden"
        }}>
          <PkpTable>
            <PkpTableHead>
              <PkpTableRow>
                <PkpTableHeader style={{ width: "30%" }}>Subject</PkpTableHeader>
                <PkpTableHeader style={{ width: "25%" }}>Participants</PkpTableHeader>
                <PkpTableHeader style={{ width: "30%" }}>Last Message</PkpTableHeader>
                <PkpTableHeader style={{ width: "15%", textAlign: "center" }}>Actions</PkpTableHeader>
              </PkpTableRow>
            </PkpTableHead>
            <PkpTableBody>
              {queries.map((query) => (
                <PkpTableRow key={query.id}>
                  <PkpTableCell>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <MessageSquare style={{ width: "1rem", height: "1rem", color: "#666" }} />
                      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{query.subject}</span>
                      {query.closed && (
                        <span style={{
                          fontSize: "0.75rem",
                          padding: "0.125rem 0.5rem",
                          backgroundColor: "#e5e5e5",
                          borderRadius: "4px",
                          color: "#666"
                        }}>
                          Closed
                        </span>
                      )}
                    </div>
                  </PkpTableCell>
                  <PkpTableCell style={{ fontSize: "0.875rem", color: "#666" }}>
                    {query.participants.join(", ")}
                  </PkpTableCell>
                  <PkpTableCell>
                    <div style={{ fontSize: "0.875rem" }}>
                      <div style={{ color: "#333", marginBottom: "0.25rem" }}>
                        {query.lastMessage.length > 50
                          ? `${query.lastMessage.substring(0, 50)}...`
                          : query.lastMessage}
                      </div>
                      <div style={{ color: "#666", fontSize: "0.75rem" }}>
                        {formatDate(query.lastMessageDate)}
                      </div>
                    </div>
                  </PkpTableCell>
                  <PkpTableCell style={{ textAlign: "center" }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Open query detail modal
                      }}
                      style={{ padding: "0.25rem 0.5rem" }}
                    >
                      <Eye style={{ width: "1rem", height: "1rem" }} />
                    </Button>
                  </PkpTableCell>
                </PkpTableRow>
              ))}
            </PkpTableBody>
          </PkpTable>
        </div>
      )}
    </div>
  );
}


