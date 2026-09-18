import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useCreateTicket } from '@/api/hooks/useTickets';
import { useUsersList } from '@/api/hooks/useUsers';
import { useMe } from '@/api/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { FilePickButton } from '@/components/ui/FilePickButton';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';
import { filterUsersByNameOrEmail } from '@/lib/filterUsersClient';
import { selectFieldClass } from '@/lib/selectFieldClass';
import { ticketCreateSchema, type TicketCreateForm } from '@/schemas/ticketSchemas';

type CreateTicketModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateTicketModal({ open, onClose }: CreateTicketModalProps) {
  const { t } = useTranslation();
  const { data: currentUser } = useMe();
  const usersQuery = useUsersList(currentUser?.role.code === 'admin');
  const createTicket = useCreateTicket();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const admins = (usersQuery.data ?? []).filter((user) => user.role.code === 'admin' && !user.disabled);
  const filteredAdmins = filterUsersByNameOrEmail(admins, assigneeSearch);
  const selectedAdminName = admins.find((a) => a.id === selectedAssignee);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketCreateForm>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: { title: '', description: '', priority: 'medium' },
  });

  const closeAndReset = () => {
    reset();
    setSelectedFiles([]);
    setAssigneeSearch('');
    setSelectedAssignee(null);
    setShowAssigneeDropdown(false);
    onClose();
  };

  return (
    <Modal open={open} title={t('app.newTicket')} onClose={closeAndReset}>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          void handleSubmit((values) => {
            const formData = new FormData();
            formData.append('ticket[title]', values.title);
            formData.append('ticket[description]', values.description);
            formData.append('ticket[priority]', values.priority);

            if (selectedAssignee) {
              formData.append('ticket[assignee_id]', String(selectedAssignee));
            }

            selectedFiles.forEach((file) => {
              formData.append('ticket[attachments][]', file);
            });

            createTicket.mutate(formData as any, {
              onSuccess: () => closeAndReset(),
            });
          })(event);
        }}
      >
        <Input label={t('tickets.formTitle')} error={errors.title?.message} {...register('title')} />
        <label className="block text-sm font-medium text-slate-700">
          {t('tickets.priority')}
          <select
            className={cn(selectFieldClass, 'mt-1 w-full')}
            {...register('priority')}
          >
            <option value="low">{t('tickets.priorityLow')}</option>
            <option value="medium">{t('tickets.priorityMedium')}</option>
            <option value="high">{t('tickets.priorityHigh')}</option>
            <option value="urgent">{t('tickets.priorityUrgent')}</option>
          </select>
        </label>

        {currentUser?.role.code === 'admin' ? (
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('app.assignTo')}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('app.searchAssignee')}
                value={assigneeSearch}
                onChange={(e) => {
                  setAssigneeSearch(e.target.value);
                  setShowAssigneeDropdown(true);
                }}
                onFocus={() => setShowAssigneeDropdown(true)}
                className="w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm"
              />
              {selectedAdminName && (
                <div className="mt-1 text-xs text-slate-600">
                  {t('app.assignedTo')}: {selectedAdminName.name} ({selectedAdminName.email})
                </div>
              )}
              {showAssigneeDropdown && assigneeSearch && filteredAdmins.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-helpdesk-border rounded-md shadow-lg z-50">
                  {filteredAdmins.map((admin) => (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => {
                        setSelectedAssignee(admin.id);
                        setAssigneeSearch('');
                        setShowAssigneeDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm text-slate-700"
                    >
                      {admin.name} ({admin.email})
                    </button>
                  ))}
                </div>
              )}
              {selectedAssignee && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAssignee(null);
                    setAssigneeSearch('');
                  }}
                  className="mt-1 text-xs text-red-600 hover:text-red-700"
                >
                  {t('app.clearAssignee')}
                </button>
              )}
            </div>
          </div>
        ) : null}

        <label className="block text-sm font-medium text-slate-700">
          {t('tickets.formDescription')}
          <textarea
            className="mt-1 w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm"
            rows={4}
            {...register('description')}
          />
          {errors.description?.message ? (
            <span className="text-xs text-red-600">{errors.description.message}</span>
          ) : null}
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">{t('app.attachments')}</p>
          <FilePickButton
            label={t('attachments.addFile')}
            multiple
            onFileSelected={(files) => {
              setSelectedFiles(files);
            }}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-xs font-medium text-blue-900 mb-2">{selectedFiles.length} file(s) selected:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              {selectedFiles.map((file) => (
                <li key={file.name} className="truncate">• {file.name}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={closeAndReset}>
            {t('app.cancel')}
          </Button>
          <Button type="submit" disabled={createTicket.isPending}>
            {t('app.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
