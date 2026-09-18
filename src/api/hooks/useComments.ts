import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { commentService } from '@/api/services/commentService';
import { useUiStore } from '@/stores/uiStore';

export function useComments(ticketId: number) {
  const locale = useUiStore((state) => state.locale);

  return useQuery({
    queryKey: [...queryKeys.comments(ticketId), locale],
    queryFn: async () => {
      const data = await commentService.list(ticketId, locale);
      return data.comments;
    },
  });
}

export function useCreateComment(ticketId: number) {
  const queryClient = useQueryClient();
  const locale = useUiStore((state) => state.locale);

  return useMutation({
    mutationFn: ({ body, file }: { body: string; file?: File }) =>
      commentService.create(ticketId, body, locale, file),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments(ticketId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      if (variables.file) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.attachments(ticketId) });
      }
    },
  });
}

export function useDeleteComment(ticketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentService.remove(ticketId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments(ticketId) });
    },
  });
}
