import { apiRequest } from '@/api/client';

export type HealthResponse = {
  status: 'ok' | 'degraded';
  checks: Record<string, boolean>;
};

export const healthService = {
  check() {
    return apiRequest<HealthResponse>('/health');
  },
};
