import type { Ticket } from '@/types/api';

export function partitionTicketsForUser(tickets: Ticket[], userId: number) {
  return {
    raisedByMe: tickets.filter((ticket) => ticket.customer.id === userId),
    assignedToMe: tickets.filter((ticket) => ticket.assignee?.id === userId),
  };
}
