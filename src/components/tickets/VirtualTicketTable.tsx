import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { PriorityPill } from '@/components/ui/PriorityPill';
import type { Ticket } from '@/types/api';

const columnHelper = createColumnHelper<Ticket>();

type VirtualTicketTableProps = {
  tickets: Ticket[];
  /** When true, omit outer border (parent card provides chrome). */
  embedded?: boolean;
};

export function VirtualTicketTable({ tickets, embedded = false }: VirtualTicketTableProps) {
  const { t } = useTranslation();
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = [
    columnHelper.accessor('title', {
      header: () => 'Title',
      size: 320,
      cell: (info) => (
        <Link
          to="/tickets/$ticketId"
          params={{ ticketId: String(info.row.original.id) }}
          className="font-medium text-helpdesk-primary hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor((row) => row.status.label, {
      id: 'status',
      header: () => t('tickets.status'),
      size: 160,
    }),
    columnHelper.accessor((row) => row.priority, {
      id: 'priority',
      header: () => t('tickets.priority'),
      size: 140,
      cell: (info) => <PriorityPill priority={info.getValue()} />,
    }),
  ];

  const table = useReactTable({
    data: tickets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 8,
  });

  return (
    <div
      ref={parentRef}
      className={
        embedded
          ? 'max-h-[360px] overflow-auto'
          : 'max-h-[480px] overflow-auto rounded-lg border border-helpdesk-border bg-white'
      }
    >
      <table className="w-full table-fixed text-sm">
        <thead className="sticky top-0 bg-slate-50 text-left">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="px-3 py-2 font-medium text-slate-600"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody style={{ height: `${String(virtualizer.getTotalSize())}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            return (
              <tr
                key={row.id}
                className="border-t border-slate-100"
                style={{
                  position: 'absolute',
                  top: 0,
                  transform: `translateY(${String(virtualRow.start)}px)`,
                  width: '100%',
                  display: 'table',
                  tableLayout: 'fixed',
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ width: cell.column.getSize() }} className="px-3 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
