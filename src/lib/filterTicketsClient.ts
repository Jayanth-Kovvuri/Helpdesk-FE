import type { Ticket } from '@/types/api';

/** Narrows the table rows to match the search box (title, description, status, priority). */
export function filterTicketsClient(tickets: Ticket[], query: string): Ticket[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
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
