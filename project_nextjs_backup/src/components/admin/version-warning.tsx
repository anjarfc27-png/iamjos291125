"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CURRENT_VERSION = "3.3.0";

export function VersionWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [currentVersion] = useState(CURRENT_VERSION);
  const [updateUrl, setUpdateUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch("/api/admin/version-check");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        
        if (data.hasUpdate && data.latestVersion) {
          setLatestVersion(data.latestVersion);
          setUpdateUrl(data.updateUrl);
          setShowWarning(true);
        }
      } catch (error) {
        console.error("Error checking version:", error);
      } finally {
        setLoading(false);
      }
    };

    checkVersion();
  }, []);

  if (loading || !showWarning || !latestVersion) {
    return null;
  }

  return (
    <div
      className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"
      style={{
        marginBottom: "1.5rem",
        borderRadius: "0.5rem",
        border: "1px solid #bfdbfe",
        backgroundColor: "#eff6ff",
        padding: "0.75rem 1rem",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3
            className="text-sm font-semibold text-blue-900"
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#1e3a8a",
              marginBottom: "0.25rem",
            }}
          >
            Upgrade Available
          </h3>
          <p
            className="text-sm text-blue-800"
            style={{
              fontSize: "0.875rem",
              color: "#1e40af",
            }}
          >
            A new version of OJS is available. You are currently using version <strong>{currentVersion}</strong>. The
            latest version is <strong>{latestVersion}</strong>.
          </p>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="ml-4 text-blue-600 hover:text-blue-800"
          style={{
            color: "#2563eb",
            fontSize: "1.25rem",
            lineHeight: "1",
          }}
          aria-label="Dismiss warning"
        >
          ×
        </button>
      </div>
      {updateUrl && (
        <div className="mt-3">
          <Link
            href={updateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-900 underline hover:text-blue-700"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#1e3a8a",
              textDecoration: "underline",
            }}
          >
            View upgrade instructions →
          </Link>
        </div>
      )}
    </div>
  );
}
