"use client";

import type { SubmissionDetail, SubmissionVersion } from "../../types";
import { TitleAbstractTab } from "./tabs/title-abstract-tab";
import { ContributorsTab } from "./tabs/contributors-tab";
import { MetadataTab } from "./tabs/metadata-tab";
import { CitationsTab } from "./tabs/citations-tab";
import { IdentifiersTab } from "./tabs/identifiers-tab";
import { GalleysTab } from "./tabs/galleys-tab";
import { LicenseTab } from "./tabs/license-tab";
import { IssueTab } from "./tabs/issue-tab";

type SubTabKey = "titleAbstract" | "contributors" | "metadata" | "citations" | "identifiers" | "galleys" | "license" | "issue";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  currentVersion?: SubmissionVersion;
  activeSubTab: SubTabKey;
  setActiveSubTab: (tab: SubTabKey) => void;
  subTabs: { key: SubTabKey; label: string }[];
  publicationStatus: "queued" | "scheduled" | "published";
};

export function PublicationContent({
  submissionId,
  detail,
  currentVersion,
  activeSubTab,
  setActiveSubTab,
  subTabs,
  publicationStatus,
}: Props) {
  const isPublished = publicationStatus === "published";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 0,
        backgroundColor: "#f8f9fa",
        minHeight: "600px",
        position: "relative",
      }}
    >
      {/* Side Tabs Navigation - OJS 3.3 Style */}
      <div
        style={{
          width: "200px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e5e5",
          padding: "1rem 0",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                textAlign: "left",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#006798" : "rgba(0, 0, 0, 0.84)",
                backgroundColor: isActive ? "#f0f7fa" : "transparent",
                border: "none",
                borderLeft: isActive ? "3px solid #006798" : "3px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Published Version Warning */}
        {isPublished && (
          <div
            className="pkpPublication__versionPublished"
            style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
              color: "#856404",
            }}
          >
            This version has been published and can no longer be edited. Create a new version to make changes.
          </div>
        )}

        {/* Render Active Tab Content */}
        {activeSubTab === "titleAbstract" && (
          <TitleAbstractTab
            submissionId={submissionId}
            detail={detail}
            version={currentVersion}
            isPublished={isPublished}
          />
        )}
        {activeSubTab === "contributors" && (
          <ContributorsTab
            submissionId={submissionId}
            detail={detail}
            version={currentVersion}
            isPublished={isPublished}
          />
        )}
        {activeSubTab === "metadata" && (
          <MetadataTab
            submissionId={submissionId}
            detail={detail}
            version={currentVersion}
            isPublished={isPublished}
          />
        )}
        {activeSubTab === "citations" && (
          <CitationsTab
            submissionId={submissionId}
            detail={detail}
            version={currentVersion}
            isPublished={isPublished}
          />
        )}
        {activeSubTab === "identifiers" && (
          <IdentifiersTab
            submissionId={submissionId}
            detail={detail}
            version={currentVersion}
            isPublished={isPublished}
          />
        )}
        {activeSubTab === "galleys" && (
          <GalleysTab submissionId={submissionId} detail={detail} isPublished={isPublished} />
        )}
        {activeSubTab === "license" && (
          <LicenseTab submissionId={submissionId} detail={detail} isPublished={isPublished} />
        )}
        {activeSubTab === "issue" && (
          <IssueTab submissionId={submissionId} detail={detail} isPublished={isPublished} />
        )}
      </div>
    </div>
  );
}



