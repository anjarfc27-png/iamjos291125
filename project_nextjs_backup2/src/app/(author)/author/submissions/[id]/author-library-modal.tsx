'use client';

import { useMemo } from 'react';
import { PkpModal } from '@/components/ui/pkp-modal';
import { LibraryFilesPanel } from '@/features/editor/components/library-files/library-files-panel';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
};

/**
 * Author Submission Library Modal
 * Displays submission library files
 * Based on OJS PKP 3.3 submission library
 */
export function AuthorLibraryModal({ isOpen, onClose, submissionId }: Props) {
  return (
    <PkpModal
      isOpen={isOpen}
      onClose={onClose}
      title="Submission Library"
      size="large"
    >
      <div style={{ minHeight: '400px' }}>
        <LibraryFilesPanel />
      </div>
    </PkpModal>
  );
}

