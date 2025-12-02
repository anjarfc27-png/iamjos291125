"use client";

import { PkpModal } from "@/components/ui/pkp-modal";
import { PkpButton } from "@/components/ui/pkp-button";
import type { EditorDecisionType, EditorRecommendationType } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  stage: "submission" | "review" | "copyediting" | "production";
  decision: EditorDecisionType | EditorRecommendationType;
  reviewRoundId?: string;
  title?: string;
  children: React.ReactNode;
};

/**
 * Editor Decision Modal Wrapper
 * Based on OJS PKP 3.3 editor decision modals
 */
export function EditorDecisionModal({
  open,
  onClose,
  submissionId,
  stage,
  decision,
  reviewRoundId,
  title,
  children,
}: Props) {
  return (
    <PkpModal
      isOpen={open}
      onClose={onClose}
      title={title || "Editor Decision"}
      size="large"
    >
      <form
        id={`editor-decision-form-${decision}`}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="stage" value={stage} />
        <input type="hidden" name="decision" value={decision} />
        {reviewRoundId && (
          <input type="hidden" name="reviewRoundId" value={reviewRoundId} />
        )}
        {children}
      </form>
    </PkpModal>
  );
}
