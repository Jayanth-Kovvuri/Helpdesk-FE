export const queryKeys = {
  me: ['me'] as const,
  health: ['health'] as const,
  tickets: {
    all: ['tickets'] as const,
    detail: (id: number) => ['tickets', id] as const,
    search: (query: string) => ['tickets', 'search', query] as const,
  },
  comments: (ticketId: number) => ['tickets', ticketId, 'comments'] as const,
  attachments: (ticketId: number) => ['tickets', ticketId, 'attachments'] as const,
  users: ['users'] as const,
  allTags: ['tags'] as const,
  slaDashboard: ['sla-dashboard'] as const,
  adminTickets: (filters: Record<string, unknown>) => ['admin-tickets', filters] as const,
};
