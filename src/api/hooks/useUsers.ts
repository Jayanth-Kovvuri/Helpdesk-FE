import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { userService } from '@/api/services/userService';

export function useUsersList(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const data = await userService.list();
      return data.users;
    },
    enabled,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useSetUserDisabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, disabled }: { userId: number; disabled: boolean }) =>
      userService.setDisabled(userId, disabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}
