import { createContext, useContext, type ReactNode } from 'react';

import type { TicketPreview } from '@/types/ticket';

type TicketCardContextValue = {
  ticket: TicketPreview;
};

const TicketCardContext = createContext<TicketCardContextValue | null>(null);

export function TicketCardProvider({
  ticket,
  children,
}: {
  ticket: TicketPreview;
  children: ReactNode;
}) {
  return (
    <TicketCardContext.Provider value={{ ticket }}>{children}</TicketCardContext.Provider>
  );
}

export function useTicketCard(): TicketCardContextValue {
  const ctx = useContext(TicketCardContext);
  if (!ctx) {
    throw new Error('TicketCard subcomponents must be used within TicketCard');
  }
  return ctx;
}
