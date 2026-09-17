import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useMe } from '@/api/hooks/useAuth';
import { useSlaDashboard } from '@/api/hooks/useSlaDashboard';
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
          <Link to="/tickets/$ticketId" params={{ ticketId: String(ticket.id) }} className="hover:underline">
            {ticket.title}
          </Link>
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <span>{ticket.priority.label}</span>
            <span>{t('sla.due', { date: new Date(ticket.due_at).toLocaleString() })}</span>
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

  const dashboardQuery = useSlaDashboard(isAdmin);

  if (dashboardQuery.isLoading) return <p>{t('app.loading')}</p>;
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <p role="alert">{dashboardQuery.error?.message ?? t('app.error')}</p>;
  }

  const { counts, breached_tickets: breachedTickets, at_risk_tickets: atRiskTickets } = dashboardQuery.data;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">{t('sla.title')}</h1>

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
    </div>
  );
}
