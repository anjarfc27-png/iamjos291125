"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Save } from "lucide-react";
import type { ReviewerAssignment } from "@/features/reviewer/data";
import { submitReview, saveReviewDraft } from "@/features/reviewer/actions";
import { ReviewFilesGrid } from "@/components/reviewer/review-files-grid";
import { ReviewAttachmentsGrid } from "@/components/reviewer/review-attachments-grid";
import { QueriesGrid } from "@/components/reviewer/queries-grid";

type Props = {
  assignment: ReviewerAssignment;
  onComplete: (step: "download", nextStep?: "guidelines" | "completion") => void;
  onStatusChange: (status: ReviewerAssignment["status"]) => void;
};

type Recommendation = "accept" | "minor_revision" | "major_revision" | "reject";

type ReviewFormQuestion = {
  id: string;
  question: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "dropdown";
  required: boolean;
  options?: string[];
  value: any;
};

/**
 * Review Download Step (Step 3)
 * OJS PKP 3.3 Structure: Combines files download and review form submission
 * Based on step3.tpl template
 */
export function ReviewDownloadStep({ assignment, onComplete, onStatusChange }: Props) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [commentsToAuthor, setCommentsToAuthor] = useState("");
  const [commentsToEditor, setCommentsToEditor] = useState("");
  const [competingInterests, setCompetingInterests] = useState("");
  const [reviewFormQuestions, setReviewFormQuestions] = useState<ReviewFormQuestion[]>([]);
  const [hasReviewForm, setHasReviewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load review form if exists
    async function loadReviewForm() {
      try {
        const response = await fetch(`/api/reviewer/assignments/${assignment.id}/review-form`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.ok && data.reviewForm) {
          setHasReviewForm(true);
          setReviewFormQuestions(data.reviewForm.questions || []);
        }
      } catch (err) {
        console.error("Error loading review form:", err);
      }
    }
    loadReviewForm();
  }, [assignment.id]);

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await saveReviewDraft({
        assignmentId: assignment.id,
        recommendation,
        commentsToAuthor,
        commentsToEditor,
        competingInterests,
        reviewFormResponses: reviewFormQuestions.map(q => ({
          questionId: q.id,
          value: q.value,
        })),
      });

      if (!result.ok) {
        setError(result.error || "Failed to save draft");
        return;
      }

      // Show success message
      alert("Review draft saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!recommendation) {
      setError("Please select a recommendation");
      return;
    }

    if (hasReviewForm) {
      // Validate review form questions
      const requiredQuestions = reviewFormQuestions.filter(q => q.required && !q.value);
      if (requiredQuestions.length > 0) {
        setError(`Please complete all required review form questions`);
        return;
      }
    } else {
      if (!commentsToAuthor.trim() && !commentsToEditor.trim()) {
        setError("Please provide at least comments to author or editor");
        return;
      }
    }

    if (!confirm("Are you sure you want to submit this review? You will not be able to make changes after submission.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitReview({
        assignmentId: assignment.id,
        recommendation,
        commentsToAuthor,
        commentsToEditor,
        competingInterests,
        reviewFormResponses: reviewFormQuestions.map(q => ({
          questionId: q.id,
          value: q.value,
        })),
      });

      if (!result.ok) {
        setError(result.error || "Failed to submit review");
        return;
      }

      onStatusChange("completed");
      onComplete("download", "completion");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="pkp_form" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="pkp_form_area">

      {/* Review Files Grid - OJS PKP 3.3 Step 3 Structure */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ReviewFilesGrid assignmentId={assignment.id} />
      </div>

      {/* View Guidelines Link - OJS PKP 3.3 Step 3 Structure */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e5e5' }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#002C40',
          marginBottom: '0.75rem',
          textTransform: 'uppercase'
        }}>
          Review Guidelines
        </h3>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Navigate to guidelines step
            onComplete("download", "guidelines");
          }}
          style={{
            fontSize: '0.875rem',
            color: '#006798',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          View Review Guidelines
        </a>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem'
        }}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#d32f2f', flexShrink: 0, marginTop: '0.125rem' }} />
          <p style={{ fontSize: '0.875rem', color: '#d32f2f', margin: 0 }}>{error}</p>
        </div>
      )}

        {/* Review Form Questions (if exists) - OJS PKP 3.3 Step 3 Structure */}
        {hasReviewForm && reviewFormQuestions.length > 0 && (
          <div className="pkp_form_section" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#002C40',
              marginBottom: '1rem'
            }}>
              {reviewFormQuestions[0]?.question ? 'Review Form' : 'Review Form Questions'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviewFormQuestions.map((question) => (
                <div key={question.id}>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#002C40',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    {question.question}
                    {question.required && <span style={{ color: '#d32f2f' }}> *</span>}
                  </label>
                  {question.type === "textarea" && (
                    <textarea
                      value={question.value || ""}
                      onChange={(e) => {
                        const updated = reviewFormQuestions.map(q =>
                          q.id === question.id ? { ...q, value: e.target.value } : q
                        );
                        setReviewFormQuestions(updated);
                      }}
                      rows={4}
                      required={question.required}
                      style={{
                        fontSize: '0.875rem',
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  )}
                  {question.type === "text" && (
                    <input
                      type="text"
                      value={question.value || ""}
                      onChange={(e) => {
                        const updated = reviewFormQuestions.map(q =>
                          q.id === question.id ? { ...q, value: e.target.value } : q
                        );
                        setReviewFormQuestions(updated);
                      }}
                      required={question.required}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    />
                  )}
                  {question.type === "radio" && question.options && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {question.options.map((option, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={question.value === option}
                            onChange={() => {
                              const updated = reviewFormQuestions.map(q =>
                                q.id === question.id ? { ...q, value: option } : q
                              );
                              setReviewFormQuestions(updated);
                            }}
                            style={{ marginTop: '0.25rem' }}
                            required={question.required}
                          />
                          <label style={{ fontSize: '0.875rem', fontWeight: 400, cursor: 'pointer' }}>{option}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation Section - OJS PKP 3.3 Step 3 Structure */}
        <div className="pkp_form_section" style={{ marginBottom: '1.5rem' }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#002C40',
            display: 'block',
            marginBottom: '0.75rem'
          }}>
            Recommendation <span style={{ color: '#d32f2f' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <input
                type="radio"
                id="accept"
                name="recommendation"
                value="accept"
                checked={recommendation === "accept"}
                onChange={(e) => setRecommendation(e.target.value as Recommendation)}
                style={{ marginTop: '0.25rem' }}
              />
              <label htmlFor="accept" style={{ fontSize: '0.875rem', fontWeight: 400, cursor: 'pointer', flex: 1 }}>
                Accept - The submission is suitable for publication with minor or no revisions
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <input
                type="radio"
                id="minor_revision"
                name="recommendation"
                value="minor_revision"
                checked={recommendation === "minor_revision"}
                onChange={(e) => setRecommendation(e.target.value as Recommendation)}
                style={{ marginTop: '0.25rem' }}
              />
              <label htmlFor="minor_revision" style={{ fontSize: '0.875rem', fontWeight: 400, cursor: 'pointer', flex: 1 }}>
                Minor Revision - The submission requires minor revisions before acceptance
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <input
                type="radio"
                id="major_revision"
                name="recommendation"
                value="major_revision"
                checked={recommendation === "major_revision"}
                onChange={(e) => setRecommendation(e.target.value as Recommendation)}
                style={{ marginTop: '0.25rem' }}
              />
              <label htmlFor="major_revision" style={{ fontSize: '0.875rem', fontWeight: 400, cursor: 'pointer', flex: 1 }}>
                Major Revision - The submission requires substantial revisions before it can be accepted
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <input
                type="radio"
                id="reject"
                name="recommendation"
                value="reject"
                checked={recommendation === "reject"}
                onChange={(e) => setRecommendation(e.target.value as Recommendation)}
                style={{ marginTop: '0.25rem' }}
              />
              <label htmlFor="reject" style={{ fontSize: '0.875rem', fontWeight: 400, cursor: 'pointer', flex: 1 }}>
                Reject - The submission is not suitable for publication
              </label>
            </div>
          </div>
        </div>
        <br /><br />

        {/* Comments (only if no review form) - OJS PKP 3.3 Step 3 Structure */}
        {!hasReviewForm && (
          <>
            {/* Comments to Author Section */}
            <div className="pkp_form_section" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="comments-author" style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#002C40',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Comments to Author
              </label>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                marginBottom: '0.5rem'
              }}>
                These comments will be shared with the authors. Please be constructive and specific.
              </p>
              <textarea
                id="comments-author"
                value={commentsToAuthor}
                onChange={(e) => setCommentsToAuthor(e.target.value)}
                placeholder="Enter your comments for the authors..."
                rows={8}
                style={{
                  fontSize: '0.875rem',
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Comments to Editor Section */}
            <div className="pkp_form_section" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="comments-editor" style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#002C40',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Confidential Comments to Editor
              </label>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                marginBottom: '0.5rem'
              }}>
                These comments are confidential and will only be seen by the editors.
              </p>
              <textarea
                id="comments-editor"
                value={commentsToEditor}
                onChange={(e) => setCommentsToEditor(e.target.value)}
                placeholder="Enter your confidential comments for the editors..."
                rows={6}
                style={{
                  fontSize: '0.875rem',
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </>
        )}

        {/* Competing Interests */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="competing-interests" style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#002C40',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Competing Interests
          </label>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            marginBottom: '0.5rem'
          }}>
            Please declare any competing interests or conflicts of interest.
          </p>
          <textarea
            id="competing-interests"
            value={competingInterests}
            onChange={(e) => setCompetingInterests(e.target.value)}
            placeholder="Enter any competing interests or conflicts of interest (leave blank if none)..."
            rows={4}
            style={{
              fontSize: '0.875rem',
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Review Attachments Section - OJS PKP 3.3 Step 3 Structure */}
        <div className="pkp_form_section" style={{ marginBottom: '1.5rem' }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#002C40',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Upload
          </label>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            marginBottom: '0.75rem'
          }}>
            You may upload files to accompany your review (optional).
          </p>
          <ReviewAttachmentsGrid assignmentId={assignment.id} disabled={assignment.status === "completed"} />
        </div>

        {/* Queries Grid Section - OJS PKP 3.3 Step 3 Structure */}
        <div className="pkp_form_section" style={{ marginBottom: '1.5rem' }}>
          <QueriesGrid submissionId={assignment.submissionId} disabled={assignment.status === "completed"} />
        </div>

      </div>

      {/* Form Buttons - OJS PKP 3.3 Style */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e5e5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: 'transparent',
            border: '1px solid #d5d5d5',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            color: '#006798',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: saving ? 0.6 : 1
          }}
        >
          <Save style={{ width: '1rem', height: '1rem' }} />
          {saving ? "Saving..." : "Save for Later"}
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !recommendation}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: loading || !recommendation ? '#ccc' : '#006798',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !recommendation ? 'not-allowed' : 'pointer',
              color: '#fff',
              opacity: loading || !recommendation ? 0.6 : 1
            }}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem' }}>
        <span style={{ color: '#d32f2f' }}>*</span> Required field
      </p>
    </form>
  );
}

