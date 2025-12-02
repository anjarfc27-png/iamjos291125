"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import type { ReviewerAssignment } from "@/features/reviewer/data";

type Props = {
  assignment: ReviewerAssignment;
  status: ReviewerAssignment["status"];
};

export function ReviewConfirmationStep({ assignment, status }: Props) {
  const router = useRouter();
  const isCompleted = status === "completed";
  const isDeclined = status === "declined";

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {isCompleted ? (
          <>
            <CheckCircle style={{
              width: '4rem',
              height: '4rem',
              color: '#00B24E',
              margin: '0 auto 1rem',
              display: 'block'
            }} />
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#002C40'
            }}>
              Review Submitted Successfully
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              Thank you for completing your review of "{assignment.submissionTitle}".
            </p>
          </>
        ) : isDeclined ? (
          <>
            <XCircle style={{
              width: '4rem',
              height: '4rem',
              color: '#666',
              margin: '0 auto 1rem',
              display: 'block'
            }} />
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#002C40'
            }}>
              Review Request Declined
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              You have declined to review "{assignment.submissionTitle}".
            </p>
          </>
        ) : null}
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: '#002C40'
          }}>
            Submission Information
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <div>
              <span style={{ color: '#666', display: 'block', marginBottom: '0.25rem' }}>Title:</span>
              <p style={{ fontWeight: 500, color: '#333', margin: 0 }}>{assignment.submissionTitle}</p>
            </div>
            {assignment.authorNames && (
              <div>
                <span style={{ color: '#666', display: 'block', marginBottom: '0.25rem' }}>Authors:</span>
                <p style={{ fontWeight: 500, color: '#333', margin: 0 }}>{assignment.authorNames}</p>
              </div>
            )}
            {assignment.journalTitle && (
              <div>
                <span style={{ color: '#666', display: 'block', marginBottom: '0.25rem' }}>Journal:</span>
                <p style={{ fontWeight: 500, color: '#333', margin: 0 }}>{assignment.journalTitle}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          onClick={() => router.push("/reviewer/assignments")}
          style={{
            backgroundColor: "#006798",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Assignments
        </button>
      </div>
    </div>
  );
}


