import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useTicketSearch } from '@/api/hooks/useTickets';
import { VirtualTicketTable } from '@/components/tickets/VirtualTicketTable';
import { SearchInput } from '@/components/SearchInput';

export default function TicketSearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { q?: string };
  const q = search.q ?? '';
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const searchQuery = useTicketSearch(q);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('app.search')}</h1>
      <SearchInput
        ref={searchRef}
        label={t('app.search')}
        defaultValue={q}
        placeholder={t('tickets.searchPlaceholder')}
        onChange={(event) => {
          void navigate({
            to: '/tickets/search',
            search: { q: event.target.value },
          });
        }}
      />
      {q.trim().length >= 2 ? (
        searchQuery.isLoading ? (
          <p>{t('app.loading')}</p>
        ) : searchQuery.isError ? (
          <p role="alert">{searchQuery.error.message}</p>
        ) : (
          <VirtualTicketTable tickets={searchQuery.data ?? []} />
        )
      ) : (
        <p className="text-sm text-slate-500">{t('tickets.searchPlaceholder')}</p>
      )}
    </div>
  );
}
