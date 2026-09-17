import { apiRequest } from '@/api/client';
import type { Ticket } from '@/types/api';

export type AdminTicketFilters = {
  page?: number;
  per_page?: number;
  status?: string;
  priority?: string;
  assignee_id?: string;
  q?: string;
};

export type PaginationMeta = {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
};

export const adminTicketService = {
  list(filters: AdminTicketFilters) {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.per_page !== undefined) params.set('per_page', String(filters.per_page));
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.assignee_id) params.set('assignee_id', filters.assignee_id);
    if (filters.q) params.set('q', filters.q);

    return apiRequest<{ tickets: Ticket[]; meta: PaginationMeta }>(
      `/admin/tickets?${params.toString()}`,
    );
  },
};
