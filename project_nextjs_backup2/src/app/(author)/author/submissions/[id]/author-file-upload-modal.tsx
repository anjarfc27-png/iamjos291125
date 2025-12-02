'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PkpModal } from '@/components/ui/pkp-modal';
import { PkpButton } from '@/components/ui/pkp-button';
import { PkpInput } from '@/components/ui/pkp-input';
import { PkpSelect } from '@/components/ui/pkp-select';
import { FormMessage } from '@/components/ui/form-message';
import { useAuth } from '@/contexts/AuthContext';
import type { SubmissionStage } from '@/features/editor/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  currentStage: SubmissionStage;
};

/**
 * Author File Upload Modal
 * Simplified version for Author role - upload files to submission
 * Based on OJS PKP 3.3 file upload functionality
 */
export function AuthorFileUploadModal({ isOpen, onClose, submissionId, currentStage }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    label: '',
    file: null as File | null,
    kind: currentStage === 'submission' ? 'manuscript' : currentStage === 'review' ? 'review' : 'copyedit',
  });
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const KIND_OPTIONS = [
    { value: 'manuscript', label: 'Manuscript' },
    { value: 'review', label: 'Review File' },
    { value: 'copyedit', label: 'Copyediting' },
    { value: 'supplemental', label: 'Supplemental' },
  ];

  const handleClose = () => {
    if (isPending) return;
    setForm({ label: '', file: null, kind: currentStage === 'submission' ? 'manuscript' : currentStage === 'review' ? 'review' : 'copyedit' });
    setUploadProgress(null);
    setFeedback(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFeedback({ tone: 'error', message: 'User belum terautentikasi.' });
      return;
    }
    if (!form.label.trim()) {
      setFeedback({ tone: 'error', message: 'Label file wajib diisi.' });
      return;
    }
    if (!form.file) {
      setFeedback({ tone: 'error', message: 'Pilih file untuk diupload.' });
      return;
    }

    setFeedback(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', form.file);
      formData.append('label', form.label.trim());
      formData.append('stage', currentStage);
      formData.append('kind', form.kind);
      formData.append('uploadedBy', user.id);

      const res = await fetch(`/api/author/submissions/${submissionId}/files`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      
      if (!json.ok) {
        throw new Error(json.message || 'Gagal upload file.');
      }

      setFeedback({ tone: 'success', message: 'File berhasil diupload.' });
      setUploadProgress(null);
      
      setTimeout(() => {
        handleClose();
        startTransition(() => {
          router.refresh();
        });
      }, 1000);
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Gagal upload file.',
      });
      setUploadProgress(null);
    }
  };

  return (
    <PkpModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload File"
      size="default"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.25rem',
              }}
            >
              File Label
            </label>
            <PkpInput
              type="text"
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Masukkan label file"
              required
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.25rem',
              }}
            >
              File Kind
            </label>
            <PkpSelect
              value={form.kind}
              onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value }))}
            >
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </PkpSelect>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#002C40',
                marginBottom: '0.25rem',
              }}
            >
              File
            </label>
            <input
              type="file"
              onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d5d5d5',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
              }}
            />
            {form.file && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                Selected: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {uploadProgress !== null && (
            <div>
              <div
                style={{
                  width: '100%',
                  height: '0.5rem',
                  backgroundColor: '#e5e5e5',
                  borderRadius: '0.25rem',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: '#006798',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {feedback && (
            <FormMessage tone={feedback.tone}>
              {feedback.message}
            </FormMessage>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            <PkpButton
              type="button"
              variant="onclick"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </PkpButton>
            <PkpButton
              type="submit"
              variant="primary"
              loading={isPending || uploadProgress !== null}
              disabled={isPending || uploadProgress !== null}
            >
              Upload File
            </PkpButton>
          </div>
        </div>
      </form>
    </PkpModal>
  );
}

