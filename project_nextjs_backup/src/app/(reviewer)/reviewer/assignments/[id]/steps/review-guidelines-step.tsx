"use client";

import { FileText } from "lucide-react";
import type { ReviewerAssignment } from "@/features/reviewer/data";

type Props = {
  assignment: ReviewerAssignment;
  onComplete: (step: "guidelines", nextStep?: "download") => void;
};

export function ReviewGuidelinesStep({ assignment, onComplete }: Props) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#002C40', margin: 0, marginBottom: '0.5rem' }}>
          Review Guidelines
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
          Please read the following guidelines before proceeding with your review.
        </p>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#002C40'
          }}>
            <FileText style={{ width: '1.25rem', height: '1.25rem' }} />
            Review Guidelines
          </h3>
          <div style={{ fontSize: '0.875rem' }}>
            <p style={{ color: '#333', marginBottom: '1rem', lineHeight: '1.6' }}>
              As a reviewer, you play a crucial role in maintaining the quality and integrity of scholarly publications. Please review the submission objectively and provide constructive feedback.
            </p>
            
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#002C40',
              marginTop: '1rem',
              marginBottom: '0.5rem'
            }}>
              Confidentiality
            </h4>
            <ul style={{
              listStyle: 'disc',
              paddingLeft: '1.5rem',
              color: '#333',
              marginBottom: '1rem',
              lineHeight: '1.6'
            }}>
              <li>All submissions are confidential</li>
              <li>Do not share the manuscript with others without permission</li>
              <li>Do not use information from the manuscript for your own research</li>
            </ul>

            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#002C40',
              marginTop: '1rem',
              marginBottom: '0.5rem'
            }}>
              Conflict of Interest
            </h4>
            <ul style={{
              listStyle: 'disc',
              paddingLeft: '1.5rem',
              color: '#333',
              marginBottom: '1rem',
              lineHeight: '1.6'
            }}>
              <li>Declare any conflicts of interest</li>
              <li>Do not review if you have a personal or financial relationship with the authors</li>
              <li>Do not review if you are in direct competition with the authors</li>
            </ul>

            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#002C40',
              marginTop: '1rem',
              marginBottom: '0.5rem'
            }}>
              Review Quality
            </h4>
            <ul style={{
              listStyle: 'disc',
              paddingLeft: '1.5rem',
              color: '#333',
              marginBottom: '1rem',
              lineHeight: '1.6'
            }}>
              <li>Provide constructive and specific feedback</li>
              <li>Focus on the quality of the research, methodology, and presentation</li>
              <li>Be objective and fair in your assessment</li>
              <li>Provide both comments to authors and confidential comments to editors</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onComplete("guidelines", "download")}
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
          Continue to Download
        </button>
      </div>
    </div>
  );
}


