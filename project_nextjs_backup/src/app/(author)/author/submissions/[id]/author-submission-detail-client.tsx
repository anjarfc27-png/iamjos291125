'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthorWorkflowHeader } from './author-workflow-header';
import { WorkflowProgressBar } from '@/features/editor/components/workflow-progress-bar';
import type { SubmissionDetail, SubmissionSummary, SubmissionStage } from '@/features/editor/types';
import { AuthorMainTabs } from './author-main-tabs';

type Props = {
  submissionId: string;
  submission: SubmissionSummary;
  detail: SubmissionDetail;
  authorName: string;
  initialTab?: string;
  initialStage?: string;
};

export function AuthorSubmissionDetailClient({
  submissionId,
  submission,
  detail,
  authorName,
  initialTab,
  initialStage
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Determine current stage from submission
  const currentStage: SubmissionStage = (initialStage as SubmissionStage) || 
    (submission.stage as SubmissionStage) || 'submission';

  // Main tabs: 'workflow' or 'publication'
  const defaultMainTab = initialTab === 'publication' ? 'publication' : 'workflow';
  const [activeMainTab, setActiveMainTab] = useState<'workflow' | 'publication'>(defaultMainTab);

  // Workflow stage tab (only relevant when main tab is 'workflow')
  const defaultStageTab: SubmissionStage = currentStage === 'submission' ? 'submission' : currentStage;
  const [activeStageTab, setActiveStageTab] = useState<SubmissionStage>(defaultStageTab);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    const stage = searchParams?.get('stage');
    
    if (tab === 'publication') {
      setActiveMainTab('publication');
    } else {
      setActiveMainTab('workflow');
      if (stage) {
        setActiveStageTab(stage as SubmissionStage);
      }
    }
  }, [searchParams]);

  function handleMainTabChange(tab: 'workflow' | 'publication') {
    setActiveMainTab(tab);
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (tab === 'publication') {
      params.set('tab', 'publication');
      if (!params.get('stage')) params.set('stage', currentStage);
    } else {
      params.delete('tab');
      params.set('stage', activeStageTab);
    }
    
    router.push(`?${params.toString()}`);
  }

  function handleStageTabChange(stage: SubmissionStage) {
    setActiveStageTab(stage);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('tab');
    params.set('stage', stage);
    router.push(`?${params.toString()}`);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#eaedee',
      }}
    >
      <AuthorWorkflowHeader 
        submission={submission} 
        authorName={authorName}
        submissionId={submissionId}
        currentStage={currentStage}
      />
      <WorkflowProgressBar submissionId={submissionId} currentStage={currentStage} />
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.5rem',
          backgroundColor: '#eaedee',
          width: '100%',
          maxWidth: '100%',
          minHeight: 0,
        }}
      >
        <AuthorMainTabs
          submissionId={submissionId}
          detail={detail}
          currentStage={currentStage}
          activeMainTab={activeMainTab}
          activeStageTab={activeStageTab}
          onMainTabChange={handleMainTabChange}
          onStageTabChange={handleStageTabChange}
        />
      </div>
    </div>
  );
}
