import { useTranslation } from 'react-i18next';

import { useTickets } from '@/api/hooks/useTickets';
import { VirtualTicketTable } from '@/components/tickets/VirtualTicketTable';
import { useUiStore } from '@/stores/uiStore';
import { useEffect } from 'react';

export type TicketListWidgetProps = {
  locale?: 'en' | 'es';
};

/** Embeddable ticket list for Module Federation / legacy shell hosts. */
export function TicketListWidget({ locale }: TicketListWidgetProps) {
  const { t, i18n } = useTranslation();
  const setLocale = useUiStore((state) => state.setLocale);
  const ticketsQuery = useTickets();

  useEffect(() => {
    if (locale) {
      setLocale(locale);
      void i18n.changeLanguage(locale);
    }
  }, [locale, setLocale, i18n]);

  if (ticketsQuery.isLoading) return <p>{t('app.loading')}</p>;
  if (ticketsQuery.isError) return <p role="alert">{ticketsQuery.error.message}</p>;

  return <VirtualTicketTable tickets={ticketsQuery.data ?? []} />;
}
