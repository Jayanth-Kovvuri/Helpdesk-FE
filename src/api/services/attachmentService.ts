import { apiRequest } from '@/api/client';
import type { Attachment } from '@/types/api';

export const attachmentService = {
  list(ticketId: number, locale?: string) {
    return apiRequest<{ attachments: Attachment[] }>(
      `/tickets/${String(ticketId)}/attachments`,
      { locale },
    );
  },

  upload(ticketId: number, file: File, locale?: string) {
    const form = new FormData();
    form.append('attachment[file]', file);
    return apiRequest<{ attachment: Attachment }>(`/tickets/${String(ticketId)}/attachments`, {
      method: 'POST',
      body: form,
      locale,
    });
  },

  remove(ticketId: number, attachmentId: number) {
    return apiRequest<void>(
      `/tickets/${String(ticketId)}/attachments/${String(attachmentId)}`,
      { method: 'DELETE' },
    );
  },
};
