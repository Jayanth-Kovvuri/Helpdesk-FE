import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMe } from '@/api/hooks/useAuth';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import { TicketTableSection } from '@/components/tickets/TicketTableSection';
import { Button } from '@/components/ui/Button';

export default function TicketsPage() {
  const { t } = useTranslation();
  const { data: user, isLoading } = useMe();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return <p>{t('app.loading')}</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('app.tickets')}</h1>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          {t('app.newTicket')}
        </Button>
      </div>

      <TicketTableSection
        kind="raised"
        userId={user.id}
        title={t('tickets.raisedByMe')}
        description={t('tickets.raisedByMeHint')}
        emptyMessage={t('tickets.raisedByMeEmpty')}
        noResultsMessage={t('tickets.noSearchResults')}
      />

      <TicketTableSection
        kind="assigned"
        userId={user.id}
        title={t('tickets.assignedToMe')}
        description={t('tickets.assignedToMeHint')}
        emptyMessage={t('tickets.assignedToMeEmpty')}
        noResultsMessage={t('tickets.noSearchResults')}
      />

      <CreateTicketModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {user.role.code === 'admin' ? (
        <p className="text-xs text-slate-500">{t('tickets.adminAssignHint')}</p>
      ) : null}
    </div>
  );
}
