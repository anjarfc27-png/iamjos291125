'use client';

import { useMemo } from 'react';
import { AuthorWorkflowStageView } from './author-workflow-stage-view';
import type { SubmissionDetail, SubmissionStage } from '@/features/editor/types';

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  currentStage: SubmissionStage;
  activeStageTab: SubmissionStage;
  onStageTabChange: (stage: SubmissionStage) => void;
};

const WORKFLOW_STAGES: { key: SubmissionStage; label: string }[] = [
  { key: 'submission', label: 'Submission' },
  { key: 'review', label: 'Review' },
  { key: 'copyediting', label: 'Copyediting' },
  { key: 'production', label: 'Production' },
];

/**
 * Workflow Stage Tabs - Nested inside Workflow tab
 * OJS PKP 3.3 Structure
 */
export function AuthorWorkflowStageTabs({
  submissionId,
  detail,
  currentStage,
  activeStageTab,
  onStageTabChange
}: Props) {
  const tabs = useMemo(() => {
    // Filter tabs based on current stage - only show up to current stage
    const currentStageIndex = WORKFLOW_STAGES.findIndex(s => s.key === currentStage);
    return WORKFLOW_STAGES.filter((_, index) => index <= currentStageIndex);
  }, [currentStage]);

  return (
    <div style={{ 
      padding: 0,
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    }}>
      {/* Stage Tabs - Nested inside Workflow tab - OJS PKP 3.3 Style */}
      <div
        className="pkp_controllers_tab"
        style={{
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: '#f8f9fa',
          padding: '0',
          marginBottom: '1.5rem',
          marginTop: '-1.5rem',
          marginLeft: '-1.5rem',
          marginRight: '-1.5rem',
          width: 'calc(100% + 3rem)',
        }}
      >
        <ul
          style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: '0 1.5rem',
            background: 'transparent',
            alignItems: 'flex-end',
            gap: '0.25rem',
            borderBottom: 'none',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeStageTab === tab.key;
            const isPastStage = WORKFLOW_STAGES.findIndex(s => s.key === tab.key) < 
              WORKFLOW_STAGES.findIndex(s => s.key === currentStage);
            
            return (
              <button
                key={tab.key}
                onClick={() => onStageTabChange(tab.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 1rem',
                  lineHeight: '2.5rem',
                  height: '2.5rem',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                  color: isActive ? 'rgba(0, 0, 0, 0.84)' : '#006798',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #006798' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: isActive ? '-2px' : '0',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#002C40';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#006798';
                  }
                }}
              >
                {tab.label}
                {isPastStage && (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '1.25rem',
                      height: '1.25rem',
                      borderRadius: '50%',
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </ul>
      </div>

      {/* Stage Content */}
      <div style={{
        paddingTop: '1.5rem',
      }}>
        <AuthorWorkflowStageView
          detail={detail}
          stage={activeStageTab}
        />
      </div>
    </div>
  );
}

