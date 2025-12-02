'use client';

import { useMemo } from 'react';
import { AuthorWorkflowStageTabs } from './author-workflow-stage-tabs';
import { PublicationTab } from '@/features/editor/components/publication/publication-tab';
import type { SubmissionDetail, SubmissionStage } from '@/features/editor/types';

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  currentStage: SubmissionStage;
  activeMainTab: 'workflow' | 'publication';
  activeStageTab: SubmissionStage;
  onMainTabChange: (tab: 'workflow' | 'publication') => void;
  onStageTabChange: (stage: SubmissionStage) => void;
};

/**
 * Main Tabs Component - OJS PKP 3.3 Structure
 * Main tabs: Workflow and Publication
 */
export function AuthorMainTabs({
  submissionId,
  detail,
  currentStage,
  activeMainTab,
  activeStageTab,
  onMainTabChange,
  onStageTabChange
}: Props) {
  return (
    <div style={{ 
      padding: 0,
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    }}>
      {/* Main Tabs - OJS PKP 3.3 Style */}
      <div
        style={{
          borderBottom: '2px solid #e5e5e5',
          backgroundColor: '#ffffff',
          padding: '0 1.5rem',
          marginBottom: '1.5rem',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            background: 'transparent',
            alignItems: 'flex-end',
            gap: '0.25rem',
          }}
        >
          <button
            onClick={() => onMainTabChange('workflow')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 1rem',
              lineHeight: '3rem',
              height: '3rem',
              fontSize: '0.875rem',
              fontWeight: activeMainTab === 'workflow' ? 700 : 400,
              textDecoration: 'none',
              color: activeMainTab === 'workflow' ? 'rgba(0, 0, 0, 0.84)' : '#006798',
              backgroundColor: activeMainTab === 'workflow' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeMainTab === 'workflow' ? '2px solid #006798' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: activeMainTab === 'workflow' ? '-2px' : '0',
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeMainTab !== 'workflow') {
                e.currentTarget.style.color = '#002C40';
              }
            }}
            onMouseLeave={(e) => {
              if (activeMainTab !== 'workflow') {
                e.currentTarget.style.color = '#006798';
              }
            }}
          >
            Workflow
          </button>
          <button
            onClick={() => onMainTabChange('publication')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 1rem',
              lineHeight: '3rem',
              height: '3rem',
              fontSize: '0.875rem',
              fontWeight: activeMainTab === 'publication' ? 700 : 400,
              textDecoration: 'none',
              color: activeMainTab === 'publication' ? 'rgba(0, 0, 0, 0.84)' : '#006798',
              backgroundColor: activeMainTab === 'publication' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeMainTab === 'publication' ? '2px solid #006798' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: activeMainTab === 'publication' ? '-2px' : '0',
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeMainTab !== 'publication') {
                e.currentTarget.style.color = '#002C40';
              }
            }}
            onMouseLeave={(e) => {
              if (activeMainTab !== 'publication') {
                e.currentTarget.style.color = '#006798';
              }
            }}
          >
            Publication
          </button>
        </div>
      </div>

      {/* Tab Content - OJS PKP 3.3 Style */}
      {activeMainTab === 'workflow' ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem',
          minHeight: '400px',
        }}>
          <AuthorWorkflowStageTabs
            submissionId={submissionId}
            detail={detail}
            currentStage={currentStage}
            activeStageTab={activeStageTab}
            onStageTabChange={onStageTabChange}
          />
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem',
          minHeight: '400px',
        }}>
          <PublicationTab submissionId={submissionId} detail={detail} />
        </div>
      )}
    </div>
  );
}

