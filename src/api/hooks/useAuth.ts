import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { sessionService } from '@/api/services/sessionService';
import { meService } from '@/api/services/meService';
import { ApiError } from '@/api/client';
import { useUiStore } from '@/stores/uiStore';

export function useMe() {
  const locale = useUiStore((state) => state.locale);

  return useQuery({
    queryKey: [...queryKeys.me, locale],
    queryFn: async () => {
      try {
        const data = await sessionService.me(locale);
        return data.user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const locale = useUiStore((state) => state.locale);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      sessionService.login(email, password, locale),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
      void queryClient.removeQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      meService.updatePassword(currentPassword, newPassword),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sessionService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
