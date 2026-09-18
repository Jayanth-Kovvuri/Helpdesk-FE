import type { User } from '@/types/api';

/** Assignee picker: match name or email only (not role). */
export function filterUsersByNameOrEmail(users: User[], query: string): User[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return users;
  }

  return users.filter((user) => {
    const haystack = [user.name, user.email].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export function filterUsersClient(users: User[], query: string): User[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return users;
  }

  return users.filter((user) => {
    const haystack = [user.name, user.email, user.role.label, user.role.code].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}
