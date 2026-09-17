import type { Ticket } from '@/types/api';

/** Instant filter for queries shorter than the server minimum (2 chars). */
export function filterTicketsClient(tickets: Ticket[], query: string): Ticket[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0 || q.length >= 2) {
    return tickets;
  }

  return tickets.filter((ticket) => {
    const haystack = [
      ticket.title,
      ticket.description,
      ticket.status.label,
      ticket.status.code,
      ticket.priority.label,
      ticket.priority.code,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}
