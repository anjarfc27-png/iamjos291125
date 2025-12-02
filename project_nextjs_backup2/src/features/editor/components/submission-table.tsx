"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MessageSquare, UserPlus, FileText, Calendar, User, Search, Filter, X, ChevronDown, MoreVertical } from "lucide-react";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import { PkpSelect } from "@/components/ui/pkp-select";
import { Dropdown, DropdownItem, DropdownSection } from "@/components/ui/dropdown";

import { StageBadge } from "./stage-badge";
import { StatusBadge } from "./status-badge";
import type { SubmissionSummary, SubmissionStage, SubmissionStatus } from "../types";

type Props = {
  submissions: SubmissionSummary[];
  emptyMessage?: string;
  bare?: boolean;
  tabLabel?: string;
  isLoading?: boolean;
  error?: string | null;
};

export function SubmissionTable({
  submissions,
  emptyMessage = "No submissions found.",
  bare = false,
  tabLabel = "Submissions",
  isLoading = false,
  error = null
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStage, setSelectedStage] = useState<SubmissionStage | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus | "all">("all");

  // Filter submissions based on search and filters
  const filteredSubmissions = submissions.filter((submission) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        submission.title.toLowerCase().includes(searchLower) ||
        submission.author_name?.toLowerCase().includes(searchLower) ||
        submission.id.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Stage filter
    if (selectedStage !== "all" && submission.stage !== selectedStage) {
      return false;
    }

    // Status filter
    if (selectedStatus !== "all" && submission.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  // Get unique stages and statuses for filter options
  const availableStages: SubmissionStage[] = ["submission", "review", "copyediting", "production"];
  const availableStatuses: SubmissionStatus[] = ["queued", "in_review", "accepted", "declined", "scheduled", "published"];

  // Render table component - Simplified format: Number, Author(s), Title, Status, Dropdown
  // Header row removed - no labels needed, just data rows
  const table = (
    <PkpTable>
      <tbody>
        {filteredSubmissions.map((submission, index) => (
          <PkpTableRow key={submission.id}>
            <PkpTableCell style={{ width: '100px', paddingLeft: '2rem' }}>
              <span className="label" style={{ fontSize: '0.875rem' }}>{submission.id}</span>
            </PkpTableCell>
            <PkpTableCell style={{ paddingLeft: '2rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.54)', marginBottom: '0.125rem' }}>
                {submission.author_name || "Author not specified"}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.4' }}>
                <Link href={`/editor/submissions/${submission.id}`} className="pkp_linkaction" style={{
                  fontWeight: 600,
                  color: '#006798',
                  textDecoration: 'none'
                }}>
                  {submission.title}
                </Link>
              </div>
            </PkpTableCell>
            <PkpTableCell style={{ width: '140px', paddingLeft: '2rem' }}>
              <StageBadge stage={submission.stage} />
            </PkpTableCell>
            <PkpTableCell style={{ textAlign: 'right', width: '80px', paddingLeft: '2rem', paddingRight: '2rem', position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  display: 'inline-flex',
                  justifyContent: 'flex-end',
                  position: 'relative',
                  zIndex: 10
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click
                }}
              >
                <Dropdown
                  align="right"
                  button={
                    <div
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(0, 0, 0, 0.54)',
                        position: 'relative',
                        zIndex: 10
                      }}
                      className="hover:opacity-70"
                    >
                      <ChevronDown className="h-4 w-4" style={{ width: '16px', height: '16px' }} />
                    </div>
                  }
                >
                  <DropdownSection>
                    <DropdownItem
                      href={`/editor/submissions/${submission.id}`}
                      icon={<Eye className="h-4 w-4" />}
                    >
                      View Submission
                    </DropdownItem>
                  </DropdownSection>
                </Dropdown>
              </div>
            </PkpTableCell>
          </PkpTableRow>
        ))}
      </tbody>
    </PkpTable>
  );

  if (bare) {
    // If bare mode, just render filtered table without header
    if (isLoading) {
      return (
        <div className="empty px-6 py-10 text-center text-sm text-[var(--muted)] italic">
          Loading...
        </div>
      );
    }
    if (error) {
      return (
        <div className="empty px-6 py-10 text-center text-sm text-red-500 italic">
          {error}
        </div>
      );
    }
    if (filteredSubmissions.length === 0) {
      return (
        <div className="empty px-6 py-10 text-center text-sm text-[var(--muted)] italic">
          {emptyMessage}
        </div>
      );
    }
    return table;
  }

  return (
    <div
      className="pkp_controllers_grid"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #ddd', // Simple border as per image
        borderRadius: '2px',
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        margin: '0',
      }}
    >
      {/* Header with Search and Filter - OJS 3.3 Exact Layout */}
      <div className="header" style={{
        position: 'relative',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '3rem',
      }}>
        <h4 style={{
          display: 'inline-block',
          fontSize: '1rem',
          margin: 0,
          padding: 0,
          fontWeight: 700,
          color: '#002C40'
        }}>{tabLabel}</h4>

        <div className="actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          margin: 0
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted)] pointer-events-none" style={{
              width: '14px',
              height: '14px',
              left: '8px',
              color: '#006798'
            }} />
            <PkpInput
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: '1.75rem',
                paddingRight: searchTerm ? '1.75rem' : '0.5rem',
                width: '200px',
                height: '30px',
                fontSize: '0.875rem',
                borderRadius: '2px',
                borderColor: '#ddd'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(0, 0, 0, 0.54)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X className="h-3 w-3" style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <PkpButton
            variant="onclick"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            style={{
              fontSize: '0.875rem',
              height: '30px',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
              borderColor: showFilters ? '#006798' : '#ddd',
              backgroundColor: showFilters ? 'rgba(0, 103, 152, 0.1)' : '#ffffff',
              color: '#006798',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              borderRadius: '2px',
              fontWeight: 600
            }}
          >
            <Filter className="h-4 w-4" style={{ width: '14px', height: '14px' }} />
            Filters
          </PkpButton>

          {/* New Submission Button */}
          <Link href="/submission/wizard" style={{ textDecoration: 'none' }}>
            <PkpButton
              variant="onclick"
              size="sm"
              style={{
                fontSize: '0.875rem',
                height: '30px',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                backgroundColor: '#ffffff',
                borderColor: '#ddd',
                color: '#006798',
                fontWeight: 600,
                borderRadius: '2px'
              }}
            >
              New Submission
            </PkpButton>
          </Link>
        </div>
      </div>

      {/* Filter Panel (expandable) */}
      {showFilters && (
        <div style={{
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa',
          padding: '1rem 1.5rem',
          fontSize: '0.875rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            {/* Stage Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'rgba(0, 0, 0, 0.54)',
                marginBottom: '0.375rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Stage
              </label>
              <PkpSelect
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as SubmissionStage | "all")}
              >
                <option value="all">All Stages</option>
                {availableStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </option>
                ))}
              </PkpSelect>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'rgba(0, 0, 0, 0.54)',
                marginBottom: '0.375rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Status
              </label>
              <PkpSelect
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as SubmissionStatus | "all")}
              >
                <option value="all">All Status</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                  </option>
                ))}
              </PkpSelect>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedStage !== "all" || selectedStatus !== "all" || searchTerm) && (
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontSize: '0.75rem',
                color: 'rgba(0, 0, 0, 0.54)'
              }}>Active filters:</span>
              {searchTerm && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(0, 103, 152, 0.1)',
                  color: '#006798',
                  borderRadius: '2px',
                  fontSize: '0.75rem'
                }}>
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: '#006798'
                    }}
                  >
                    <X className="h-3 w-3" style={{ width: '12px', height: '12px' }} />
                  </button>
                </span>
              )}
              {selectedStage !== "all" && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(0, 103, 152, 0.1)',
                  color: '#006798',
                  borderRadius: '2px',
                  fontSize: '0.75rem'
                }}>
                  Stage: {selectedStage}
                  <button
                    onClick={() => setSelectedStage("all")}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: '#006798'
                    }}
                  >
                    <X className="h-3 w-3" style={{ width: '12px', height: '12px' }} />
                  </button>
                </span>
              )}
              {selectedStatus !== "all" && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(0, 103, 152, 0.1)',
                  color: '#006798',
                  borderRadius: '2px',
                  fontSize: '0.75rem'
                }}>
                  Status: {selectedStatus}
                  <button
                    onClick={() => setSelectedStatus("all")}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: '#006798'
                    }}
                  >
                    <X className="h-3 w-3" style={{ width: '12px', height: '12px' }} />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStage("all");
                  setSelectedStatus("all");
                }}
                style={{
                  fontSize: '0.75rem',
                  color: '#006798',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table Content */}
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          overflowY: 'visible',
          padding: filteredSubmissions.length === 0 ? '0' : '0',
          minHeight: filteredSubmissions.length === 0 ? '150px' : 'auto', // Ensure height for empty state
          display: filteredSubmissions.length === 0 ? 'flex' : 'block',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isLoading ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'rgba(0, 0, 0, 0.54)',
              fontStyle: 'italic',
            }}
          >
            Loading...
          </div>
        ) : error ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#dc3545',
            }}
          >
            {error}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#333',
            }}
          >
            {searchTerm || selectedStage !== "all" || selectedStatus !== "all"
              ? "No submissions found matching the filters."
              : emptyMessage}
          </div>
        ) : (
          table
        )}
      </div>
    </div>
  );
}

function formatRelative(value: string) {
  try {
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return value;
  }
}
