import { notFound } from "next/navigation";

import { getSubmissionDetail } from "@/features/editor/data";
import { WorkflowHeader } from "@/features/editor/components/workflow-header";
import { WorkflowProgressBar } from "@/features/editor/components/workflow-progress-bar";
import { WorkflowTabs } from "@/features/editor/components/workflow-tabs";
import type { SubmissionStage } from "@/features/editor/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

const VALID_STAGES: SubmissionStage[] = ["submission", "review", "copyediting", "production"];

export default async function SubmissionDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolved = await searchParams;
  const stageParam = resolved.stage as SubmissionStage | undefined;
  const stage: SubmissionStage =
    stageParam && VALID_STAGES.includes(stageParam) ? stageParam : "submission";

  // Fetch submission detail using getSubmissionDetail function
  const detail = await getSubmissionDetail(id);

  if (!detail) {
    notFound();
  }

  // Extract author name from metadata
  const authorName =
    (detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]
      ? `${(detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]?.givenName ?? ""} ${(detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]?.familyName ?? ""}`.trim() || "—"
      : "—";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#eaedee", // OJS 3.3 exact background color
      }}
    >
      <WorkflowHeader submission={detail.summary} authorName={authorName} />
      <WorkflowProgressBar submissionId={id} currentStage={stage} />
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "1.5rem", // Safe area padding - tidak terlalu mojok
          backgroundColor: "#eaedee",
          width: "100%",
          maxWidth: "100%",
          minHeight: 0, // Prevent flex overflow
        }}
      >
        <WorkflowTabs submissionId={id} detail={detail} currentStage={stage} />
      </div>
    </div>
  );
}

