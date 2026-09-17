import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { attachmentService } from '@/api/services/attachmentService';
import { useUiStore } from '@/stores/uiStore';

export function useAttachments(ticketId: number) {
  const locale = useUiStore((state) => state.locale);

  return useQuery({
    queryKey: [...queryKeys.attachments(ticketId), locale],
    queryFn: async () => {
      const data = await attachmentService.list(ticketId, locale);
      return data.attachments;
    },
  });
}

export function useUploadAttachment(ticketId: number) {
  const queryClient = useQueryClient();
  const locale = useUiStore((state) => state.locale);

  return useMutation({
    mutationFn: (file: File) => attachmentService.upload(ticketId, file, locale),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attachments(ticketId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
    },
  });
}

export function useDeleteAttachment(ticketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: number) => attachmentService.remove(ticketId, attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attachments(ticketId) });
    },
  });
}
