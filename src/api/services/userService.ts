import { apiRequest } from '@/api/client';
import type { User } from '@/types/api';

export type CreateUserPayload = {
  email: string;
  name: string;
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

  search(
    query: string,
    options?: { role?: 'admin' | 'customer'; excludeDisabled?: boolean },
  ) {
    const params = new URLSearchParams({ q: query });
    if (options?.role) {
      params.append('role', options.role);
    }
    if (options?.excludeDisabled) {
      params.append('exclude_disabled', 'true');
    }
    return apiRequest<{ users: User[] }>(`/users/search?${params.toString()}`);
  },
};
