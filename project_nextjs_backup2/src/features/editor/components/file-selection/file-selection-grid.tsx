"use client";

import { useMemo, useState } from "react";
import type { SubmissionFile } from "../../types";

type Props = {
  files: SubmissionFile[];
  selectedFiles: string[];
  onSelectionChange: (fileIds: string[]) => void;
  stage?: "submission" | "review" | "copyediting" | "production";
  round?: number;
  multiple?: boolean;
  label?: string;
};

/**
 * File Selection Grid
 * Component for selecting files in editor decision forms
 * Based on OJS 3.3 file selection in decision forms
 */
export function FileSelectionGrid({
  files,
  selectedFiles,
  onSelectionChange,
  stage,
  round,
  multiple = true,
  label = "Select Files",
}: Props) {
  const [search, setSearch] = useState("");

  // Filter files by stage and round if provided
  const filteredFiles = useMemo(() => {
    let result = files;

    if (stage) {
      result = result.filter((file) => file.stage === stage);
    }

    if (round !== undefined) {
      result = result.filter((file) => file.round === round);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (file) =>
          file.label.toLowerCase().includes(searchLower) ||
          file.storagePath.toLowerCase().includes(searchLower) ||
          file.kind.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [files, stage, round, search]);

  const handleToggleFile = (fileId: string) => {
    if (multiple) {
      if (selectedFiles.includes(fileId)) {
        onSelectionChange(selectedFiles.filter((id) => id !== fileId));
      } else {
        onSelectionChange([...selectedFiles, fileId]);
      }
    } else {
      onSelectionChange([fileId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredFiles.map((file) => file.id));
    }
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let idx = 0;
    while (size >= 1024 && idx < units.length - 1) {
      size /= 1024;
      idx += 1;
    }
    return `${size.toFixed(1)} ${units[idx]}`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <label
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          {label}
        </label>
        {multiple && filteredFiles.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.25rem",
                border: "1px solid #006798",
                backgroundColor: "transparent",
                color: "#006798",
                height: "1.75rem",
                paddingLeft: "0.5rem",
                paddingRight: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#005a82";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "#006798";
              }}
            >
              Select All
            </button>
            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleDeselectAll}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "transparent",
                  color: "rgba(0, 0, 0, 0.54)",
                  height: "1.75rem",
                  paddingLeft: "0.5rem",
                  paddingRight: "0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.borderColor = "#d0d0d0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "#e5e5e5";
                }}
              >
                Deselect All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      {filteredFiles.length > 3 && (
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            height: "2.25rem",
            borderRadius: "0.25rem",
            border: "1px solid #e5e5e5",
            backgroundColor: "#ffffff",
            padding: "0 0.75rem",
            fontSize: "0.875rem",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#006798";
            e.currentTarget.style.boxShadow = "0 0 0 0.2rem rgba(0,103,152,0.25)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e5e5";
            e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.075)";
          }}
        />
      )}

      {/* Files Grid */}
      <div
        style={{
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {filteredFiles.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            {search.trim() ? "No files match your search." : "No files available."}
          </div>
        ) : (
          <table
            className="pkpTable"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8f9fa",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <th
                  style={{
                    padding: "0.5rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                    width: "40px",
                  }}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                      onChange={handleSelectAll}
                      style={{
                        width: "1rem",
                        height: "1rem",
                        cursor: "pointer",
                        accentColor: "#006798",
                      }}
                    />
                  )}
                </th>
                <th
                  style={{
                    padding: "0.5rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  File
                </th>
                <th
                  style={{
                    padding: "0.5rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Stage
                </th>
                <th
                  style={{
                    padding: "0.5rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Round
                </th>
                <th
                  style={{
                    padding: "0.5rem 1rem",
                    textAlign: "right",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Size
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file, index) => {
                const isSelected = selectedFiles.includes(file.id);
                return (
                  <tr
                    key={file.id}
                    style={{
                      borderTop: index > 0 ? "1px solid #e5e5e5" : "none",
                      backgroundColor: isSelected ? "#f0f7fa" : "transparent",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={() => handleToggleFile(file.id)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <td
                      style={{
                        padding: "0.5rem 1rem",
                        textAlign: "left",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type={multiple ? "checkbox" : "radio"}
                        checked={isSelected}
                        onChange={() => handleToggleFile(file.id)}
                        style={{
                          width: "1rem",
                          height: "1rem",
                          cursor: "pointer",
                          accentColor: "#006798",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        color: "#002C40",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 500,
                          marginBottom: "0.25rem",
                        }}
                      >
                        {file.label}
                      </div>
                      {file.versionLabel && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "rgba(0, 0, 0, 0.54)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Version: {file.versionLabel}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          wordBreak: "break-all",
                        }}
                      >
                        {file.storagePath}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.84)",
                        textTransform: "capitalize",
                      }}
                    >
                      {file.stage}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.84)",
                      }}
                    >
                      {file.round}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        textAlign: "right",
                      }}
                    >
                      {formatSize(file.size)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "-0.5rem",
          }}
        >
          {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}



