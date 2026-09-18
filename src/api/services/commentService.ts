import { apiRequest } from '@/api/client';
import type { Comment } from '@/types/api';

export const commentService = {
  list(ticketId: number, locale?: string) {
    return apiRequest<{ comments: Comment[] }>(`/tickets/${String(ticketId)}/comments`, {
      locale,
    });
  },

  create(ticketId: number, body: string, locale?: string, file?: File) {
    if (file) {
      const form = new FormData();
      form.append('comment[body]', body);
      form.append('comment[file]', file);
      return apiRequest<{ comment: Comment }>(`/tickets/${String(ticketId)}/comments`, {
        method: 'POST',
        body: form,
        locale,
      });
    }

    return apiRequest<{ comment: Comment }>(`/tickets/${String(ticketId)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment: { body } }),
      locale,
    });
  },

  remove(ticketId: number, commentId: number) {
    return apiRequest<void>(`/tickets/${String(ticketId)}/comments/${String(commentId)}`, {
      method: 'DELETE',
    });
  },
};
