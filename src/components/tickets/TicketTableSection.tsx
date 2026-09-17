import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTicketsWithSearch } from '@/api/hooks/useTickets';
import { SearchInput } from '@/components/SearchInput';
import { VirtualTicketTable } from '@/components/tickets/VirtualTicketTable';
import { filterTicketsClient } from '@/lib/filterTicketsClient';
import { partitionTicketsForUser } from '@/lib/partitionTickets';
import type { Ticket } from '@/types/api';

type SectionKind = 'raised' | 'assigned';

type TicketTableSectionProps = {
  kind: SectionKind;
  userId: number;
  title: string;
  description: string;
  emptyMessage: string;
  noResultsMessage: string;
};

function ticketsForSection(tickets: Ticket[], userId: number, kind: SectionKind): Ticket[] {
  const { raisedByMe, assignedToMe } = partitionTicketsForUser(tickets, userId);
  return kind === 'raised' ? raisedByMe : assignedToMe;
}

export function TicketTableSection({
  kind,
  userId,
  title,
  description,
  emptyMessage,
  noResultsMessage,
}: TicketTableSectionProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const ticketsQuery = useTicketsWithSearch(search);

  if (ticketsQuery.isLoading) {
    return (
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <p className="text-sm text-slate-500">{t('app.loading')}</p>
      </section>
    );
  }

  if (ticketsQuery.isError) {
    return (
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <p role="alert" className="text-sm text-red-600">
          {ticketsQuery.error.message}
        </p>
      </section>
    );
  }

  const sectionTickets = filterTicketsClient(
    ticketsForSection(ticketsQuery.data ?? [], userId, kind),
    search,
  );

  const searchId = `ticket-search-${kind}`;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="rounded-lg border border-helpdesk-border bg-white p-3">
        <SearchInput
          id={searchId}
          label={t('tickets.searchInTable')}
          placeholder={t('tickets.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="mt-3">
          {sectionTickets.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              {search.trim().length > 0 ? noResultsMessage : emptyMessage}
            </p>
          ) : (
            <VirtualTicketTable tickets={sectionTickets} embedded />
          )}
        </div>

        {sectionTickets.length > 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            {sectionTickets.length === 1
              ? t('tickets.sectionCountSingular', { count: 1 })
              : t('tickets.sectionCountPlural', { count: sectionTickets.length })}
          </p>
        ) : null}
      </div>
    </section>
  );
}
