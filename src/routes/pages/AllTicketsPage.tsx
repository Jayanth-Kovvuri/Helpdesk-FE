import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAdminTickets, useAdminUpdateTicket } from '@/api/hooks/useAdminTickets';
import { useMe } from '@/api/hooks/useAuth';
import { useUsersList } from '@/api/hooks/useUsers';
import { SearchInput } from '@/components/SearchInput';
import { ReassignTicketModal } from '@/components/tickets/ReassignTicketModal';
import { Button } from '@/components/ui/Button';
import { PriorityPill } from '@/components/ui/PriorityPill';
import { cn } from '@/lib/cn';
import { selectFieldClass } from '@/lib/selectFieldClass';
import type { Ticket } from '@/types/api';

const STATUSES = ['open', 'in_progress', 'pending', 'resolved', 'closed'] as const;
const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
const PER_PAGE = 20;

const PRIORITY_LABEL_KEYS: Record<(typeof PRIORITIES)[number], string> = {
  low: 'tickets.priorityLow',
  medium: 'tickets.priorityMedium',
  high: 'tickets.priorityHigh',
  urgent: 'tickets.priorityUrgent',
};

const STATUS_LABEL_KEYS: Record<(typeof STATUSES)[number], string> = {
  open: 'allTickets.statusOpen',
  in_progress: 'allTickets.statusInProgress',
  pending: 'allTickets.statusPending',
  resolved: 'allTickets.statusResolved',
  closed: 'allTickets.statusClosed',
};

export default function AllTicketsPage() {
  const { t } = useTranslation();
  const { data: currentUser } = useMe();
  const isAdmin = currentUser?.role.code === 'admin';

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reassignTicket, setReassignTicket] = useState<Ticket | null>(null);

  const filters = { status, priority, assignee_id: assigneeId, q: search, page, per_page: PER_PAGE };
  const ticketsQuery = useAdminTickets(filters, isAdmin);
  const usersQuery = useUsersList(isAdmin);
  const updateTicket = useAdminUpdateTicket();

  const admins = (usersQuery.data ?? []).filter((user) => user.role.code === 'admin' && !user.disabled);

  function resetToFirstPage() {
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('allTickets.title')}</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-helpdesk-border bg-white p-4">
        <div className="w-56">
          <SearchInput
            label={t('allTickets.search')}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetToFirstPage();
            }}
            placeholder={t('allTickets.searchPlaceholder')}
          />
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {t('tickets.status')}
          <select
            className={cn(selectFieldClass, 'w-40')}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              resetToFirstPage();
            }}
          >
            <option value="">{t('allTickets.allStatuses')}</option>
            {STATUSES.map((code) => (
              <option key={code} value={code}>
                {t(STATUS_LABEL_KEYS[code])}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {t('tickets.priority')}
          <select
            className={cn(selectFieldClass, 'w-40')}
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value);
              resetToFirstPage();
            }}
          >
            <option value="">{t('allTickets.allPriorities')}</option>
            {PRIORITIES.map((code) => (
              <option key={code} value={code}>
                {t(PRIORITY_LABEL_KEYS[code])}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {t('allTickets.assignee')}
          <select
            className={cn(selectFieldClass, 'w-48')}
            value={assigneeId}
            onChange={(event) => {
              setAssigneeId(event.target.value);
              resetToFirstPage();
            }}
          >
            <option value="">{t('allTickets.allAssignees')}</option>
            <option value="unassigned">{t('allTickets.unassigned')}</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.email}
              </option>
            ))}
          </select>
        </label>
      </div>

      {ticketsQuery.isLoading ? (
        <p className="text-sm text-slate-500">{t('app.loading')}</p>
      ) : ticketsQuery.isError || !ticketsQuery.data ? (
        <p role="alert" className="text-sm text-red-600">
          {ticketsQuery.error?.message ?? t('app.error')}
        </p>
      ) : (
        <>
          <div className="overflow-auto rounded-lg border border-helpdesk-border bg-white">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="w-1/3 px-3 py-2 font-medium text-slate-600">{t('tickets.formTitle')}</th>
                  <th className="w-40 px-3 py-2 font-medium text-slate-600">{t('allTickets.customer')}</th>
                  <th className="w-40 px-3 py-2 font-medium text-slate-600">{t('tickets.status')}</th>
                  <th className="w-32 px-3 py-2 font-medium text-slate-600">{t('tickets.priority')}</th>
                  <th className="w-40 px-3 py-2 font-medium text-slate-600">{t('allTickets.assignee')}</th>
                  <th className="w-32 px-3 py-2 font-medium text-slate-600">{t('allTickets.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {ticketsQuery.data.tickets.map((ticket: Ticket) => (
                  <tr key={ticket.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <Link
                        to="/tickets/$ticketId"
                        params={{ ticketId: String(ticket.id) }}
                        className="font-medium text-helpdesk-primary hover:underline"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{ticket.customer.email}</td>
                    <td className="px-3 py-2">
                      <select
                        className={cn(selectFieldClass, 'w-full py-1')}
                        value={ticket.status.code}
                        disabled={updateTicket.isPending}
                        onChange={(event) => {
                          updateTicket.mutate({ id: ticket.id, input: { status: event.target.value } });
                        }}
                      >
                        {STATUSES.map((code) => (
                          <option key={code} value={code}>
                            {t(STATUS_LABEL_KEYS[code])}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <PriorityPill priority={ticket.priority} />
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {ticket.assignee ? ticket.assignee.email : t('allTickets.unassigned')}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        onClick={() => {
                          setReassignTicket(ticket);
                        }}
                      >
                        {t('allTickets.reassign')}
                      </Button>
                    </td>
                  </tr>
                ))}
                {ticketsQuery.data.tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                      {t('allTickets.empty')}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              {ticketsQuery.data.meta.total_count === 1
                ? t('allTickets.totalCountSingular', { count: 1 })
                : t('allTickets.totalCountPlural', { count: ticketsQuery.data.meta.total_count })}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                }}
              >
                {t('allTickets.previous')}
              </Button>
              <span>
                {t('allTickets.pageOf', { page, totalPages: ticketsQuery.data.meta.total_pages || 1 })}
              </span>
              <Button
                variant="secondary"
                disabled={page >= ticketsQuery.data.meta.total_pages}
                onClick={() => {
                  setPage((current) => current + 1);
                }}
              >
                {t('allTickets.next')}
              </Button>
            </div>
          </div>
        </>
      )}

      <ReassignTicketModal
        ticket={reassignTicket}
        admins={admins}
        onClose={() => {
          setReassignTicket(null);
        }}
      />
    </div>
  );
}
