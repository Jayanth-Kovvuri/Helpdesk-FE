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

export type TicketUpdateInput = Partial<Omit<TicketCreateInput, 'assignee_id'>> & {
  /** null clears the assignee — omitting the key (undefined) leaves it unchanged. */
  assignee_id?: number | null;
};

export const ticketService = {
  list(options?: { locale?: string; q?: string; filter?: string; status?: string; priority?: string }) {
    const locale = options?.locale;
    const q = options?.q?.trim();
    const filter = options?.filter;
    const status = options?.status;
    const priority = options?.priority;

    const params = new URLSearchParams();
    if (q && q.length >= 2) {
      params.append('q', q);
    }
    if (filter) {
      params.append('filter', filter);
    }
    if (status) {
      params.append('status', status);
    }
    if (priority) {
      params.append('priority', priority);
    }

    const path = params.toString() ? `/tickets?${params.toString()}` : '/tickets';
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

  create(input: TicketCreateInput | FormData, locale?: string) {
    const body = input instanceof FormData ? input : JSON.stringify({ ticket: input });

    return apiRequest<{ ticket: Ticket }>('/tickets', {
      method: 'POST',
      body,
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
