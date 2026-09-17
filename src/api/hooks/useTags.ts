import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { tagService } from '@/api/services/tagService';

export function useAllTags() {
  return useQuery({
    queryKey: queryKeys.allTags,
    queryFn: async () => {
      const data = await tagService.listAll();
      return data.tags;
    },
  });
}

export function useAttachTag(ticketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => tagService.attach(ticketId, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.allTags });
    },
  });
}

export function useDetachTag(ticketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: number) => tagService.detach(ticketId, tagId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}
