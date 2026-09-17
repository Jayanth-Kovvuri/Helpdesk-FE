import { apiRequest } from '@/api/client';
import type { User } from '@/types/api';

export const meService = {
  exportData(locale?: string) {
    return apiRequest<{ export: unknown }>('/me/export', { locale });
  },

  updatePassword(currentPassword: string, newPassword: string) {
    return apiRequest<{ user: User }>('/me', {
      method: 'PATCH',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },

  deleteAccount() {
    return apiRequest<void>('/me', { method: 'DELETE' });
  },
};
