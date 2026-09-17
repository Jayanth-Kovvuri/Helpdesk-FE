import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import {
  ticketService,
  type TicketCreateInput,
  type TicketUpdateInput,
} from '@/api/services/ticketService';
import { useUiStore } from '@/stores/uiStore';

function useLocale() {
  return useUiStore((state) => state.locale);
}

export function useTickets() {
  return useTicketsWithSearch('');
}

export function useTicketsWithSearch(query: string) {
  const locale = useLocale();
  const trimmed = query.trim();
  const useServerSearch = trimmed.length >= 2;

  return useQuery({
    queryKey: useServerSearch
      ? [...queryKeys.tickets.search(trimmed), locale]
      : [...queryKeys.tickets.all, locale],
    queryFn: async () => {
      const data = await ticketService.list(
        useServerSearch ? { locale, q: trimmed } : { locale },
      );
      return data.tickets;
    },
  });
}

export function useTicketSearch(query: string) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= 2;
  const queryResult = useTicketsWithSearch(query);

  return {
    ...queryResult,
    data: enabled ? queryResult.data : undefined,
    isLoading: enabled ? queryResult.isLoading : false,
    isFetching: enabled ? queryResult.isFetching : false,
  };
}

export function useTicket(id: number) {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.tickets.detail(id), locale],
    queryFn: async () => {
      const data = await ticketService.get(id, locale);
      return data.ticket;
    },
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  const locale = useLocale();

  return useMutation({
    mutationFn: (input: TicketCreateInput) => ticketService.create(input, locale),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}

export function useUpdateTicket(id: number) {
  const queryClient = useQueryClient();
  const locale = useLocale();

  return useMutation({
    mutationFn: (input: TicketUpdateInput) => ticketService.update(id, input, locale),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(id) });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}
