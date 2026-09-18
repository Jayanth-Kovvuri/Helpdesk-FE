import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTicketsWithSearch } from '@/api/hooks/useTickets';
import { SearchInput } from '@/components/SearchInput';
import { VirtualTicketTable } from '@/components/tickets/VirtualTicketTable';
import { Button } from '@/components/ui/Button';
import { filterTicketsClient } from '@/lib/filterTicketsClient';
import { selectFieldClass } from '@/lib/selectFieldClass';

const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 300;

type SectionKind = 'raised' | 'assigned';

type TicketTableSectionProps = {
  kind: SectionKind;
  title: string;
  description: string;
  emptyMessage: string;
  noResultsMessage: string;
};

function getFilterParam(kind: SectionKind): string {
  return kind === 'raised' ? 'raised' : 'assigned';
}

export function TicketTableSection({
  kind,
  title,
  description,
  emptyMessage,
  noResultsMessage,
}: TicketTableSectionProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout>();

  const filter = getFilterParam(kind);
  const ticketsQuery = useTicketsWithSearch(debouncedSearch, filter, status || undefined, priority || undefined);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search]);

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
    ticketsQuery.data ?? [],
    debouncedSearch,
  );

  const totalPages = Math.max(1, Math.ceil(sectionTickets.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedTickets = sectionTickets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
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
          placeholder={t('tickets.searchByTitlePlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
        />

        <div className="mt-3 flex gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={selectFieldClass}
            >
            <option value="">{t('allTickets.allStatuses')}</option>
            <option value="open">{t('allTickets.statusOpen')}</option>
            <option value="in_progress">{t('allTickets.statusInProgress')}</option>
            <option value="pending">{t('allTickets.statusPending')}</option>
            <option value="resolved">{t('allTickets.statusResolved')}</option>
            <option value="closed">{t('allTickets.statusClosed')}</option>
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className={selectFieldClass}
          >
            <option value="">{t('allTickets.allPriorities')}</option>
            <option value="low">{t('tickets.priorityLow')}</option>
            <option value="medium">{t('tickets.priorityMedium')}</option>
            <option value="high">{t('tickets.priorityHigh')}</option>
            <option value="urgent">{t('tickets.priorityUrgent')}</option>
          </select>
        </div>

        <div className="mt-3">
          {sectionTickets.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              {search.trim().length > 0 ? noResultsMessage : emptyMessage}
            </p>
          ) : (
            <VirtualTicketTable tickets={pagedTickets} embedded />
          )}
        </div>

        {sectionTickets.length > 0 ? (
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>
              {sectionTickets.length === 1
                ? t('tickets.sectionCountSingular', { count: 1 })
                : t('tickets.sectionCountPlural', { count: sectionTickets.length })}
            </span>
            {totalPages > 1 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setPage((current) => Math.max(1, current - 1));
                  }}
                >
                  {t('allTickets.previous')}
                </Button>
                <span>{t('allTickets.pageOf', { page: currentPage, totalPages })}</span>
                <Button
                  variant="secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setPage((current) => current + 1);
                  }}
                >
                  {t('allTickets.next')}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
