import { apiRequest } from '@/api/client';
import type { Ticket } from '@/types/api';

export type TicketCreateInput = {
  title: string;
  description: string;
  priority?: string;
  status?: string;
  assignee_id?: number;
  customer_id?: number;
};

export type TicketUpdateInput = Partial<TicketCreateInput>;

export const ticketService = {
  list(options?: { locale?: string; q?: string }) {
    const locale = options?.locale;
    const q = options?.q?.trim();
    const path =
      q && q.length >= 2
        ? `/tickets?${new URLSearchParams({ q }).toString()}`
        : '/tickets';
    return apiRequest<{ tickets: Ticket[] }>(path, { locale });
  },

  search(query: string, locale?: string) {
    const params = new URLSearchParams({ q: query });
    return apiRequest<{ tickets: Ticket[] }>(`/tickets/search?${params.toString()}`, {
      locale,
    });
  },

  get(id: number, locale?: string) {
    return apiRequest<{ ticket: Ticket }>(`/tickets/${String(id)}`, { locale });
  },

  create(input: TicketCreateInput, locale?: string) {
    return apiRequest<{ ticket: Ticket }>('/tickets', {
      method: 'POST',
      body: JSON.stringify({ ticket: input }),
      locale,
    });
  },

  update(id: number, input: TicketUpdateInput, locale?: string) {
    return apiRequest<{ ticket: Ticket }>(`/tickets/${String(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ ticket: input }),
      locale,
    });
  },

  remove(id: number) {
    return apiRequest<void>(`/tickets/${String(id)}`, { method: 'DELETE' });
  },
};
