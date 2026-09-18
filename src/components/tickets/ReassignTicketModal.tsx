import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAdminUpdateTicket } from '@/api/hooks/useAdminTickets';
import { useUserSearch } from '@/api/hooks/useUsers';
import { SearchInput } from '@/components/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { filterUsersByNameOrEmail } from '@/lib/filterUsersClient';
import { cn } from '@/lib/cn';
import type { Ticket, User } from '@/types/api';

const SEARCH_DEBOUNCE_MS = 300;
const MAX_DEFAULT_ASSIGNEES = 4;

function assigneesForDisplay(admins: User[], ticket: Ticket, isSearching: boolean): User[] {
  if (isSearching) {
    return admins;
  }

  const sorted = [...admins].sort((a, b) => a.name.localeCompare(b.name));
  const currentId = ticket.assignee?.id;
  const current = currentId != null ? sorted.find((user) => user.id === currentId) : undefined;
  const rest = currentId != null ? sorted.filter((user) => user.id !== currentId) : sorted;
  const ordered = current ? [current, ...rest] : rest;

  return ordered.slice(0, MAX_DEFAULT_ASSIGNEES);
}

type ReassignTicketModalProps = {
  ticket: Ticket | null;
  admins: User[];
  onClose: () => void;
};

export function ReassignTicketModal({ ticket, admins, onClose }: ReassignTicketModalProps) {
  const { t } = useTranslation();
  const updateTicket = useAdminUpdateTicket();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout>();

  const assigneeSearchOptions = { role: 'admin' as const, excludeDisabled: true };
  const useServerSearch = debouncedQuery.trim().length >= 2;
  const searchResults = useUserSearch(debouncedQuery, assigneeSearchOptions);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const filteredAdmins = useServerSearch
    ? (searchResults.data ?? filterUsersByNameOrEmail(admins, query))
    : filterUsersByNameOrEmail(admins, query);

  const isSearching = query.trim().length > 0;
  const displayedAdmins = ticket ? assigneesForDisplay(filteredAdmins, ticket, isSearching) : [];
  const hasMoreAssignees = !isSearching && filteredAdmins.length > MAX_DEFAULT_ASSIGNEES;

  function assign(assigneeId: number | null) {
    if (!ticket) return;
    updateTicket.mutate({ id: ticket.id, input: { assignee_id: assigneeId } }, { onSuccess: onClose });
  }

  function closeAndReset() {
    setQuery('');
    setDebouncedQuery('');
    onClose();
  }

  return (
    <Modal open={ticket !== null} title={t('allTickets.reassignTitle')} onClose={closeAndReset}>
      {ticket ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-800">{ticket.title}</p>

          <SearchInput
            label={t('allTickets.searchAssignee')}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={t('allTickets.searchAssigneePlaceholder')}
            autoFocus
          />

          <ul className="max-h-64 divide-y divide-helpdesk-border overflow-auto rounded-md border border-helpdesk-border">
            <li>
              <button
                type="button"
                disabled={updateTicket.isPending}
                onClick={() => {
                  assign(null);
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50',
                  !ticket.assignee && 'font-medium text-helpdesk-primary',
                )}
              >
                {t('allTickets.unassigned')}
                {!ticket.assignee ? <span aria-hidden="true">✓</span> : null}
              </button>
            </li>
            {displayedAdmins.map((admin) => (
              <li key={admin.id}>
                <button
                  type="button"
                  disabled={updateTicket.isPending}
                  onClick={() => {
                    assign(admin.id);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50',
                    ticket.assignee?.id === admin.id && 'font-medium text-helpdesk-primary',
                  )}
                >
                  <div>
                    <div>{admin.name}</div>
                    <div className="text-xs text-slate-500">{admin.email}</div>
                  </div>
                  {ticket.assignee?.id === admin.id ? <span aria-hidden="true">✓</span> : null}
                </button>
              </li>
            ))}
            {isSearching && filteredAdmins.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">{t('allTickets.noAdminsFound')}</li>
            ) : null}
          </ul>

          {hasMoreAssignees ? (
            <p className="text-xs text-slate-500">{t('allTickets.searchForMoreAssignees')}</p>
          ) : null}

          {updateTicket.isError ? (
            <p role="alert" className="text-sm text-red-600">
              {updateTicket.error.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
