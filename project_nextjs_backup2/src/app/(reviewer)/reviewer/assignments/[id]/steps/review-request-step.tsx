"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, FileText, Calendar, Info, ExternalLink } from "lucide-react";
import type { ReviewerAssignment } from "@/features/reviewer/data";
import { acceptReviewRequest, declineReviewRequest } from "@/features/reviewer/actions";

type Props = {
  assignment: ReviewerAssignment;
  onComplete: (step: "request", nextStep?: "guidelines" | "completion") => void;
  onStatusChange: (status: ReviewerAssignment["status"]) => void;
};

export function ReviewRequestStep({ assignment, onComplete, onStatusChange }: Props) {
  const [action, setAction] = useState<"accept" | "decline" | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [competingInterestOption, setCompetingInterestOption] = useState<"no" | "has">("no");
  const [competingInterests, setCompetingInterests] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewRequestMessage, setReviewRequestMessage] = useState<string>("");
  const [reviewMethod, setReviewMethod] = useState<string>("Double-blind");

  useEffect(() => {
    // Fetch review request message and other details
    async function loadDetails() {
      try {
        const response = await fetch(`/api/reviewer/assignments/${assignment.id}/details`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.ok) {
          setReviewRequestMessage(data.reviewRequestMessage || "You have been invited to review this submission.");
          setReviewMethod(data.reviewMethod || "Double-blind");
          if (data.competingInterests) {
            setCompetingInterests(data.competingInterests);
            setCompetingInterestOption("has");
          }
        }
      } catch (err) {
        console.error("Error loading review details:", err);
      }
    }
    loadDetails();
  }, [assignment.id]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAccept = async () => {
    if (!privacyConsent && assignment.status === "pending") {
      setError("Please confirm the privacy statement to continue");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await acceptReviewRequest(assignment.id, {
        competingInterests: competingInterestOption === "has" ? competingInterests : null,
        privacyConsent,
      });

      if (!result.ok) {
        setError(result.error || "Failed to accept review request");
        return;
      }

      onStatusChange("accepted");
      onComplete("request", "guidelines");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      setError("Please provide a reason for declining the review");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await declineReviewRequest(assignment.id, declineReason);

      if (!result.ok) {
        setError(result.error || "Failed to decline review request");
        return;
      }

      onStatusChange("declined");
      onComplete("request", "completion");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isConfirmed = assignment.status === "accepted";

  return (
    <form className="pkp_form" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '1rem' }}>

      {/* Form Area - OJS PKP 3.3 Style */}
      <div className="pkp_form_area" style={{ marginBottom: '1.5rem' }}>
        {/* Review Request Message Section */}
        <div className="pkp_form_section" style={{
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#002C40',
            marginBottom: '0.75rem',
            textTransform: 'uppercase'
          }}>
            Request
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#333',
            lineHeight: '1.6',
            margin: 0,
            whiteSpace: 'pre-wrap'
          }}>
            {reviewRequestMessage || "You have been invited to review the following submission. Please review the details below and decide whether you can accept or must decline this review request."}
          </p>
        </div>

        {/* Submission Title Section */}
        <div className="pkp_form_section" style={{ marginBottom: '1rem' }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#002C40',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Submission Title
          </label>
          <div style={{
            fontSize: '0.875rem',
            color: '#333',
            margin: 0,
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '2px'
          }}>
            {assignment.submissionTitle}
          </div>
        </div>

        {/* Abstract Section */}
        {assignment.abstract && (
          <div className="pkp_form_section" style={{ marginBottom: '1rem' }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#002C40',
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              Abstract
            </label>
            <div style={{
              fontSize: '0.875rem',
              color: '#333',
              padding: '0.75rem',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '2px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {assignment.abstract}
            </div>
          </div>
        )}

        {/* Review Type Section */}
        <div className="pkp_form_section" style={{ marginBottom: '1rem' }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#002C40',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Review Type
          </label>
          <div style={{
            fontSize: '0.875rem',
            color: '#333',
            margin: 0,
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '2px'
          }}>
            {reviewMethod}
          </div>
        </div>

        {/* Review Schedule Section */}
        <div className="pkp_form_section" style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#002C40',
            marginBottom: '0.75rem',
            textTransform: 'uppercase'
          }}>
            Review Schedule
          </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{
              fontSize: '0.75rem',
              color: '#666',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              Review Request Date
            </label>
            <input
              type="text"
              value={formatDate(assignment.assignmentDate)}
              readOnly
              style={{
                fontSize: '0.875rem',
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}
            />
          </div>
          {assignment.responseDueDate && (
            <div>
              <label style={{
                fontSize: '0.75rem',
                color: '#666',
                display: 'block',
                marginBottom: '0.25rem'
              }}>
                Response Due Date
              </label>
              <input
                type="text"
                value={formatDate(assignment.responseDueDate)}
                readOnly
                style={{
                  fontSize: '0.875rem',
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          )}
          <div>
            <label style={{
              fontSize: '0.75rem',
              color: '#666',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              Review Due Date
            </label>
            <input
              type="text"
              value={formatDate(assignment.dueDate)}
              readOnly
              style={{
                fontSize: '0.875rem',
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}
            />
          </div>
        </div>
          <div style={{ marginTop: '0.5rem' }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // Show help about due dates
              }}
              style={{
                fontSize: '0.875rem',
                color: '#006798',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              <Info style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem' }} />
              About Due Dates
            </a>
          </div>
        </div>
        <br /><br />

        {/* Competing Interests Section */}
        <div className="pkp_form_section" style={{ marginBottom: '1rem' }}>
          <label style={{
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
          marginBottom: '0.75rem'
        }}>
          Please indicate whether you have any competing interests related to this submission.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input
              type="radio"
              id="noCompetingInterests"
              name="competingInterestOption"
              value="no"
              checked={competingInterestOption === "no"}
              onChange={() => {
                setCompetingInterestOption("no");
                setCompetingInterests("");
              }}
              style={{
                marginTop: '0.25rem',
                width: '1rem',
                height: '1rem',
                cursor: isConfirmed ? 'not-allowed' : 'pointer'
              }}
              disabled={isConfirmed}
            />
            <label htmlFor="noCompetingInterests" style={{
              fontWeight: 400,
              cursor: isConfirmed ? 'not-allowed' : 'pointer',
              flex: 1,
              fontSize: '0.875rem'
            }}>
              I have no competing interests
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input
              type="radio"
              id="hasCompetingInterests"
              name="competingInterestOption"
              value="has"
              checked={competingInterestOption === "has"}
              onChange={() => setCompetingInterestOption("has")}
              style={{
                marginTop: '0.25rem',
                width: '1rem',
                height: '1rem',
                cursor: isConfirmed ? 'not-allowed' : 'pointer'
              }}
              disabled={isConfirmed}
            />
            <label htmlFor="hasCompetingInterests" style={{
              fontWeight: 400,
              cursor: isConfirmed ? 'not-allowed' : 'pointer',
              flex: 1,
              fontSize: '0.875rem'
            }}>
              I have competing interests
            </label>
          </div>
        </div>
        {competingInterestOption === "has" && (
          <div style={{ marginTop: '0.75rem' }}>
            <textarea
              value={competingInterests}
              onChange={(e) => setCompetingInterests(e.target.value)}
              placeholder="Please describe your competing interests..."
              rows={4}
              disabled={isConfirmed}
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
        )}
        </div>
        <br /><br />

        {/* Privacy Consent Section */}
        {!isConfirmed && (
          <div className="pkp_form_section" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="privacyConsent"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                style={{
                  marginTop: '0.25rem',
                  width: '1rem',
                  height: '1rem',
                  cursor: 'pointer'
                }}
                required
              />
              <label htmlFor="privacyConsent" style={{
                fontWeight: 400,
                cursor: 'pointer',
                flex: 1,
                fontSize: '0.875rem'
              }}>
                I consent to the{" "}
                <a href="/about/privacy" target="_blank" style={{
                  color: '#006798',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                  privacy policy
                </a>
                <span style={{ color: '#d32f2f' }}> *</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Decline Confirmation Modal */}
      {action === "decline" && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '4px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
              <XCircle style={{ width: '1.5rem', height: '1.5rem', color: '#d32f2f', marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#002C40', marginBottom: '0.5rem' }}>
                  Decline Review Request
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                  Please provide a reason for declining this review request. This information will be shared with the editor.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="decline-reason" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#002C40' }}>
                    Reason for Declining *
                  </label>
                  <textarea
                    id="decline-reason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Please explain why you cannot complete this review..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
            {error && (
              <div style={{
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                padding: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#d32f2f', flexShrink: 0 }} />
                <p style={{ fontSize: '0.875rem', color: '#c33', margin: 0 }}>{error}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAction(null)}
                disabled={loading}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: '#006798',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={loading || !declineReason.trim()}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  backgroundColor: loading || !declineReason.trim() ? '#ccc' : '#d32f2f',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading || !declineReason.trim() ? 'not-allowed' : 'pointer',
                  color: '#fff',
                  opacity: loading || !declineReason.trim() ? 0.6 : 1
                }}
              >
                {loading ? "Declining..." : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirmation Modal */}
      {action === "accept" && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '4px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
              <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#00B24E', marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#002C40', marginBottom: '0.5rem' }}>
                  Accept Review Request
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                  By accepting this review request, you agree to:
                </p>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#333', marginBottom: '1rem' }}>
                  <li>Complete the review by the due date: {formatDate(assignment.dueDate)}</li>
                  <li>Provide constructive and objective feedback</li>
                  <li>Maintain confidentiality of the submission</li>
                  <li>Declare any conflicts of interest</li>
                </ul>
              </div>
            </div>
            {error && (
              <div style={{
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                padding: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#d32f2f', flexShrink: 0 }} />
                <p style={{ fontSize: '0.875rem', color: '#c33', margin: 0 }}>{error}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAction(null)}
                disabled={loading}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: '#006798',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={loading || (!privacyConsent && assignment.status === "pending")}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  backgroundColor: loading || (!privacyConsent && assignment.status === "pending") ? '#ccc' : '#00B24E',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading || (!privacyConsent && assignment.status === "pending") ? 'not-allowed' : 'pointer',
                  color: '#fff',
                  opacity: loading || (!privacyConsent && assignment.status === "pending") ? 0.6 : 1
                }}
              >
                {loading ? "Accepting..." : "Confirm Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Buttons - OJS PKP 3.3 Style */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e5e5',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem'
      }}>
        {action === "decline" && (
          <>
            <button
              onClick={() => setAction(null)}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#006798'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDecline}
              disabled={loading || !declineReason.trim()}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: loading || !declineReason.trim() ? '#ccc' : '#d32f2f',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !declineReason.trim() ? 'not-allowed' : 'pointer',
                color: '#fff',
                opacity: loading || !declineReason.trim() ? 0.6 : 1
              }}
            >
              {loading ? "Declining..." : "Decline Review"}
            </button>
          </>
        )}
        {action === "accept" && (
          <>
            <button
              onClick={() => setAction(null)}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#006798'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={loading || (!privacyConsent && assignment.status === "pending")}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: loading || (!privacyConsent && assignment.status === "pending") ? '#ccc' : '#00B24E',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || (!privacyConsent && assignment.status === "pending") ? 'not-allowed' : 'pointer',
                color: '#fff',
                opacity: loading || (!privacyConsent && assignment.status === "pending") ? 0.6 : 1
              }}
            >
              {loading ? "Accepting..." : "Accept Review"}
            </button>
          </>
        )}
        {!action && !isConfirmed && (
          <>
            <button
              onClick={() => setAction("decline")}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#006798'
              }}
            >
              Decline Review
            </button>
            <button
              onClick={() => setAction("accept")}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#00B24E',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              Accept Review
            </button>
          </>
        )}
        {isConfirmed && (
          <button
            onClick={() => onComplete("request", "guidelines")}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#006798',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            Save and Continue
          </button>
        )}
      </div>
      </div>
    </form>
  );
}

