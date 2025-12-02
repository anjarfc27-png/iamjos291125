"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Eye } from "lucide-react";
import { PkpTable, PkpTableHead, PkpTableRow, PkpTableHeader, PkpTableBody, PkpTableCell } from "@/components/ui/pkp-table";

type ReviewFile = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy?: string;
  downloadUrl?: string;
  viewUrl?: string;
};

type Props = {
  assignmentId: string;
};

export function ReviewFilesGrid({ assignmentId }: Props) {
  const [files, setFiles] = useState<ReviewFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      try {
        const response = await fetch(`/api/reviewer/assignments/${assignmentId}/files`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.ok) {
          setFiles(data.files || []);
        }
      } catch (err) {
        console.error("Error loading files:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFiles();
  }, [assignmentId]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        Loading files...
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div style={{
        padding: "2rem",
        textAlign: "center",
        color: "#666",
        backgroundColor: "#f8f9fa",
        border: "1px solid #dee2e6",
        borderRadius: "4px"
      }}>
        <FileText style={{ width: "3rem", height: "3rem", margin: "0 auto 1rem", opacity: 0.5 }} />
        <p>No files available for review.</p>
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid #dee2e6",
      borderRadius: "4px",
      overflow: "hidden"
    }}>
      <PkpTable>
        <PkpTableHead>
          <PkpTableRow>
            <PkpTableHeader style={{ width: "40%" }}>File Name</PkpTableHeader>
            <PkpTableHeader style={{ width: "15%" }}>Type</PkpTableHeader>
            <PkpTableHeader style={{ width: "15%" }}>Size</PkpTableHeader>
            <PkpTableHeader style={{ width: "15%" }}>Uploaded</PkpTableHeader>
            <PkpTableHeader style={{ width: "15%", textAlign: "center" }}>Actions</PkpTableHeader>
          </PkpTableRow>
        </PkpTableHead>
        <PkpTableBody>
          {files.map((file) => (
            <PkpTableRow key={file.id}>
              <PkpTableCell>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText style={{ width: "1rem", height: "1rem", color: "#666" }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{file.fileName}</span>
                </div>
              </PkpTableCell>
              <PkpTableCell style={{ fontSize: "0.875rem", color: "#666" }}>
                {file.fileType}
              </PkpTableCell>
              <PkpTableCell style={{ fontSize: "0.875rem", color: "#666" }}>
                {formatFileSize(file.fileSize)}
              </PkpTableCell>
              <PkpTableCell style={{ fontSize: "0.875rem", color: "#666" }}>
                {formatDate(file.uploadedAt)}
              </PkpTableCell>
              <PkpTableCell style={{ textAlign: "center" }}>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                  {file.viewUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.viewUrl, "_blank")}
                      style={{ padding: "0.25rem 0.5rem" }}
                    >
                      <Eye style={{ width: "1rem", height: "1rem" }} />
                    </Button>
                  )}
                  {file.downloadUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.downloadUrl, "_blank")}
                      style={{ padding: "0.25rem 0.5rem" }}
                    >
                      <Download style={{ width: "1rem", height: "1rem" }} />
                    </Button>
                  )}
                </div>
              </PkpTableCell>
            </PkpTableRow>
          ))}
        </PkpTableBody>
      </PkpTable>
    </div>
  );
}


