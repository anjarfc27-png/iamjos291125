"use client";

import { useState } from "react";
import type { SubmissionDetail } from "../../types";
import { PublicationHeader } from "./publication-header";
import { PublicationContent } from "./publication-content";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
};

export function PublicationTab({ submissionId, detail }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<
    "titleAbstract" | "contributors" | "metadata" | "citations" | "identifiers" | "galleys" | "license" | "issue"
  >("titleAbstract");

  // Get current publication version (using first version for now)
  const currentVersion = detail.versions?.[0];
  const publicationStatus =
    (currentVersion?.status as "queued" | "scheduled" | "published" | undefined) ?? "queued";

  const subTabs = [
    { key: "titleAbstract" as const, label: "Title & Abstract" },
    { key: "contributors" as const, label: "Contributors" },
    { key: "metadata" as const, label: "Metadata" },
    { key: "citations" as const, label: "Citations" },
    { key: "identifiers" as const, label: "Identifiers" },
    { key: "galleys" as const, label: "Galleys" },
    { key: "license" as const, label: "License" },
    { key: "issue" as const, label: "Issue" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        backgroundColor: "#f8f9fa",
        minHeight: "100%",
      }}
    >
      {/* Publication Header */}
      <PublicationHeader
        submissionId={submissionId}
        detail={detail}
        publicationStatus={publicationStatus}
        currentVersion={currentVersion}
      />

      {/* Publication Content with Side Tabs */}
      <PublicationContent
        submissionId={submissionId}
        detail={detail}
        currentVersion={currentVersion}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        subTabs={subTabs}
        publicationStatus={publicationStatus}
      />
    </div>
  );
}



