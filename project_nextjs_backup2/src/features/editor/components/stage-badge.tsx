"use client";

import type { SubmissionStage } from "../types";

const STAGE_LABELS: Record<SubmissionStage, string> = {
  submission: "Submission",
  review: "Review",
  copyediting: "Copyediting",
  production: "Production",
};

const STAGE_COLORS: Record<SubmissionStage, string> = {
  submission: "bg-red-100 text-red-800 border-red-200",
  review: "bg-orange-100 text-orange-800 border-orange-200",
  copyediting: "bg-blue-100 text-blue-800 border-blue-200",
  production: "bg-green-100 text-green-800 border-green-200",
};

type Props = {
  stage: SubmissionStage;
};

export function StageBadge({ stage }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase ${STAGE_COLORS[stage]}`}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

