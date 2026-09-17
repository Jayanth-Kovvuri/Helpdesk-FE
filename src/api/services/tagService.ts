import { apiRequest } from '@/api/client';
import type { Tag } from '@/types/api';

export const tagService = {
  listAll() {
    return apiRequest<{ tags: Tag[] }>('/tags');
  },

  listForTicket(ticketId: number) {
    return apiRequest<{ tags: Tag[] }>(`/tickets/${String(ticketId)}/tags`);
  },

  attach(ticketId: number, name: string) {
    return apiRequest<{ tags: Tag[] }>(`/tickets/${String(ticketId)}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tag: { name } }),
    });
  },

  detach(ticketId: number, tagId: number) {
    return apiRequest<void>(`/tickets/${String(ticketId)}/tags/${String(tagId)}`, {
      method: 'DELETE',
    });
  },
};
