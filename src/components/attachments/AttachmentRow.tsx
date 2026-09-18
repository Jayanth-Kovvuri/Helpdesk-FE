import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { isImageAttachment } from '@/lib/attachmentUtils';
import type { Attachment } from '@/types/api';

type AttachmentRowProps = {
  file: Attachment;
  deleteLabel: string;
  canDelete: boolean;
  onDelete?: () => void;
  compact?: boolean;
};

export function AttachmentRow({ file, deleteLabel, canDelete, onDelete, compact }: AttachmentRowProps) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const showImagePreview = isImageAttachment(file.content_type) && !previewFailed;

  if (showImagePreview) {
    return (
      <li className={compact ? 'space-y-1' : 'space-y-2 rounded-md border border-helpdesk-border p-2'}>
        <a href={file.url} target="_blank" rel="noreferrer" className="block">
          <img
            src={file.url}
            alt={file.filename}
            loading="lazy"
            className="max-h-48 w-full rounded-md border border-slate-200 bg-slate-50 object-contain"
            onError={() => {
              setPreviewFailed(true);
            }}
          />
        </a>
        <div className="flex items-center justify-between gap-2 text-sm">
          <a href={file.url} target="_blank" rel="noreferrer" className="truncate text-helpdesk-primary hover:underline">
            {file.filename}
          </a>
          {canDelete && onDelete ? (
            <Button variant="secondary" onClick={onDelete}>
              {deleteLabel}
            </Button>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <a href={file.url} target="_blank" rel="noreferrer" className="truncate text-helpdesk-primary hover:underline">
        {file.filename}
      </a>
      {canDelete && onDelete ? (
        <Button variant="secondary" onClick={onDelete}>
          {deleteLabel}
        </Button>
      ) : null}
    </li>
  );
}
