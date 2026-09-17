import type { TicketPreview } from '@/types/ticket';

export const sampleTickets: TicketPreview[] = [
  {
    id: 1,
    title: 'Email not syncing',
    description: 'Outlook stopped receiving mail this morning.',
    status: { code: 'open', label: 'Open' },
    priority: { code: 'high', label: 'High' },
  },
  {
    id: 2,
    title: 'VPN connection drops',
    description: 'Disconnects every 10 minutes on Wi‑Fi.',
    status: { code: 'in_progress', label: 'In progress' },
    priority: { code: 'medium', label: 'Medium' },
  },
];
