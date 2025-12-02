"use client";

import { useState } from "react";
import type { SubmissionDetail } from "../../../types";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  isPublished: boolean;
};

const LICENSES = [
  { value: "cc-by", label: "CC BY - Creative Commons Attribution" },
  { value: "cc-by-sa", label: "CC BY-SA - Creative Commons Attribution-ShareAlike" },
  { value: "cc-by-nc", label: "CC BY-NC - Creative Commons Attribution-NonCommercial" },
  { value: "cc-by-nc-sa", label: "CC BY-NC-SA - Creative Commons Attribution-NonCommercial-ShareAlike" },
  { value: "cc-by-nd", label: "CC BY-ND - Creative Commons Attribution-NoDerivs" },
  { value: "cc-by-nc-nd", label: "CC BY-NC-ND - Creative Commons Attribution-NonCommercial-NoDerivs" },
  { value: "copyright", label: "Copyright - All rights reserved" },
  { value: "public-domain", label: "Public Domain" },
];

export function LicenseTab({ submissionId, detail, isPublished }: Props) {
  const metadata = detail.metadata as Record<string, unknown>;
  const licenseData = (metadata.license as Record<string, unknown>) || {};

  const [license, setLicense] = useState<string>((licenseData.type as string) || "");
  const [licenseUrl, setLicenseUrl] = useState<string>((licenseData.url as string) || "");
  const [copyrightHolder, setCopyrightHolder] = useState<string>((licenseData.copyrightHolder as string) || "");
  const [copyrightYear, setCopyrightYear] = useState<string>((licenseData.copyrightYear as string) || new Date().getFullYear().toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // TODO: Save license via API
      console.log("Save license:", { license, licenseUrl, copyrightHolder, copyrightYear });
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving license:", error);
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#002C40",
          marginBottom: "0.5rem",
        }}
      >
        Publication License
      </h2>

      <form
        onSubmit={handleSave}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "1.5rem",
        }}
      >
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.84)",
            marginBottom: "0.5rem",
          }}
        >
          Set the license for this publication. The license determines how others may use your work.
        </p>

        {/* License Type */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            License Type
          </span>
          <select
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            disabled={isPublished}
            title="Select publication license"
            style={{
              height: "2.75rem",
              padding: "0 0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "pointer",
            }}
          >
            <option value="">Select a license...</option>
            {LICENSES.map((lic) => (
              <option key={lic.value} value={lic.value}>
                {lic.label}
              </option>
            ))}
          </select>
        </label>

        {/* License URL */}
        {license && (
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: "#002C40",
              }}
            >
              License URL (optional)
            </span>
            <input
              type="url"
              value={licenseUrl}
              onChange={(e) => setLicenseUrl(e.target.value)}
              placeholder="https://creativecommons.org/licenses/by/4.0/"
              disabled={isPublished}
              style={{
                height: "2.75rem",
                padding: "0 0.75rem",
                borderRadius: "0.25rem",
                border: "1px solid #e5e5e5",
                backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
                fontSize: "0.875rem",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
                outline: "none",
                cursor: isPublished ? "not-allowed" : "text",
              }}
            />
          </label>
        )}

        {/* Copyright Holder */}
        {license && license !== "public-domain" && (
          <>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                fontSize: "0.875rem",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: "#002C40",
                }}
              >
                Copyright Holder
              </span>
              <input
                type="text"
                value={copyrightHolder}
                onChange={(e) => setCopyrightHolder(e.target.value)}
                placeholder="Journal Name or Author Name"
                disabled={isPublished}
                style={{
                  height: "2.75rem",
                  padding: "0 0.75rem",
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
                  fontSize: "0.875rem",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
                  outline: "none",
                  cursor: isPublished ? "not-allowed" : "text",
                }}
              />
            </label>

            {/* Copyright Year */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                fontSize: "0.875rem",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: "#002C40",
                }}
              >
                Copyright Year
              </span>
              <input
                type="number"
                value={copyrightYear}
                onChange={(e) => setCopyrightYear(e.target.value)}
                placeholder={new Date().getFullYear().toString()}
                disabled={isPublished}
                style={{
                  height: "2.75rem",
                  padding: "0 0.75rem",
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
                  fontSize: "0.875rem",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
                  outline: "none",
                  cursor: isPublished ? "not-allowed" : "text",
                }}
              />
            </label>
          </>
        )}

        {/* Save Button */}
        {!isPublished && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="submit"
              disabled={isSaving || !license}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.25rem",
                border: "none",
                backgroundColor: isSaving || !license ? "#e5e5e5" : "#006798",
                color: isSaving || !license ? "rgba(0, 0, 0, 0.54)" : "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: isSaving || !license ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? "Saving..." : "Save License"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

