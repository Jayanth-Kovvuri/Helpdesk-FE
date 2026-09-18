import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMe } from '@/api/hooks/useAuth';
import { useSlaDashboard } from '@/api/hooks/useSlaDashboard';
import { SlaLogicModal } from '@/components/sla/SlaLogicModal';
import { PriorityPill } from '@/components/ui/PriorityPill';
import type { SlaTicketSummary } from '@/api/services/slaService';

function CountTile({ label, count, tone }: { label: string; count: number; tone: 'red' | 'amber' | 'green' }) {
  const toneClass = {
    red: 'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    green: 'border-green-200 bg-green-50 text-green-700',
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-3xl font-semibold">{count}</p>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

function TicketList({ tickets, emptyLabel }: { tickets: SlaTicketSummary[]; emptyLabel: string }) {
  const { t } = useTranslation();

  if (tickets.length === 0) {
    return <p className="mt-2 text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <ul className="mt-2 divide-y divide-helpdesk-border text-sm">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="flex items-center justify-between gap-3 py-2">
          <Link
            to="/tickets/$ticketId"
            params={{ ticketId: String(ticket.id) }}
            className="text-slate-800 hover:text-helpdesk-primary hover:underline"
          >
            {ticket.title}
          </Link>
          <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
            <PriorityPill priority={ticket.priority} />
            <span className="whitespace-nowrap">{t('sla.due', { date: new Date(ticket.due_at).toLocaleString() })}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function SlaDashboardPage() {
  const { t } = useTranslation();
  const { data: currentUser } = useMe();
  const isAdmin = currentUser?.role.code === 'admin';
  const [infoOpen, setInfoOpen] = useState(false);

  const dashboardQuery = useSlaDashboard(isAdmin);

  if (dashboardQuery.isLoading) return <p>{t('app.loading')}</p>;
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <p role="alert">{dashboardQuery.error?.message ?? t('app.error')}</p>;
  }

  const {
    counts,
    breached_tickets: breachedTickets,
    at_risk_tickets: atRiskTickets,
    ok_tickets: okTickets,
  } = dashboardQuery.data;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">{t('sla.title')}</h1>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-helpdesk-primary bg-white text-sm font-semibold italic text-helpdesk-primary hover:bg-blue-50"
          aria-label={t('sla.infoAriaLabel')}
          title={t('sla.infoAriaLabel')}
          onClick={() => setInfoOpen(true)}
        >
          i
        </button>
      </div>

      <SlaLogicModal open={infoOpen} onClose={() => setInfoOpen(false)} />

      <div className="grid grid-cols-3 gap-3">
        <CountTile label={t('sla.breached')} count={counts.breached} tone="red" />
        <CountTile label={t('sla.atRisk')} count={counts.at_risk} tone="amber" />
        <CountTile label={t('sla.ok')} count={counts.ok} tone="green" />
      </div>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold text-red-700">{t('sla.breached')}</h2>
        <TicketList tickets={breachedTickets} emptyLabel={t('sla.noBreached')} />
      </section>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold text-amber-700">{t('sla.atRisk')}</h2>
        <TicketList tickets={atRiskTickets} emptyLabel={t('sla.noAtRisk')} />
      </section>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold text-green-700">{t('sla.ok')}</h2>
        <TicketList tickets={okTickets} emptyLabel={t('sla.noOk')} />
      </section>
    </div>
  );
}
