"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ReviewerAssignment } from "@/features/reviewer/data";
import { ReviewRequestStep } from "./steps/review-request-step";
import { ReviewGuidelinesStep } from "./steps/review-guidelines-step";
import { ReviewDownloadStep } from "./steps/review-download-step";
import { ReviewConfirmationStep } from "./steps/review-confirmation-step";

type Props = {
  assignment: ReviewerAssignment;
  userId: string;
};

// OJS PKP 3.3 uses 4 steps: Request, Guidelines, Download, Completion
type ReviewStep = "request" | "guidelines" | "download" | "completion";

export function ReviewDetailClient({ assignment, userId }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ReviewStep>(() => {
    // Determine current step based on assignment status
    if (assignment.status === "pending") {
      return "request";
    } else if (assignment.status === "declined" || assignment.status === "completed") {
      return "completion";
    } else if (assignment.status === "accepted" && !assignment.submittedAt) {
      // Check if user has accepted but not submitted - show appropriate step
      return "guidelines";
    }
    return "request";
  });

  const [reviewStatus, setReviewStatus] = useState<ReviewerAssignment["status"]>(assignment.status);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysRemaining = (dueDate: string | null): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(assignment.dueDate);
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  const handleStepComplete = (step: ReviewStep, nextStep?: ReviewStep) => {
    if (nextStep) {
      setCurrentStep(nextStep);
    } else {
      // Auto-advance to next step
      const stepOrder: ReviewStep[] = ["request", "guidelines", "download", "completion"];
      const currentIndex = stepOrder.indexOf(step);
      if (currentIndex < stepOrder.length - 1) {
        setCurrentStep(stepOrder[currentIndex + 1]);
      }
    }
  };

  const handleStatusChange = (newStatus: ReviewerAssignment["status"]) => {
    setReviewStatus(newStatus);
  };

  // OJS PKP 3.3 Tabs Structure
  const tabs: Array<{ key: ReviewStep; label: string; completed: boolean }> = useMemo(() => {
    const completedSteps: ReviewStep[] = [];
    
    if (reviewStatus !== "pending") {
      completedSteps.push("request");
    }
    if (reviewStatus === "accepted") {
      completedSteps.push("guidelines");
    }
    if (reviewStatus === "completed" || reviewStatus === "declined") {
      completedSteps.push("request", "guidelines", "download");
    }
    
    return [
      { key: "request", label: "Request", completed: completedSteps.includes("request") },
      { key: "guidelines", label: "Guidelines", completed: completedSteps.includes("guidelines") },
      { key: "download", label: "Download", completed: completedSteps.includes("download") },
      { key: "completion", label: "Completion", completed: reviewStatus === "completed" || reviewStatus === "declined" },
    ];
  }, [reviewStatus]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* OJS PKP 3.3 Style Header */}
      <div style={{
        borderBottom: '2px solid #e5e5e5',
        paddingBottom: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              Review Submission
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#666',
              margin: 0
            }}>
              {assignment.submissionTitle}
            </p>
          </div>
          <button
            onClick={() => router.push("/reviewer/assignments")}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: 'transparent',
              border: '1px solid #d5d5d5',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#006798'
            }}
          >
            Back to Assignments
          </button>
        </div>
      </div>

      {/* Submission Info Card - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#002C40',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          Submission Information
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Title:</span>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333', margin: 0 }}>{assignment.submissionTitle}</p>
          </div>
          {assignment.authorNames && (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Authors:</span>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333', margin: 0 }}>{assignment.authorNames}</p>
            </div>
          )}
          {assignment.journalTitle && (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Journal:</span>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333', margin: 0 }}>{assignment.journalTitle}</p>
            </div>
          )}
          <div>
            <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Review Round:</span>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333', margin: 0 }}>Round {assignment.round}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Due Date:</span>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: isOverdue ? '#d32f2f' : '#333', margin: 0 }}>
              {formatDate(assignment.dueDate)}
              {daysRemaining !== null && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
                  ({daysRemaining > 0 ? `${daysRemaining} days remaining` : `${Math.abs(daysRemaining)} days overdue`})
                </span>
              )}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Status:</span>
            <span style={{
              display: 'inline-block',
              padding: '0.125rem 0.5rem',
              fontSize: '0.75rem',
              borderRadius: '4px',
              backgroundColor: reviewStatus === "completed"
                ? '#d4edda'
                : reviewStatus === "declined"
                ? '#e2e3e5'
                : reviewStatus === "accepted"
                ? '#d1ecf1'
                : '#fff3cd',
              color: reviewStatus === "completed"
                ? '#155724'
                : reviewStatus === "declined"
                ? '#383d41'
                : reviewStatus === "accepted"
                ? '#0c5460'
                : '#856404',
              fontWeight: 600
            }}>
              {reviewStatus === "pending"
                ? "Pending"
                : reviewStatus === "accepted"
                ? "In Progress"
                : reviewStatus === "completed"
                ? "Completed"
                : reviewStatus === "declined"
                ? "Declined"
                : reviewStatus}
            </span>
          </div>
        </div>
      </div>

      {/* OJS PKP 3.3 Style Tabs - Like reviewStepHeader.tpl */}
      <div
        className="pkp_controllers_tab"
        style={{
          borderBottom: '2px solid #e5e5e5',
          backgroundColor: '#ffffff',
          padding: '0',
          marginBottom: '1.5rem',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <ul
          style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            background: 'transparent',
            alignItems: 'flex-end',
            gap: '0.25rem',
            borderBottom: 'none',
          }}
        >
          {tabs.map((tab) => {
            const isActive = currentStep === tab.key;
            
            return (
              <li key={tab.key} style={{ margin: 0, padding: 0 }}>
                <button
                  onClick={() => setCurrentStep(tab.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    lineHeight: '3rem',
                    height: '3rem',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 400,
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
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Step Content - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '2rem'
      }}>
        {currentStep === "request" && (
          <ReviewRequestStep
            assignment={assignment}
            onComplete={handleStepComplete}
            onStatusChange={handleStatusChange}
          />
        )}
        {currentStep === "guidelines" && (
          <ReviewGuidelinesStep
            assignment={assignment}
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === "download" && (
          <ReviewDownloadStep
            assignment={assignment}
            onComplete={handleStepComplete}
            onStatusChange={handleStatusChange}
          />
        )}
        {currentStep === "completion" && (
          <ReviewConfirmationStep
            assignment={assignment}
            status={reviewStatus}
          />
        )}
      </div>
    </div>
  );
}
