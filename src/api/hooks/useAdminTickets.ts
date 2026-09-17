import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { adminTicketService, type AdminTicketFilters } from '@/api/services/adminTicketService';
import { ticketService, type TicketUpdateInput } from '@/api/services/ticketService';

export function useAdminTickets(filters: AdminTicketFilters, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.adminTickets(filters),
    queryFn: () => adminTicketService.list(filters),
    enabled,
  });
}

export function useAdminUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TicketUpdateInput }) =>
      ticketService.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}
