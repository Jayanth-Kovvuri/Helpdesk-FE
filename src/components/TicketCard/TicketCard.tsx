import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { TicketPreview } from '@/types/ticket';

import { TicketCardProvider, useTicketCard } from './TicketCardContext';

function Root({ ticket, children }: { ticket: TicketPreview; children: ReactNode }) {
  return (
    <TicketCardProvider ticket={ticket}>
      <article
        className={cn(
          'rounded-lg border border-helpdesk-border bg-white p-4 shadow-sm',
          'transition-shadow hover:shadow-md',
        )}
      >
        {children}
      </article>
    </TicketCardProvider>
  );
}

function Header() {
  const { ticket } = useTicketCard();
  return (
    <header className="flex items-start justify-between gap-3">
      <h2 className="text-base font-semibold text-slate-900">{ticket.title}</h2>
      <Badge />
    </header>
  );
}

function Badge() {
  const { ticket } = useTicketCard();
  return (
    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
      {ticket.status.label}
    </span>
  );
}

function Body() {
  const { ticket } = useTicketCard();
  return <p className="mt-2 line-clamp-2 text-sm text-slate-600">{ticket.description}</p>;
}

function Footer() {
  const { ticket } = useTicketCard();
  return (
    <footer className="mt-3 text-xs text-slate-500">
      Priority: {ticket.priority.label}
    </footer>
  );
}

/** Compound component — compose Header / Body / Footer under shared ticket context. */
export const TicketCard = Object.assign(Root, {
  Header,
  Body,
  Footer,
});
