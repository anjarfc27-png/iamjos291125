"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Download } from "lucide-react";
import { PkpTable, PkpTableHead, PkpTableRow, PkpTableHeader, PkpTableBody, PkpTableCell } from "@/components/ui/pkp-table";

type Attachment = {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  downloadUrl?: string;
};

type Props = {
  assignmentId: string;
  disabled?: boolean;
};

export function ReviewAttachmentsGrid({ assignmentId, disabled = false }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, [assignmentId]);

  async function loadAttachments() {
    try {
      const response = await fetch(`/api/reviewer/assignments/${assignmentId}/attachments`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.ok) {
        setAttachments(data.attachments || []);
      }
    } catch (err) {
      console.error("Error loading attachments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/reviewer/assignments/${assignmentId}/attachments`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (data.ok) {
        await loadAttachments();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert(data.error || "Failed to upload attachment");
      }
    } catch (err) {
      console.error("Error uploading attachment:", err);
      alert("Failed to upload attachment");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(attachmentId: string) {
    if (!confirm("Are you sure you want to delete this attachment?")) return;

    try {
      const response = await fetch(`/api/reviewer/assignments/${assignmentId}/attachments/${attachmentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (data.ok) {
        await loadAttachments();
      } else {
        alert(data.error || "Failed to delete attachment");
      }
    } catch (err) {
      console.error("Error deleting attachment:", err);
      alert("Failed to delete attachment");
    }
  }

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

  return (
    <div>
      {!disabled && (
        <div style={{ marginBottom: "1rem" }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            style={{ display: "none" }}
            disabled={uploading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || disabled}
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            <Upload style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
            {uploading ? "Uploading..." : "Upload Attachment"}
          </Button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          Loading attachments...
        </div>
      ) : attachments.length === 0 ? (
        <div style={{
          padding: "2rem",
          textAlign: "center",
          color: "#666",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px"
        }}>
          <FileText style={{ width: "3rem", height: "3rem", margin: "0 auto 1rem", opacity: 0.5 }} />
          <p>No attachments uploaded.</p>
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
                <PkpTableHeader style={{ width: "40%" }}>File Name</PkpTableHeader>
                <PkpTableHeader style={{ width: "20%" }}>Size</PkpTableHeader>
                <PkpTableHeader style={{ width: "20%" }}>Uploaded</PkpTableHeader>
                <PkpTableHeader style={{ width: "20%", textAlign: "center" }}>Actions</PkpTableHeader>
              </PkpTableRow>
            </PkpTableHead>
            <PkpTableBody>
              {attachments.map((attachment) => (
                <PkpTableRow key={attachment.id}>
                  <PkpTableCell>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <FileText style={{ width: "1rem", height: "1rem", color: "#666" }} />
                      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{attachment.fileName}</span>
                    </div>
                  </PkpTableCell>
                  <PkpTableCell style={{ fontSize: "0.875rem", color: "#666" }}>
                    {formatFileSize(attachment.fileSize)}
                  </PkpTableCell>
                  <PkpTableCell style={{ fontSize: "0.875rem", color: "#666" }}>
                    {formatDate(attachment.uploadedAt)}
                  </PkpTableCell>
                  <PkpTableCell style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      {attachment.downloadUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.downloadUrl, "_blank")}
                          style={{ padding: "0.25rem 0.5rem" }}
                        >
                          <Download style={{ width: "1rem", height: "1rem" }} />
                        </Button>
                      )}
                      {!disabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attachment.id)}
                          style={{ padding: "0.25rem 0.5rem", color: "#d32f2f" }}
                        >
                          <X style={{ width: "1rem", height: "1rem" }} />
                        </Button>
                      )}
                    </div>
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


