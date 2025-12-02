"use client";

import { useState } from "react";
import Link from "next/link";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpTable, PkpTableRow, PkpTableCell } from "@/components/ui/pkp-table";
import type { IssueRow } from "@/features/editor/types";

type Props = {
    issues: IssueRow[];
};

export function IssuesClient({ issues }: Props) {
    // Filter issues based on status
    // Future Issues = not published (draft)
    // Back Issues = published
    const futureIssues = issues.filter(i => i.status !== "published");
    const backIssues = issues.filter(i => i.status === "published");

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[#002C40] mb-4">Issues</h1>

            <PkpTabs defaultValue="future" className="w-full">
                <div
                    style={{
                        borderBottom: "1px solid #ddd",
                        background: "transparent",
                        padding: "0 2rem",
                        position: "relative",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        margin: 0,
                    }}
                >
                    <div style={{ display: "flex", flex: 1, alignItems: "flex-end" }}>
                        <PkpTabsList style={{ flex: 1, borderBottom: "none", padding: 0 }}>
                            <PkpTabsTrigger value="future">
                                Future Issues
                            </PkpTabsTrigger>
                            <PkpTabsTrigger value="back">
                                Back Issues
                            </PkpTabsTrigger>
                        </PkpTabsList>
                    </div>

                    {/* Help Button */}
                    <div style={{ marginBottom: "0.5rem" }}>
                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                color: "#006798",
                                backgroundColor: "#ffffff",
                                border: "none",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                padding: "0.25rem 0.5rem",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "50%",
                                    backgroundColor: "#006798",
                                    color: "#ffffff",
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                }}
                            >
                                i
                            </span>
                            Help
                        </button>
                    </div>
                </div>

                {/* Future Issues Content */}
                <PkpTabsContent
                    value="future"
                    style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}
                >
                    <IssueTable
                        issues={futureIssues}
                        title="Future Issues"
                        emptyMessage="No Items"
                        showCreateButton={true}
                        type="future"
                    />
                </PkpTabsContent>

                {/* Back Issues Content */}
                <PkpTabsContent
                    value="back"
                    style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}
                >
                    <IssueTable
                        issues={backIssues}
                        title="Back Issues"
                        emptyMessage="No Items"
                        showCreateButton={false}
                        type="back"
                    />
                </PkpTabsContent>
            </PkpTabs>
        </div>
    );
}

type IssueTableProps = {
    issues: IssueRow[];
    title: string;
    emptyMessage: string;
    showCreateButton: boolean;
    type: "future" | "back";
};

function IssueTable({ issues, title, emptyMessage, showCreateButton, type }: IssueTableProps) {
    return (
        <div
            className="pkp_controllers_grid"
            style={{
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                borderRadius: '2px',
                position: 'relative',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
                margin: '0',
            }}
        >
            {/* Header */}
            <div className="header" style={{
                position: 'relative',
                padding: '0.75rem 1.5rem',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '3.5rem', // Fixed height to prevent layout shift
                boxSizing: 'border-box'
            }}>
                <h4 style={{
                    display: 'inline-block',
                    fontSize: '1rem',
                    margin: 0,
                    padding: 0,
                    fontWeight: 700,
                    color: '#002C40',
                    lineHeight: '1.5'
                }}>{title}</h4>

                <div className="actions" style={{ margin: 0, minWidth: '1px' }}> {/* Ensure div exists even if empty to maintain flex layout if needed, though space-between handles single child fine */}
                    {showCreateButton && (
                        <Link href="/manager/issues/new" style={{ textDecoration: 'none' }}>
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
                                Create Issue
                            </PkpButton>
                        </Link>
                    )}
                </div>
            </div>

            {/* Table Content */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '100%',
                    overflowX: 'auto',
                    overflowY: 'visible',
                }}
            >
                <PkpTable>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                            <th style={{
                                textAlign: 'left',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#002C40',
                                width: type === 'back' ? '50%' : '70%'
                            }}>
                                Issue
                            </th>
                            {type === 'back' && (
                                <th style={{
                                    textAlign: 'left',
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#002C40',
                                    width: '25%'
                                }}>
                                    Published
                                </th>
                            )}
                            <th style={{
                                textAlign: 'right',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#002C40'
                            }}>
                                Items
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.length === 0 ? (
                            <tr>
                                <td colSpan={type === 'back' ? 3 : 2} style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    fontSize: '0.875rem',
                                    color: 'rgba(0, 0, 0, 0.54)',
                                    fontStyle: 'italic',
                                }}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            issues.map((issue) => (
                                <PkpTableRow key={issue.id}>
                                    <PkpTableCell style={{ paddingLeft: '1.5rem' }}>
                                        <div style={{ fontWeight: 600, color: '#006798' }}>
                                            <Link href={`/manager/issues/${issue.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                {issue.title}
                                            </Link>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                            Vol {issue.volume}, No {issue.number} ({issue.year})
                                        </div>
                                    </PkpTableCell>
                                    {type === 'back' && (
                                        <PkpTableCell style={{ paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#333' }}>
                                            {issue.publishedAt ? formatDate(issue.publishedAt) : '—'}
                                        </PkpTableCell>
                                    )}
                                    <PkpTableCell style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                        {issue.itemsCount ?? 0}
                                    </PkpTableCell>
                                </PkpTableRow>
                            ))
                        )}
                    </tbody>
                </PkpTable>
            </div>
        </div>
    );
}

function formatDate(value: string) {
    try {
        return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return value;
    }
}
