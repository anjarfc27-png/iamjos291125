"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { Modal } from "@/components/ui/modal";
import type { SubmissionFile, SubmissionStage } from "../../types";
import type { PublicationGalley } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  stage: SubmissionStage;
  submissionVersionId: string;
  galley: PublicationGalley;
  availableFiles?: SubmissionFile[];
  onSubmit: (data: {
    galleyId: string;
    submissionVersionId: string;
    label: string;
    locale: string;
    isApproved: boolean;
    fileId?: string;
    remoteUrl?: string;
  }) => Promise<void>;
};

/**
 * Galley Editor
 * Based on OJS PKP 3.3 galley edit form
 * Used for: Edit galley metadata
 */
export function GalleyEditor({
  open,
  onClose,
  submissionId,
  stage,
  submissionVersionId,
  galley,
  availableFiles = [],
  onSubmit,
}: Props) {
  const [label, setLabel] = useState(galley.label);
  const [locale, setLocale] = useState(galley.locale);
  const [isApproved, setIsApproved] = useState(galley.isApproved);
  const [type, setType] = useState<"file" | "remote">(galley.remoteUrl ? "remote" : "file");
  const [fileId, setFileId] = useState(galley.submissionFileId || "");
  const [remoteUrl, setRemoteUrl] = useState(galley.remoteUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileOptions = availableFiles.filter((file) => file.stage === "production");

  // Update form when galley changes
  useEffect(() => {
    if (open && galley) {
      setLabel(galley.label);
      setLocale(galley.locale);
      setIsApproved(galley.isApproved);
      setFileId(galley.submissionFileId || "");
      setRemoteUrl(galley.remoteUrl || "");
      setType(galley.remoteUrl ? "remote" : "file");
    }
  }, [open, galley]);

  const handleSubmit = async () => {
    if (!label.trim()) {
      setError("Label is required");
      return;
    }

    if (type === "file" && !fileId) {
      setError("Please select a production file");
      return;
    }

    if (type === "remote" && !remoteUrl.trim()) {
      setError("Remote URL is required");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        galleyId: galley.id,
        submissionVersionId,
        label: label.trim(),
        locale,
        isApproved,
        fileId: type === "file" ? fileId : undefined,
        remoteUrl: type === "remote" ? remoteUrl.trim() : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update galley");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Galley"
      widthClassName="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Galley Label */}
        <div className="space-y-2">
          <Label htmlFor="label">Galley Label *</Label>
          <Input
            id="label"
            name="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="w-full"
          />
        </div>

        {/* Locale */}
        <div className="space-y-2">
          <Label htmlFor="locale">Locale</Label>
          <select
            id="locale"
            name="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="en">English</option>
            <option value="id">Indonesian</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        {/* Approval Status */}
        <div className="space-y-2">
          <Label>Approval Status</Label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isApproved}
              onChange={(e) => setIsApproved(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Approved</span>
          </label>
        </div>

        {/* Galley Source Type */}
        <div className="space-y-2">
          <Label>Galley Source</Label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="galley-source"
                value="file"
                checked={type === "file"}
                onChange={() => setType("file")}
              />
              Existing Production File
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="galley-source"
                value="remote"
                checked={type === "remote"}
                onChange={() => setType("remote")}
              />
              Remote URL
            </label>
          </div>
        </div>

        {type === "file" ? (
          <div className="space-y-2">
            <Label htmlFor="file">Production File *</Label>
            <select
              id="file"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              <option value="">Select production file…</option>
              {fileOptions.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.label} ({(file.size / 1024).toFixed(0)} KB)
                </option>
              ))}
            </select>
            {fileOptions.length === 0 && (
              <p className="text-xs text-[var(--muted)]">
                Tidak ada file production yang tersedia untuk galley ini.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="remoteUrl">Remote URL *</Label>
            <Input
              id="remoteUrl"
              name="remoteUrl"
              type="url"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://example.com/article.pdf"
              className="w-full"
            />
          </div>
        )}

        {error && (
          <FormMessage tone="error">{error}</FormMessage>
        )}

        {/* Form Footer */}
        <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !label.trim()}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
