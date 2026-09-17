import { apiRequest } from '@/api/client';
import type { User } from '@/types/api';

export const sessionService = {
  login(email: string, password: string, locale?: string) {
    return apiRequest<{ user: User }>('/session', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      locale,
    });
  },

  logout() {
    return apiRequest<void>('/session', { method: 'DELETE' });
  },

  me(locale?: string) {
    return apiRequest<{ user: User }>('/me', { locale });
  },
};
