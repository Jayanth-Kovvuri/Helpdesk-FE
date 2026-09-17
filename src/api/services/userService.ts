import { apiRequest } from '@/api/client';
import type { User } from '@/types/api';

export type CreateUserPayload = {
  email: string;
  password: string;
  role: 'customer' | 'admin';
};

export const userService = {
  list() {
    return apiRequest<{ users: User[] }>('/users');
  },

  create(payload: CreateUserPayload) {
    return apiRequest<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  setDisabled(userId: number, disabled: boolean) {
    return apiRequest<{ user: User }>(`/users/${String(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ disabled }),
    });
  },
};
