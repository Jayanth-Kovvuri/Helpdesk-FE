import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { slaService } from '@/api/services/slaService';

export function useSlaDashboard(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.slaDashboard,
    queryFn: () => slaService.dashboard(),
    enabled,
    refetchInterval: 30_000,
  });
}
